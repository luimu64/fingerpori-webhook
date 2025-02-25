import * as cheerio from "cheerio";
import type { Strip, Source } from "../types";
import * as util from "../util";

export const fetchKaleva = async (source: Source) => {
	let response: Strip | null = null;

	const fetchRes = await fetch(source.url, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.3",
		},
	});

	const body = await fetchRes.text();
	const $ = cheerio.load(body);

	const imgElements = $("div.cartoon-strip__image.js-disable-maggio-swipe img");
	const dateElements = $("p.cartoon-strip__date");

	if (imgElements.length > 0) {
		response = {
			timestamp: util.toTimestamp(
				$(dateElements[0]).text().trim().split(" ")[1],
				true,
			),
			imageUrl: imgElements[0].attribs.src.split("?")[0] || "",
			source: source,
		};
	} else {
		throw new Error(`Failed to fetch strip from ${source.name}: ${source.url}`);
	}

	if (!util.isValidResponse(response))
		throw new Error(`Invalid response from ${source.name}: ${source.url}`);

	return response;
};
