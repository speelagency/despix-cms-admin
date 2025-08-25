'use client';

import { MediaItem } from '@/app/types/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useGetFiles } from '@/hooks/useGetFiles';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ContentBrowser({
	selectedItems,
	handleNewItems,
}: {
	selectedItems?: MediaItem[];
	handleNewItems?: (items: MediaItem[]) => void;
}) {
	const { files, refreshFiles } = useGetFiles();
	const [checkedFiles, setCheckedFiles] = useState<MediaItem[]>([]);

	useEffect(() => {
		if (selectedItems) {
			setCheckedFiles(selectedItems);
		}
	}, []);

	useEffect(() => {
		if (!handleNewItems) {
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
		} else {
			handleNewItems(checkedFiles);
		}
		// We intentionally exclude handleNewItems from deps to avoid infinite loops
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [checkedFiles]);

	return (
		<>
			<Button onClick={refreshFiles}>Refrescar contenido</Button>
			{files.length > 0 && (
				<div className="w-full">
					<div className="flex flex-1 flex-col gap-4 p-4">
						<div className="grid auto-rows-min gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
							{files.map(file => {
								return (
									<Label
										key={file.url}
										className="bg-white rounded-xl h-55 drop-shadow-lg p-1.5 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
									>
										<div className="relative bg-sidebar rounded-md w-full h-full overflow-hidden flex items-center justify-center">
											<Badge
												variant={file.type.includes('image') ? 'secondary' : 'default'}
												className="absolute top-2 left-2 z-2"
											>
												{file.contentType}
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

											{file.type.includes('image') ? (
												<Image
													src={file.url}
													fill
													style={{ objectFit: 'cover' }}
													alt=""
													sizes="(max-width: 768px) 100vw, 25vw"
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

export default ContentBrowser;
