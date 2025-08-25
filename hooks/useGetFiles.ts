import { useEffect, useState, useCallback } from 'react';
import { getDownloadURL, getMetadata, listAll, ref } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, storage } from '@/lib/firebase';
import { MediaItem } from '@/app/types/types';

// simple in-memory cache
let filesCache: MediaItem[] = [];

export const useGetFiles = () => {
	const [files, setFiles] = useState<MediaItem[]>(filesCache);
	const [user] = useAuthState(auth);

	const fetchContent = useCallback(async () => {
		if (!user) return;

		const storageRef = ref(storage, user.uid);
		const results = await listAll(storageRef);

		const filesArray = await Promise.all(
			results.items.map(async itemRef => {
				const data = await getMetadata(itemRef);
				const url = await getDownloadURL(itemRef);

				return {
					contentType: data.contentType,
					type: data.contentType ? data.contentType.split('/')[0] : '',
					url,
					...(data.contentType?.includes('image') ? { duration: '5' } : {}),
				};
			})
		);

		filesCache = filesArray; // update cache
		setFiles(filesArray);
	}, [user]);

	useEffect(() => {
		if (filesCache.length === 0) {
			fetchContent();
		}
	}, [fetchContent]);

	return { files, refreshFiles: fetchContent };
};
