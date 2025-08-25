'use client';

import { ReactNode, useMemo } from 'react';
import { useGetDevices } from '@/hooks/useGetDevices';
import { Device } from '@/app/types/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export interface DeviceSelectorProps {
	selectedDeviceIds?: string[];
	onChange?: (deviceIds: string[], devices: Device[]) => void;
	className?: string;
	header?: ReactNode;
}

const DeviceRow = ({
	device,
	checked,
	onToggle,
}: {
	device: Device;
	checked: boolean;
	onToggle: () => void;
}) => {
	return (
		<div className="flex items-center gap-3 rounded-md border p-3">
			<Checkbox
				id={`device-${device.id}`}
				checked={checked}
				onCheckedChange={onToggle}
			/>
			<div className="grid gap-0.5">
				<Label
					htmlFor={`device-${device.id}`}
					className="cursor-pointer"
				>
					{device.name}
				</Label>
				<span className="text-xs text-muted-foreground">
					{device.type} • {device.resolution ?? 'unknown res'} • {device.status}
				</span>
			</div>
		</div>
	);
};

export const DeviceSelector = ({
	selectedDeviceIds,
	onChange,
	className,
	header,
}: DeviceSelectorProps) => {
	const { devices, loading, error } = useGetDevices();
	const selectedSet = useMemo(() => new Set(selectedDeviceIds ?? []), [selectedDeviceIds]);

	if (loading) {
		return (
			<div className={className}>
				<div className="grid gap-2">
					{Array.from({ length: 4 }).map((_, idx) => (
						<div
							key={idx}
							className="flex items-center gap-3 rounded-md border p-3"
						>
							<Skeleton className="h-4 w-4 rounded-full" />
							<div className="grid gap-1 w-full">
								<Skeleton className="h-4 w-1/3" />
								<Skeleton className="h-3 w-1/5" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Card className={className}>
				<CardContent className="p-4 text-sm text-destructive">
					Failed to load devices: {error.message}
				</CardContent>
			</Card>
		);
	}

	if (!devices || devices.length === 0) {
		return (
			<Card className={className}>
				<CardContent className="p-4 text-sm text-muted-foreground">No devices found.</CardContent>
			</Card>
		);
	}

	return (
		<div className={className}>
			{header}
			<div className="grid gap-2">
				{devices.map(device => {
					const checked = selectedSet.has(device.id);
					return (
						<DeviceRow
							key={device.id}
							device={device}
							checked={checked}
							onToggle={() => {
								const next = checked
									? (selectedDeviceIds ?? []).filter(id => id !== device.id)
									: [...(selectedDeviceIds ?? []), device.id];
								onChange?.(
									next,
									devices.filter(d => next.includes(d.id))
								);
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default DeviceSelector;
