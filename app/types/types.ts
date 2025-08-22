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
	id: string;
	type: string;
	items: MediaItem[];
}

export interface Layout {
	id: string;
	name: string;
	zones: Zone[];
	template: '1-column' | '2-row' | '3-column' | string; // define layout types
}

export interface CompiledConfig {
	layout: string;
	zones: {
		[key: string]: Zone;
	};
	updatedAt: string; // or Firestore Timestamp
}

export interface Device {
	deviceId: string;
	name: string;
	type: string;
	status: string;
	resolution: string;
	isTouch: boolean;
	registered: Timestamp;
	lastUpdated: Timestamp;
	compiledConfig?: CompiledConfig;
}
