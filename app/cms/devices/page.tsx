'use client';

import { DeviceTable } from '@/components/device-table';
import data from '../dashboard/data.json';
import { SiteHeader } from '@/components/site-header';
import { useEffect } from 'react';
import { useGetDevices } from '@/hooks/useGetDevices';

export default function Page() {
	const { devices, loading, error } = useGetDevices();

	useEffect(() => {
		debugger;
		if (devices.length > 0) {
			console.log(devices);
		}
	}, [devices]);

	return (
		!loading &&
		devices.length > 0 && (
			<>
				<SiteHeader label={'Dispositivos'} />
				<DeviceTable data={devices} />
			</>
		)
	);
}
