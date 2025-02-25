import { SourceType, type Strip } from "./types";
import * as util from "./util";
import { fetchSanoma } from "./sources/sanoma";
import { fetchKeskisuomalainen } from "./sources/keskisuomalainen";
import { fetchKaleva } from "./sources/kaleva";
import { sites } from "./sites";

const doTasks = async () => {
	// go through all the sources and fetch strip from each
	const strips = await Promise.allSettled(
		sites.map(async (site) => {
			switch (site.type) {
				case SourceType.sanoma:
					return fetchSanoma(site);
				case SourceType.keskisuomalainen:
					return fetchKeskisuomalainen(site);
				case SourceType.kaleva:
					return fetchKaleva(site);
			}
		}),
	);

	//Filter out rejected promises and print them. Then filter out null values.
	const succeededStrips = strips
		.map((promise): Strip | null => {
			if (promise.status === "fulfilled") return promise.value;

			console.error(promise.reason);
			return null;
		})
		.filter((strip): strip is Strip => strip !== null);

	for (const st of succeededStrips) {
		const lastTimeFromDB = await SOURCE_TIMESTAMPS.get(st.source.name);

		//matches first time runs when the database doesn't have last sent timestamp
		if (lastTimeFromDB === null) {
			await util.sendToWebhook(st.imageUrl);
			await SOURCE_TIMESTAMPS.put(st.source.name, st.timestamp.toString());

			//matches most of the time when the database has last sent
			//timestamp and the strip is newer (+ converts to number)
		} else if (st.timestamp > +lastTimeFromDB) {
			await util.sendToWebhook(st.imageUrl);
			await SOURCE_TIMESTAMPS.put(st.source.name, st.timestamp.toString());
		}
	}

	return new Response("", { status: 200 });
};

addEventListener("scheduled", (event) => {
	event.waitUntil(doTasks());
});
