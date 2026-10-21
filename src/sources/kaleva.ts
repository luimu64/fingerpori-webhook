import * as cheerio from "cheerio";
import type { Strip, Source } from "../types";
import * as util from "../util";

export const fetchKaleva = async (source: Source) => {
	let response: Strip | null = null;

	const fetchRes = await fetch(source.url, {
		headers: {
			"User-Agent": util.browserUserAgent,
		},
	});

	const body = await fetchRes.text();
	const $ = cheerio.load(body);

	const imgElements = $("div.cartoon-strip__image.js-disable-maggio-swipe img");
	const dateElements = $("p.cartoon-strip__date");

	if (imgElements.length > 0) {
		response = {
			timestamp: util.date2Timestamp(
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
