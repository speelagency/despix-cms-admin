'use client';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { redirect, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Toaster } from 'sonner';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [user, loading, error] = useAuthState(auth);

	useEffect(() => {
		if (!loading && !user) {
			redirect('login');
		}
	}, [loading, user]);

	return !loading ? (
		// <SidebarProvider>
		// 	<AppSidebar />
		// 	<SidebarTrigger />
		// 	<main className="w-full">{children}</main>
		// </SidebarProvider>

		<SidebarProvider
			style={
				{
					'--sidebar-width': 'calc(var(--spacing) * 72)',
					'--header-height': 'calc(var(--spacing) * 12)',
				} as React.CSSProperties
			}
			className="font-sans"
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col pb-4">
						{/* <div className="@container/main flex flex-1 flex-col gap-2"> */}
						{/* <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<SectionCards />
							<div className="px-4 lg:px-6">
								<ChartAreaInteractive />
							</div>
							<DataTable data={data} />
						</div> */}
						{children}
						<Toaster />
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	) : (
		<h1>Loading</h1>
	);
}
