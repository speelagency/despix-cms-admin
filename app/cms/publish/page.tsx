'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/site-header';
import { CompiledConfig, MediaItem } from '@/app/types/types';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import ContentBrowser from '@/components/content-browser';
import { SelectedContentTable } from '@/components/selected-content-table';
import DeviceSelector from '@/components/device-selector';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const steps = [
	{ id: 'layout', title: 'División' },
	{ id: 'content', title: 'Contenido' },
	{ id: 'devices', title: 'Dispositivos' },
	// { id: 'design', title: 'Design' },
	// { id: 'budget', title: 'Budget' },
	// { id: 'requirements', title: 'Requirements' },
];

const layouts = [
	{ label: '2 filas', value: '2row' },
	{ label: '3 filas', value: '3row' },
	{ label: '2 columnas', value: '2col' },
	{ label: '3 columnas', value: '3col' },
];

const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
	hidden: { opacity: 0, x: 50 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
	exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const zoneMap: Record<string, string> = {
	top: 'left',
	bottom: 'right',
	middle: 'center',
	left: 'top',
	right: 'bottom',
	center: 'middle',
};

const PublishContentForm = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasResized, setHasResized] = useState(false);
	const [selectedMediaItems, setSelectedMediaItems] = useState<MediaItem[]>([]);
	const [openContentDialog, setOpenContentDialog] = useState(false);
	const [formData, setFormData] = useState<CompiledConfig>({
		layout: 'fullscreen',
		zones: null,
	});
	const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

	// const contentRef = useRef();

	const getPanelConfig = (layout: string) => {
		switch (layout) {
			case 'fullscreen':
				return { direction: 'vertical' as const, keys: ['full'], translatedKeys: ['Full'] };
			case '2row':
				return {
					direction: 'vertical' as const,
					keys: ['top', 'bottom'],
					translatedKeys: ['Arriba', 'Abajo'],
				};
			case '3row':
				return {
					direction: 'vertical' as const,
					keys: ['top', 'middle', 'bottom'],
					translatedKeys: ['Arriba', 'Medio', 'Abajo'],
				};
			case '2col':
				return {
					direction: 'horizontal' as const,
					keys: ['left', 'right'],
					translatedKeys: ['Izq', 'Der'],
				};
			case '3col':
				return {
					direction: 'horizontal' as const,
					keys: ['left', 'center', 'right'],
					translatedKeys: ['Izq', 'Centro', 'Der'],
				};
			default:
				return { direction: 'vertical' as const, keys: [], translatedKeys: [] };
		}
	};

	const { direction, keys, translatedKeys } = getPanelConfig(formData.layout);
	const [activeZone, setActiveZone] = useState('full'); // initially empty

	const updateFormData = (field: keyof CompiledConfig, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const updateZoneItems = (zoneKey: string, newItems: MediaItem[]) => {
		setFormData(prev => ({
			...prev,
			zones: {
				...prev.zones,
				[zoneKey]: {
					...prev.zones?.[zoneKey], // preserve other zone properties
					items: newItems, // overwrite the items array
				},
			},
		}));
	};

	const updateItemDuration = (url: string, newDuration: string) => {
		const zone = activeZone;

		setFormData(prev => ({
			...prev,
			zones: prev.zones
				? {
						...prev.zones,
						[zone]: {
							...prev.zones[zone],
							items: prev.zones[zone].items.map(item =>
								item.url === url ? { ...item, duration: newDuration } : item
							),
						},
				  }
				: prev.zones,
		}));
	};

	useEffect(() => {
		console.log('Nueva duración', formData);
	}, [formData]);

	const nextStep = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(prev => prev + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep(prev => prev - 1);
		}
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);

		try {
			if (!formData.layout || !formData.zones || Object.keys(formData.zones).length === 0) {
				toast.error('Completá el contenido antes de publicar.');
				setIsSubmitting(false);
				return;
			}
			if (selectedDeviceIds.length === 0) {
				toast.error('Seleccioná al menos un dispositivo.');
				setIsSubmitting(false);
				return;
			}

			debugger;
			await Promise.all(
				selectedDeviceIds.map(deviceId =>
					updateDoc(doc(db, 'devices', deviceId), { compiledConfig: formData })
				)
			);

			toast.success('Contenido publicado a dispositivos seleccionados.');
		} catch (err) {
			console.error(err);
			toast.error('Error al publicar el contenido');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Check if step is valid for next button
	const isStepValid = () => {
		switch (currentStep) {
			case 0:
				return formData.layout.trim() !== '';
			// case 1:
			// 	return Object.keys(formData.zones).length < 1;
			// case 2:
			// 	return formData.primaryGoal !== '';
			// case 3:
			// 	return formData.stylePreference !== '';
			// case 4:
			// 	return formData.budget !== '' && formData.timeline !== '';
			default:
				return true;
		}
	};

	const preventDefault = (e: React.MouseEvent) => {
		e.preventDefault();
	};

	const handleValueChange = (val: string) => {
		updateFormData('layout', val);
		setHasResized(false);

		const { keys } = getPanelConfig(val);

		// mapping rules row <-> col
		const zoneMap: Record<string, string> = {
			top: 'left',
			bottom: 'right',
			middle: 'center',
			left: 'top',
			right: 'bottom',
			center: 'middle',
		};

		setFormData((prev): CompiledConfig => {
			const newZones = Object.fromEntries(
				keys.map(key => {
					const mappedKey = zoneMap[key] ?? key;
					const oldItems = prev.zones?.[key]?.items ?? prev.zones?.[mappedKey]?.items ?? [];
					return [key, { items: oldItems }];
				})
			);

			return {
				...prev, // keep layout + zoneSizes if present
				zones: newZones, // overwrite with rebuilt zones
				layout: val, // overwrite layout
			};
		});
		setActiveZone(keys[0]);
	};

	const handleNewItems = (items: MediaItem[]) => {
		const updatedItems = items.map(item => ({
			...item,
			type: item.type.split('/')[0],
		}));

		setSelectedMediaItems(updatedItems);
		// updateZoneItems(activeZone, updatedItems);
	};

	return (
		<Dialog
			open={openContentDialog}
			onOpenChange={setOpenContentDialog}
		>
			<SiteHeader label={'Publicar Contenido'} />
			<div className="w-full max-w-4xl mx-auto py-8 px-4">
				{/* Progress indicator */}
				<motion.div
					className="mb-8 max-w-[75%] m-auto"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex justify-between mb-2">
						{steps.map((step, index) => (
							<motion.div
								key={index}
								className="flex flex-col items-center"
								whileHover={{ scale: 1.1 }}
							>
								<motion.div
									className={cn(
										'w-4 h-4 rounded-full cursor-pointer transition-colors duration-300',
										index < currentStep
											? 'bg-primary'
											: index === currentStep
											? 'bg-primary ring-4 ring-primary/20'
											: 'bg-muted'
									)}
									onClick={() => {
										// Only allow going back or to completed steps
										if (index <= currentStep) {
											setCurrentStep(index);
										}
									}}
									whileTap={{ scale: 0.95 }}
								/>
								<motion.span
									className={cn(
										'text-xs mt-1.5 hidden sm:block',
										index === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
									)}
								>
									{step.title}
								</motion.span>
							</motion.div>
						))}
					</div>
					<div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
						<motion.div
							className="h-full bg-primary"
							initial={{ width: 0 }}
							animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
							transition={{ duration: 0.3 }}
						/>
					</div>
				</motion.div>

				{/* Form card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<Card className="border shadow-md rounded-3xl overflow-hidden">
						<div>
							<AnimatePresence mode="wait">
								<motion.div
									key={currentStep}
									initial="hidden"
									animate="visible"
									exit="exit"
									variants={contentVariants}
								>
									{/* Step 1: Layout */}
									{currentStep === 0 && (
										<>
											<CardHeader>
												<CardTitle>¿Cómo querés dividir la pantalla?</CardTitle>
												<CardDescription>
													Elegí el formato en el que querés mostrar el contenido
												</CardDescription>
											</CardHeader>
											<CardContent className="my-6 mb-10 space-y-4 flex flex-wrap lg:flex-nowrap lg:justify-between gap-5">
												<motion.div
													variants={fadeInUp}
													className="flex flex-col gap-4 w-full mb-0"
												>
													<RadioGroup
														value={formData.layout}
														onValueChange={val => {
															handleValueChange(val);
														}}
													>
														<Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
															<RadioGroupItem
																value="fullscreen"
																className="border-border data-[state=checked]:border-border data-[state=checked]:text-blue-600"
															/>
															<div className="grid gap-1.5 font-normal">
																<p className="text-sm leading-none font-medium">
																	Pantalla completa
																</p>
																<p className="text-muted-foreground text-sm">
																	Mostrar en pantalla completa
																</p>
															</div>
														</Label>

														{layouts.map(item => (
															<Label
																key={item.value}
																className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
															>
																<RadioGroupItem
																	value={item.value}
																	className="border-border data-[state=checked]:border-border data-[state=checked]:text-blue-600"
																/>
																<div className="grid gap-1.5 font-normal">
																	<p className="text-sm leading-none font-medium">
																		Dividir en {item.label}
																	</p>
																	<p className="text-muted-foreground text-sm">
																		Dividir la pantalla en {item.label}
																	</p>
																</div>
															</Label>
														))}
													</RadioGroup>
												</motion.div>
												<motion.div
													variants={fadeInUp}
													className="space-y-2 w-full text-center"
												>
													<div className="h-full min-h-[300px] bg-url rounded-lg border-8">
														{(() => {
															const { direction, keys, translatedKeys } = getPanelConfig(
																formData.layout
															);
															if (keys.length === 0 || translatedKeys.length === 0) return null;

															return (
																<ResizablePanelGroup
																	key={formData.layout}
																	direction={direction}
																	onLayout={(sizes: number[]) => {
																		const { keys } = getPanelConfig(formData.layout);
																		const total = sizes.reduce((a, b) => a + b, 0);

																		let percentages = sizes.map(s => (s / total) * 100);

																		if (hasResized) {
																			// Snap to 0.5%
																			percentages = percentages.map(p => Math.round(p * 2) / 2);

																			// Fix total = 100
																			const snappedTotal = percentages.reduce((a, b) => a + b, 0);
																			if (snappedTotal !== 100) {
																				const diff = 100 - snappedTotal;
																				const largestIndex = percentages.indexOf(
																					Math.max(...percentages)
																				);
																				percentages[largestIndex] =
																					percentages[largestIndex] + diff;
																			}
																		}

																		const zoneSizes = Object.fromEntries(
																			keys.map((key, i) => [key, `${percentages[i].toFixed(1)}%`])
																		);

																		setFormData(prev => ({
																			...prev,
																			zoneSizes,
																		}));
																	}}
																>
																	{keys.map((key, i) => (
																		<Fragment key={key}>
																			<ResizablePanel
																				id={key + i}
																				order={i}
																				minSize={10}
																				className="flex flex-col items-center justify-center"
																				onResize={() => setHasResized(true)}
																			>
																				<span className="font-medium">
																					{translatedKeys[i].toUpperCase()}
																				</span>
																				{formData.zoneSizes?.[key] && (
																					<span className="text-xs text-muted-foreground">
																						{formData.zoneSizes[key]}
																					</span>
																				)}
																			</ResizablePanel>
																			{i < keys.length - 1 && (
																				<ResizableHandle
																					withHandle
																					style={{ scale: 1.25 }}
																				/>
																			)}
																		</Fragment>
																	))}
																</ResizablePanelGroup>
															);
														})()}
													</div>

													<h6 className="text-xs opacity-65">
														Opcionalmente, podés ajustar los tamaños de cada zona arrastrando la
														manija
													</h6>
												</motion.div>
											</CardContent>
										</>
									)}

									{/* Step 2: Content */}
									{currentStep === 1 && (
										<Tabs
											value={activeZone}
											onValueChange={setActiveZone}
											// defaultValue={keys[0]}
										>
											<CardHeader className="flex flex-wrap justify-between">
												<div className="flex flex-col gap-1.5">
													<CardTitle>¿Qué contenido querés mostrar?</CardTitle>
													<CardDescription>
														Elegí el contenido que querés desplegar{' '}
														{keys.length > 1 && 'en cada zona'}
													</CardDescription>
												</div>
												<TabsList>
													{keys.map((zoneKey, i) => (
														<TabsTrigger
															key={zoneKey}
															value={zoneKey}
														>
															{translatedKeys[i]} {/* friendly name */}
														</TabsTrigger>
													))}
												</TabsList>
											</CardHeader>

											{keys.map(zoneKey => (
												<TabsContent
													key={zoneKey}
													value={zoneKey}
												>
													{/* {formData.zones?.[zoneKey]?.items.map(item => (
														<div key={item.id}>{item.url}</div>
													))} */}
													<CardContent className="my-6 mb-10 space-y-4 flex flex-wrap lg:flex-nowrap lg:justify-between gap-5">
														<motion.div
															variants={fadeInUp}
															className="flex flex-col gap-4 w-full mb-0"
														>
															<h5 className="font-semibold">
																Zona {translatedKeys[keys.indexOf(zoneKey)]}
															</h5>

															<SelectedContentTable
																key={zoneKey}
																data={formData.zones?.[zoneKey]?.items ?? []}
																updateItemDuration={updateItemDuration}
															/>
														</motion.div>
														<div className="space-y-2 w-full text-center">
															<div className="h-full min-h-[300px] bg-url rounded-lg border-8">
																<div
																	className={`h-full flex ${
																		direction === 'horizontal' ? 'flex-row' : 'flex-col'
																	}`}
																>
																	{keys.map((key, i) => (
																		<Fragment key={key + i}>
																			<div
																				className={`flex items-center justify-center ${
																					activeZone !== key
																						? 'bg-accent pointer-events-none opacity-40'
																						: 'shadow-xl'
																				}`}
																				style={{
																					height:
																						formData.zoneSizes && direction === 'vertical'
																							? formData.zoneSizes[key]
																							: 'unset',
																					width:
																						formData.zoneSizes && direction === 'horizontal'
																							? formData.zoneSizes[key]
																							: 'unset',
																				}}
																			>
																				<DialogTrigger asChild>
																					<Button variant="outline">Subir contenido</Button>
																				</DialogTrigger>
																			</div>

																			{i < keys.length && (
																				<Separator
																					orientation={
																						direction === 'horizontal' ? 'vertical' : 'horizontal'
																					}
																				/>
																			)}
																		</Fragment>
																	))}
																</div>
															</div>
														</div>
													</CardContent>
												</TabsContent>
											))}
										</Tabs>
									)}

									{/* Step 2: Content */}
									{currentStep === 2 && (
										<div className="px-6">
											<DeviceSelector
												header={
													<div className="mb-2 text-sm font-medium">Elegí los dispositivos</div>
												}
												selectedDeviceIds={selectedDeviceIds}
												onChange={ids => setSelectedDeviceIds(ids)}
											/>
										</div>
									)}
								</motion.div>
							</AnimatePresence>

							<CardFooter className="flex justify-between pt-6 pb-4">
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Button
										type="button"
										variant="outline"
										onClick={prevStep}
										disabled={currentStep === 0}
										className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
									>
										<ChevronLeft className="h-4 w-4" /> Back
									</Button>
								</motion.div>
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Button
										type="button"
										onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
										// disabled={isSubmitting}
										disabled={!isStepValid() || isSubmitting}
										className={cn(
											'flex items-center gap-1 transition-all duration-300 rounded-2xl',
											currentStep === steps.length - 1 ? '' : ''
										)}
									>
										{isSubmitting ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" /> Submitting...
											</>
										) : (
											<>
												{currentStep === steps.length - 1 ? 'Submit' : 'Next'}
												{currentStep === steps.length - 1 ? (
													<Check className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
											</>
										)}
									</Button>
								</motion.div>
							</CardFooter>
						</div>
					</Card>
				</motion.div>

				{/* Step indicator */}
				<motion.div
					className="mt-4 text-center text-sm text-muted-foreground"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.4 }}
				>
					Paso {currentStep + 1} de {steps.length}: {steps[currentStep].title}
				</motion.div>
			</div>

			<DialogContent className="max-w-[90vw] sm:max-w-[90vw] h-[90vh] flex flex-col justify-between">
				<DialogHeader>
					<DialogTitle>
						Elegir contenido{' '}
						{activeZone !== 'full' &&
							'para la zona de ' +
								(activeZone.toLowerCase() === 'medio' || activeZone.toLowerCase() === 'centro'
									? 'l'
									: '') +
								translatedKeys[keys.indexOf(activeZone)].toLowerCase()}
					</DialogTitle>
					<DialogDescription>
						Elegí el contenido que querés mostrar
						{activeZone !== 'full' &&
							' en la zona de ' + translatedKeys[keys.indexOf(activeZone)].toLowerCase()}
					</DialogDescription>
				</DialogHeader>
				<div className="h-full overflow-y-scroll">
					<ContentBrowser
						selectedItems={formData.zones?.[activeZone]?.items || []}
						handleNewItems={handleNewItems}
						// ref={contentRef}
					/>
				</div>
				<DialogFooter className="items-center sm:justify-between">
					<h6>
						{selectedMediaItems.length > 0 &&
							selectedMediaItems.length +
								' archivo' +
								(selectedMediaItems.length > 1 ? 's' : '') +
								' seleccionado' +
								(selectedMediaItems.length > 1 ? 's' : '')}
					</h6>
					<div className="flex gap-4">
						<DialogClose asChild>
							<Button variant="outline">Cancelar</Button>
						</DialogClose>
						<Button
							onClick={() => {
								updateZoneItems(activeZone, [...selectedMediaItems]);
								setOpenContentDialog(false);
							}}
						>
							Guardar selección
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default PublishContentForm;
