const fetchNewStrip = async () => {
	const fetchRes = await fetch(
		"https://www.hs.fi/api/laneitems/39221/list/normal/290",
		{
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.3",
			},
		},
	).then((res) => res.text());

	const imageData = JSON.parse(fetchRes);

	const firstImageUrl = imageData[0].picture.url.replace(
		"WIDTH.EXT",
		"1920.avif",
	);

	if (!firstImageUrl) {
		throw new Error("Failed to fetch image URL");
	}

	return firstImageUrl;
};

const message = async (url: string) => {
	await fetch(WEBHOOK_URL, {
		method: "POST",
		headers: {
			method: "POST",
			"content-type": "application/json",
		},
		body: JSON.stringify({ content: url }),
	});
};

const doTasks = async () => {
	const strip = await fetchNewStrip();
	await message(strip);
	return new Response(null, { status: 204 });
};

addEventListener("scheduled", (event) => {
	event.waitUntil(doTasks());
});
