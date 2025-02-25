import type { Strip, Source } from "../types";
import * as util from "../util";

export const fetchSanoma = async (source: Source) => {
	let response: Strip | null = null;

	const fetchRes = await fetch(source.url).then((res) => res.text());

	const imageData = JSON.parse(fetchRes);

	if (imageData.length > 0) {
		response = {
			timestamp: util.toTimestamp(imageData[0].displayDate),
			imageUrl: imageData[0].picture.url.replace("WIDTH.EXT", "1920.avif"),
			source: source,
		};
	} else {
		throw new Error(`Failed to fetch strip from ${source.name}: ${source.url}`);
	}

	if (!util.isValidResponse(response))
		throw new Error(`Invalid response from ${source.name}: ${source.url}`);

	return response;
};
