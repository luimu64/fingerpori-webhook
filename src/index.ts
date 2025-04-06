import { SourceType, type Strip } from "./types";
import * as util from "./util";
import { fetchSanoma } from "./sources/sanoma";
import { fetchKeskisuomalainen } from "./sources/keskisuomalainen";
import { fetchKaleva } from "./sources/kaleva";
import { sites } from "./sites";

const doTasks = async (env: Env) => {
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
		const imageHash = await util.getImageHash(st.imageUrl);
		const foundHash = await env.IMAGE_HASHES.get(imageHash);

		//check whether image has already been sent
		if (foundHash === null) {
			await util.sendToWebhook(st, env.WEBHOOK_URL);
			await env.IMAGE_HASHES.put(imageHash, st.timestamp.toString());
		}
	}

	return new Response("", { status: 200 });
};

export default {
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		ctx.waitUntil(doTasks(env));
	},
};
