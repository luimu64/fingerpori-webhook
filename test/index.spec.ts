import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchSanoma } from "../src/sources/sanoma";
import { fetchKaleva } from "../src/sources/kaleva";
import { fetchKeskisuomalainen } from "../src/sources/keskisuomalainen";
import { SourceType, type Source } from "../src/types";

const source = (name: string, url: string, type: SourceType): Source => ({ name, url, type });

const jsonResponse = (payload: unknown, status = 200) =>
	new Response(JSON.stringify(payload), {
		status,
		headers: { "content-type": "application/json" },
	});

const htmlResponse = (html: string, status = 200) =>
	new Response(html, { status, headers: { "content-type": "text/html" } });

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("sanoma source", () => {
	const site = source("Helsingin Sanomat", "https://www.hs.fi/api/example", SourceType.sanoma);

	const apiPayload = [
		{
			displayDate: "2026-10-21T02:00:00.000+03:00",
			picture: { url: "https://images.sanoma-sndp.fi/abc/normal/WIDTH.EXT" },
		},
	];

	it("maps the latest strip and rewrites the image width placeholder", async () => {
		const fetchMock = vi.fn(async () => jsonResponse(apiPayload));
		vi.stubGlobal("fetch", fetchMock);

		const strip = await fetchSanoma(site);

		expect(strip.imageUrl).toBe("https://images.sanoma-sndp.fi/abc/normal/1920.jpg");
		expect(strip.timestamp).toBe(Math.floor(new Date("2026-10-21T02:00:00+03:00").getTime() / 1000));
		expect(strip.source.name).toBe("Helsingin Sanomat");
	});

	it("sends a User-Agent, because the API answers 403 without one", async () => {
		const fetchMock = vi.fn(async () => jsonResponse(apiPayload));
		vi.stubGlobal("fetch", fetchMock);

		await fetchSanoma(site);

		const init = fetchMock.mock.calls[0][1] as RequestInit;
		const headers = init.headers as Record<string, string>;
		expect(headers["User-Agent"]).toMatch(/Mozilla\/5\.0/);
		expect(headers.Accept).toBe("application/json");
	});

	it("reports a readable error when the API returns an HTML error page", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => htmlResponse("<!DOCTYPE html><html></html>", 403)),
		);

		await expect(fetchSanoma(site)).rejects.toThrow(/403/);
	});

	it("reports a readable error on non-JSON 200 responses", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => htmlResponse("<html><title>Virhesivu</title></html>")),
		);

		await expect(fetchSanoma(site)).rejects.toThrow(/Non-JSON response/);
	});

	it("reports an empty strip list", async () => {
		vi.stubGlobal("fetch", vi.fn(async () => jsonResponse([])));

		await expect(fetchSanoma(site)).rejects.toThrow(/Empty strip list/);
	});
});

describe("kaleva source", () => {
	const site = source("Kaleva", "https://www.kaleva.fi/sarjakuvat/fingerpori", SourceType.kaleva);

	const html = `
		<div class="container">
			<p class="cartoon-strip__date">Julkaistu 21.10.2026</p>
			<div class="cartoon-strip__image js-disable-maggio-swipe">
				<img src="https://kuvat.kaleva.media/images/v1/example.jpg?foo=bar" />
			</div>
		</div>`;

	it("reads the strip date and strips query parameters from the image url", async () => {
		vi.stubGlobal("fetch", vi.fn(async () => htmlResponse(html)));

		const strip = await fetchKaleva(site);

		expect(strip.imageUrl).toBe("https://kuvat.kaleva.media/images/v1/example.jpg");
		expect(strip.timestamp).toBe(Math.floor(new Date("2026-10-21T00:00:00Z").getTime() / 1000));
	});
});

describe("keskisuomalainen source", () => {
	const site = source("Savon Sanomat", "https://www.savonsanomat.fi/aihe/Fingerpori", SourceType.keskisuomalainen);

	const html = `
		<div class="card__main-wrapper">
			<time class="date__published" datetime="2026-10-21T07:01:12+03:00"></time>
			<img src="https://i.media.fi/incoming/example.jpg/alternates/FREE_720/example.jpg" />
		</div>`;

	it("reads the newest card's publication time and image", async () => {
		vi.stubGlobal("fetch", vi.fn(async () => htmlResponse(html)));

		const strip = await fetchKeskisuomalainen(site);

		expect(strip.imageUrl).toBe("https://i.media.fi/incoming/example.jpg/alternates/FREE_720/example.jpg");
		expect(strip.timestamp).toBe(Math.floor(new Date("2026-10-21T07:01:12+03:00").getTime() / 1000));
	});

	it("throws when no strip card is present", async () => {
		vi.stubGlobal("fetch", vi.fn(async () => htmlResponse("<html><body>maintenance</body></html>")));

		await expect(fetchKeskisuomalainen(site)).rejects.toThrow(/Failed to fetch strip/);
	});
});
