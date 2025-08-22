'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { FormEvent, useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';

const CreateAccount = () => {
	const [email, setEmail] = useState('');

	const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Generate a random one-time password
		const min = -16;
		const max = -12;
		const password = Math.random()
			.toString(36)
			.slice(Math.floor(Math.random() * (max - min)) + min);

		try {
			const res = await createUserWithEmailAndPassword(email, password);
			console.log({ res });
			setEmail('');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className={'flex flex-col gap-6'}>
					<Card>
						<CardHeader>
							<CardTitle>Crear nuevo usuario</CardTitle>
							<CardDescription>
								Ingresá el correo del usuario para crear una nueva cuenta
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit}>
								<div className="flex flex-col gap-6">
									<div className="grid gap-3">
										<Label htmlFor="email">Correo</Label>
										<Input
											id="email"
											type="email"
											placeholder="m@example.com"
											required
											value={email}
											onChange={e => setEmail(e.target.value)}
										/>
									</div>
									<div className="flex flex-col gap-3">
										<Button
											type="submit"
											className="w-full"
										>
											Crear cuenta
										</Button>
										{/* <Butt  */}
									</div>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default CreateAccount;
