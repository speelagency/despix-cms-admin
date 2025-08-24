'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEvent, useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const router = useRouter();
	const searchParams = useSearchParams();

	const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const res = await signInWithEmailAndPassword(email, password);
			console.log({ res });
			setEmail('');
			setPassword('');

			// Check if there's a redirect URL parameter
			const redirectUrl = searchParams.get('redirect');
			if (redirectUrl) {
				// Redirect back to the original URL with all parameters preserved
				router.push(redirectUrl);
			} else {
				// Default redirect to CMS dashboard
				router.push('/cms');
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div
			className={cn('flex flex-col gap-6', className)}
			{...props}
		>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>Enter your email below to login to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-3">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									required
									value={email}
									onChange={e => setEmail(e.target.value)}
								/>
							</div>
							<div className="grid gap-3">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
									<a
										href="#"
										className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
									>
										Forgot your password?
									</a>
								</div>
								<Input
									id="password"
									type="password"
									required
									value={password}
									onChange={e => setPassword(e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<Button
									type="submit"
									className="w-full"
								>
									Login
								</Button>
								{/* <Butt  */}
							</div>
						</div>
						<div className="mt-4 text-center text-sm">
							Don&apos;t have an account?{' '}
							<a
								href="#"
								className="underline underline-offset-4"
							>
								Sign up
							</a>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
