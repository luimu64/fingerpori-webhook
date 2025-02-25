const fetchNewStrip = async () => {
	let response = "";
	const fetchRes = await fetch(HS_API_URL).then((res) => res.text());

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
	let status = 204;

	//fetch the new comic strip from the API
	const strip = await fetchNewStrip();
	//check if the strip was fetched successfully
	if (strip !== "") {
		//send the strip url to the webhook
		await message(strip);
	} else {
		console.error("Failed to fetch strip");
		status = 500;
	}
	return new Response(null, { status: status });
};

addEventListener("scheduled", (event) => {
	event.waitUntil(doTasks());
});
