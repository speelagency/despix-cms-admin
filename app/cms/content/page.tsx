'use client';

import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { auth, storage } from '@/lib/firebase';
import { getDownloadURL, getMetadata, listAll, ref } from 'firebase/storage';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'sonner';

export default function Content() {
	const [user, loading, error] = useAuthState(auth);
	const [files, setFiles] = useState<{ fileType: string; url: string }[]>([]);
	const [checkedFiles, setCheckedFiles] = useState<{ fileType: string; url: string }[]>([]);

	useEffect(() => {
		if (!loading && user) {
			fetchContent();
		}
	}, [loading, user]);

	useEffect(() => {
		if (checkedFiles.length > 0) {
			toast(
				checkedFiles.length +
					(checkedFiles.length > 1 ? ' archivos seleccionados' : ' archivo seleccionado'),
				{
					id: 'checked-files-toast',
					description:
						'Crear nuevo playlist con ' +
						(checkedFiles.length > 1 ? 'los archivos seleccionados' : 'el archivo seleccionado'),
					action: {
						label: 'Crear',
						onClick: () => console.log(checkedFiles),
					},
					duration: Infinity,
				}
			);
		} else {
			toast.dismiss('checked-files-toast');
		}
	}, [checkedFiles]);

	const fetchContent = async () => {
		const storageRef = await ref(storage, user?.uid);
		const results = await listAll(storageRef);

		const filesArray = await Promise.all(
			results.items.map(async itemRef => {
				const data = await getMetadata(itemRef);
				const url = await getDownloadURL(itemRef);

				const fileObj = {
					fileType: data.contentType ? data.contentType : '',
					url,
				};

				return fileObj;
			})
		);

		setFiles(filesArray);
	};

	return (
		<>
			<SiteHeader label={'Contenido'} />
			{files.length > 0 && (
				<div className="w-full">
					<div className="flex flex-1 flex-col gap-4 p-4">
						<div className="grid auto-rows-min gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
							{/* <div className="bg-muted/50 aspect-video rounded-xl" /> */}

							{files.map(file => {
								return (
									<Label
										key={file.url}
										className="bg-white rounded-xl h-55 drop-shadow-lg p-1.5 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
									>
										<div className="relative bg-sidebar rounded-md w-full h-full overflow-hidden flex items-center justify-center">
											{/* <Badge className="absolute top-2 left-2 z-2">
											{file.fileType.includes('image') ? 'Imagen' : 'Video'}
										</Badge> */}
											<Badge
												variant={file.fileType.includes('image') ? 'secondary' : 'default'}
												className="absolute top-2 left-2 z-2"
											>
												{file.fileType.split('/')[1]}
											</Badge>
											<Checkbox
												id="toggle-2"
												className="absolute top-2 right-2 z-2 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
												checked={checkedFiles.some(checkedFile => checkedFile.url === file.url)}
												onCheckedChange={checked => {
													if (checked) {
														setCheckedFiles(prev => [...prev, file]);
													} else {
														setCheckedFiles(prev =>
															prev.filter(checkedFile => checkedFile.url !== file.url)
														);
													}
												}}
											/>

											<div className="absolute top-0 left-0 w-full h-full z-1 inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.4),transparent_30%)] pointer-events-none" />

											{file.fileType.includes('image') ? (
												<Image
													src={file.url}
													fill
													objectFit="cover"
													alt=""
												/>
											) : (
												<video
													key={file.url}
													src={file.url}
													width={'100%'}
													controls
													className="max-h-60 object-cover"
												/>
											)}
										</div>
									</Label>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
