'use client';

import { DeviceTable } from '@/components/device-table';
import data from '../dashboard/data.json';
import { SiteHeader } from '@/components/site-header';
import { useEffect } from 'react';
import { useGetDevices } from '@/hooks/useGetDevices';

export default function Device(hideHeader: { hideHeader?: boolean }) {
	const { devices, loading, error } = useGetDevices();

	useEffect(() => {
		if (devices.length > 0) {
			console.log(devices);
		}
	}, [devices]);

	return (
		!loading &&
		devices.length > 0 && (
			<>
				{!hideHeader && <SiteHeader label={'Dispositivos'} />}
				<DeviceTable data={devices} />
			</>
		)
	);
}
