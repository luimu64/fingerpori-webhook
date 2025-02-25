import type { Strip } from "./types";

export const toTimestamp = (dateString: string, incorrectFormat?: boolean) => {
	let dateSource = dateString;

	//needed for sources like kaleva which doesn't provide a timestamp
	if (incorrectFormat) {
		const [day, month, year] = dateSource.split(".");
		dateSource = `${year}-${month}-${day}T00:00:00Z`;
	}

	const date = new Date(dateSource);
	return Math.floor(date.getTime() / 1000);
};

export const isValidResponse = (response: Strip | null): boolean =>
	!!(response?.timestamp && response?.imageUrl && response?.source);

export const sendToWebhook = async (url: string) => {
	await fetch(WEBHOOK_URL, {
		method: "POST",
		headers: {
			method: "POST",
			"content-type": "application/json",
		},
		body: JSON.stringify({ content: url }),
	});
};
