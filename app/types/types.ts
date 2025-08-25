import { Timestamp } from 'firebase/firestore';

export type MediaType = 'image' | 'video' | string;

export interface MediaItem {
	id?: string;
	contentType?: string;
	type: MediaType;
	url: string;
	duration?: string; // in seconds (optional, for videos)
}

export interface Zone {
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
	lastUpdated: Timestamp | null;
	adminId: string;
	compiledConfig?: CompiledConfig;
	resolution?: string;
}
