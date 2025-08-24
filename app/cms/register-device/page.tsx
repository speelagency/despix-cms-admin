'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { SiteHeader } from '@/components/site-header';
import { Device } from '@/app/types/types';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { toast } from 'sonner';

export default function RegisterDevice() {
	const searchParams = useSearchParams();
	const [user, loading] = useAuthState(auth);
	const [registering, setRegistering] = useState(false);
	const router = useRouter();

	const [formData, setFormData] = useState<Partial<Device>>({
		name: '',
		type: '',
		status: 'waiting',
		resolution: '',
		isTouch: false,
		lastUpdated: null
	});

	// Extract URL parameters on component mount
	useEffect(() => {
		const deviceId = searchParams.get('deviceId') || '';
		const resolution = searchParams.get('resolution') || '';
		const isTouch = searchParams.get('isTouch') === 'true';

		if (!deviceId) {
			router.replace('/cms');
		}

		setFormData(prev => ({
			...prev,
			resolution,
			isTouch
		}));
	}, [searchParams]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const deviceId = searchParams.get('deviceId') || '';

		if (!user) {
			console.error('No user logged in');
			return;
		} else if (!deviceId) {
			console.error('No device id found');
			return;
		}

		// Create the complete device data with current timestamp and user ID
		const completeDeviceData: Device = {
			...(formData as Device),
			registered: Timestamp.now(),
			adminId: user.uid
		};

		const deviceRef = doc(db, 'devices', deviceId);
		const deviceSnap = await getDoc(deviceRef);

		setRegistering(true);

		if (deviceSnap.exists()) {
			// console.log("Document data:", deviceSnap.data())
			toast('Dispositivo ya existe', {
				description: 'Este dispositivo ya fue registrado'
			});
		} else {
			try {
				await setDoc(deviceRef, completeDeviceData);
				router.push('publish');
			} catch (err) {
				console.error('❌ Error registering device:', err);
				// presentToast('Hubo un error, intentá de nuevo');
				// optional: show toast or UI error
			} finally {
				setRegistering(false); // always runs
			}
		}

		setRegistering(false);
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<SiteHeader label={'Registrar dispositivo'} />
			<div className='container mx-auto p-6'>
				<div className='max-w-2xl mx-auto'>
					<Card>
						<CardHeader>
							<CardTitle>Registrá tu nuevo dispositivo</CardTitle>
							<CardDescription>
								Agregá tu nuevo dispositivo al sistema de CMS
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className='space-y-12'>
								<div className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='name'>Nombre del dispositivo</Label>
										<Input
											id='name'
											value={formData.name}
											onChange={e =>
												handleInputChange('name', e.target.value)
											}
											placeholder='Enter device name'
											required
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='type'>Tipo de dispositivo</Label>
										<Select
											value={formData.type}
											onValueChange={value =>
												handleInputChange('type', value)
											}
											required
										>
											<SelectTrigger>
												<SelectValue placeholder='Select device type' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='Totem Digital'>
													Totem Digital
												</SelectItem>
												<SelectItem value='Pantalla Vertical Doble'>
													Pantalla Vertical Doble
												</SelectItem>
												<SelectItem value='Pantalla de Escritorio'>
													Pantalla de Escritorio
												</SelectItem>
												<SelectItem value='Pantalla de Sobremesa con Cargador'>
													Pantalla de Sobremesa con Cargador
												</SelectItem>
												<SelectItem value='Pantalla de Piso'>
													Pantalla de Piso
												</SelectItem>
												<SelectItem value='Pantalla de Señalización Digital'>
													Pantalla de Señalización Digital
												</SelectItem>
												<SelectItem value='Other'>Otro</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className='flex gap-4'>
									<Button type='button' variant='outline' className='flex-1'>
										Cancel
									</Button>
									<Button
										type='submit'
										className='flex-1'
										disabled={!formData.name || !formData.type || registering}
									>
										Registrar dispositivo{' '}
										{registering && <Spinner variant='circle' />}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
