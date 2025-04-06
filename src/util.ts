import { Jimp } from "jimp";
import type { Strip } from "./types";

const date2Timestamp = (dateString: string, incorrectFormat?: boolean) => {
	let dateSource = dateString;

	//needed for sources like kaleva which doesn't provide a timestamp
	if (incorrectFormat) {
		const [day, month, year] = dateSource.split(".");
		dateSource = `${year}-${month}-${day}T00:00:00Z`;
	}

	const date = new Date(dateSource);
	return Math.floor(date.getTime() / 1000);
};

const timestamp2Date = (timestamp: number) => {
	const date = new Date(timestamp * 1000);
	return date.toLocaleString("fi-FI");
};

const isValidResponse = (response: Strip | null): boolean =>
	!!(response?.timestamp && response?.imageUrl && response?.source);

const sendToWebhook = async (strip: Strip, webhook: string) => {
	await fetch(webhook, {
		method: "POST",
		headers: {
			method: "POST",
			"content-type": "application/json",
		},
		body: JSON.stringify({
			embeds: [
				{
					title: strip.source.name,
					description: `Julkaistu: ${timestamp2Date(strip.timestamp)}`,
					url: strip.imageUrl,
					image: {
						url: strip.imageUrl,
					},
				},
			],
		}),
	});
};

const getImageHash = async (url: string) => {
	const image = await Jimp.read(url);
	return image.hash(64);
};

export {
	getImageHash,
	timestamp2Date,
	date2Timestamp,
	isValidResponse,
	sendToWebhook,
};
