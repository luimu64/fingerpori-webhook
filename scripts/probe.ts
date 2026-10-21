import { fetchSanoma } from "../src/sources/sanoma";
import { fetchKeskisuomalainen } from "../src/sources/keskisuomalainen";
import { fetchKaleva } from "../src/sources/kaleva";
import { SourceType } from "../src/types";
import { sites } from "../src/sites";
import * as util from "../src/util";

for (const site of sites) {
	try {
		const strip = await (site.type === SourceType.sanoma
			? fetchSanoma(site)
			: site.type === SourceType.keskisuomalainen
				? fetchKeskisuomalainen(site)
				: fetchKaleva(site));
		const res = await fetch(strip.imageUrl);
		const hash = await util.getImageHash(strip.imageUrl);
		console.log(
			`OK   ${site.name}: ts=${strip.timestamp} (${util.timestamp2Date(strip.timestamp)}) img=${res.status} ${res.headers.get("content-type")} ${res.headers.get("content-length")} hash=${hash} url=${strip.imageUrl}`,
		);
	} catch (e) {
		console.log(`FAIL ${site.name}: ${(e as Error).message}`);
	}
}
