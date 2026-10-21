import * as cheerio from "cheerio";
import type { Strip, Source } from "../types";
import * as util from "../util";

export const fetchKeskisuomalainen = async (source: Source) => {
	let response: Strip | null = null;

	const fetchRes = await fetch(source.url, {
		headers: {
			"User-Agent": util.browserUserAgent,
		},
	});

	const body = await fetchRes.text();
	const $ = cheerio.load(body);

	const stripElements = $('div[class$="card__main-wrapper"]');

	if (stripElements.length > 0) {
		response = {
			timestamp: util.date2Timestamp(
				$(stripElements[0])
					.find('time[class$="date__published"]')
					.attr("datetime") || "",
			),
			imageUrl: $(stripElements[0]).find("img").attr("src") || "",
			source: source,
		};
	} else {
		throw new Error(`Failed to fetch strip from ${source.name}: ${source.url}`);
	}

	if (!util.isValidResponse(response))
		throw new Error(`Invalid response from ${source.name}: ${source.url}`);

	return response;
};
