const fetchNewStrip = async () => {
	let response = "";
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

	if (imageData.length > 0) {
		response = imageData[0].picture.url.replace("WIDTH.EXT", "1920.avif");
	}

	return response;
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
	if (strip !== "") await message(strip);
	return new Response(null, { status: 204 });
};

addEventListener("scheduled", (event) => {
	event.waitUntil(doTasks());
});
