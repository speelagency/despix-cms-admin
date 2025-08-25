import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Device } from '@/app/types/types';
import { auth, db } from '@/lib/firebase';

export const useGetDevices = () => {
	const [devices, setDevices] = useState<Device[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string | null>(auth.currentUser?.uid ?? null);

	useEffect(() => {
		const unsubscribeAuth = onAuthStateChanged(auth, user => {
			setUserId(user?.uid ?? null);
		});
		return () => unsubscribeAuth();
	}, []);

	useEffect(() => {
		if (!userId) {
			setDevices([]);
			setLoading(false);
			return;
		}

		const ref = collection(db, 'devices');
		const q = query(ref, where('adminId', '==', userId));

		const unsubscribe = onSnapshot(
			q,
			snapshot => {
				const devices: Device[] = [];
				snapshot.forEach(docSnap => {
					devices.push({
						id: docSnap.id,
						...(docSnap.data() as Omit<Device, 'id'>),
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
	}, [userId]);

	return { devices, error, loading };
};
