import * as cheerio from "cheerio";

const fetchNewStrip = async () => {
	const fetchRes = await fetch(
		"https://www.hs.fi/fingerpori/",
		{
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.3",
			},
		}
	);

	const body = await fetchRes.text();
	const $ = cheerio.load(body);

	const stripContainer = $("figure.cartoon.image")[0];
	const stripImageRaw = $(stripContainer).children("img").attr("data-srcset")?.replace(" 1920w", '')

	return `https:${stripImageRaw}`
}

const message = async (url: string) => {
	await fetch(WEBHOOK_URL,
		{
			method: 'POST',
			headers:
			{
				'method': 'POST',
				'content-type': 'application/json'
			},
			body: JSON.stringify({ content: url })
		})
}

const doTasks = async () => {
	const strip = await fetchNewStrip()
	await message(strip)
	return new Response(null, { status: 204 })
}

addEventListener('scheduled', event => {
	event.waitUntil(doTasks())
})