import { type Source, SourceType } from "./types";

export const sites: Source[] = [
	{
		name: "Helsingin Sanomat",
		url: "https://www.hs.fi/api/laneitems/39221/list/normal/290",
		type: SourceType.sanoma,
	},
	{
		name: "Savon Sanomat",
		url: "https://www.savonsanomat.fi/aihe/Fingerpori",
		type: SourceType.keskisuomalainen,
	},
	{
		name: "Karjalainen",
		url: "https://www.karjalainen.fi/aihe/Fingerpori",
		type: SourceType.keskisuomalainen,
	},
	{
		name: "Etelä-Suomen Sanomat",
		url: "https://www.ess.fi/aihe/Fingerpori",
		type: SourceType.keskisuomalainen,
	},
	{
		name: "Kaleva",
		url: "https://www.kaleva.fi/sarjakuvat/fingerpori",
		type: SourceType.kaleva,
	},
];
