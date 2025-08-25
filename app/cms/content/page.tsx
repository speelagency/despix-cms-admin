'use client';

import { SiteHeader } from '@/components/site-header';
import ContentBrowser from '@/components/content-browser';

export default function Page() {
	return (
		<>
			<SiteHeader label={'Contenido'} />
			<ContentBrowser />
		</>
	);
}
