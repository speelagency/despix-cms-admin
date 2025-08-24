import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { Device } from '@/app/types/types';
import { db } from '@/lib/firebase';

export const useGetDevices = () => {
	const [devices, setDevices] = useState<Device[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const ref = collection(db, 'devices');

		const unsubscribe = onSnapshot(
			ref,
			snapshot => {
				const devices: Device[] = [];
				snapshot.forEach(doc => {
					devices.push({
						id: doc.id, // ✅ Firestore doc id
						...(doc.data() as Omit<Device, 'id'>)
					});
				});

				setDevices(devices);
				setLoading(false);
			},
			err => {
				setError(err);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, []);

	return { devices, error, loading };
};
