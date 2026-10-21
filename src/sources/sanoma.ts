import type { Strip, Source } from "../types";
import * as util from "../util";

export const fetchSanoma = async (source: Source) => {
	let response: Strip | null = null;

	// Sanoma's API rejects requests without a User-Agent (403 + HTML error page),
	// and Workers' fetch sends none by default.
	const fetchRes = await fetch(source.url, {
		headers: {
			"User-Agent": util.browserUserAgent,
			Accept: "application/json",
		},
	});

	if (!fetchRes.ok) {
		throw new Error(
			`Failed to fetch strip from ${source.name}: ${fetchRes.status} ${fetchRes.statusText} (${source.url})`,
		);
	}

	const body = await fetchRes.text();

	let imageData: any;
	try {
		imageData = JSON.parse(body);
	} catch {
		throw new Error(
			`Non-JSON response from ${source.name}: ${fetchRes.status} ${fetchRes.headers.get("content-type")} (${source.url})`,
		);
	}

	if (Array.isArray(imageData) && imageData.length > 0) {
		response = {
			timestamp: util.date2Timestamp(imageData[0].displayDate),
			imageUrl: imageData[0].picture.url.replace("WIDTH.EXT", "1920.jpg"),
			source: source,
		};
	} else {
		throw new Error(`Empty strip list from ${source.name}: ${source.url}`);
	}

	if (!util.isValidResponse(response))
		throw new Error(`Invalid response from ${source.name}: ${source.url}`);

	return response;
};
