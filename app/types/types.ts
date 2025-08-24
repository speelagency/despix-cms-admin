import { Timestamp } from 'firebase/firestore';

export type MediaType = 'image' | 'video';

export interface MediaItem {
	id: string;
	url: string;
	localUrl?: string;
	type: MediaType;
	duration?: number; // in seconds (optional, for videos)
}

export interface Zone {
	type: string;
	duration?: string;
	items: MediaItem[];
}

export interface Layout {
	id: string;
	name: string;
	zones: Zone[];
	template: '1-column' | '2-row' | '3-column' | string; // define layout types
}

export interface ZoneSizes {
	[key: string]: string; // zone key -> size value (e.g., "60%", "200px")
}

export interface CompiledConfig {
	layout: string;
	zones: {
		[key: string]: Zone;
	} | null;
	zoneSizes?: ZoneSizes;
}

export interface Device {
	id: string;
	name: string;
	status: string;
	type: string;
	isTouch: boolean;
	registered: Timestamp;
	lastUpdated: Timestamp;
	compiledConfig: CompiledConfig;
	adminId: string;
	activeGroupId?: string;
	resolution?: string;
}
