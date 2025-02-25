export enum SourceType {
	keskisuomalainen = 0,
	sanoma = 1,
	kaleva = 2,
}

export type Source = {
	name: string;
	url: string;
	type: SourceType;
};

export type Strip = {
	timestamp: number;
	imageUrl: string;
	source: Source;
};
