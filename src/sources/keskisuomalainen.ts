import * as cheerio from "cheerio";
import type { Strip, Source } from "../types";
import * as util from "../util";

export const fetchKeskisuomalainen = async (source: Source) => {
	let response: Strip | null = null;

	const fetchRes = await fetch(source.url, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.3",
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
