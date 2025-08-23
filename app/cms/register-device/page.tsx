'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function RegisterDevice() {
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        deviceName: '',
        deviceType: '',
        location: '',
        description: '',
        serialNumber: '',
        deviceId: '',
        resolution: '',
        isTouch: false
    });

    // Extract URL parameters on component mount
    useEffect(() => {
        const deviceId = searchParams.get('deviceId') || '';
        const resolution = searchParams.get('resolution') || '';
        const isTouch = searchParams.get('isTouch') === 'true';

        setFormData(prev => ({
            ...prev,
            deviceId,
            resolution,
            isTouch
        }));
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle device registration logic here
        console.log('Device registration data:', formData);
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Register New Device</CardTitle>
                        <CardDescription>
                            Add a new device to your CMS system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deviceName">Device Name</Label>
                                    <Input
                                        id="deviceName"
                                        value={formData.deviceName}
                                        onChange={(e) => handleInputChange('deviceName', e.target.value)}
                                        placeholder="Enter device name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deviceType">Device Type</Label>
                                    <Select value={formData.deviceType} onValueChange={(value) => handleInputChange('deviceType', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select device type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="display">Display</SelectItem>
                                            <SelectItem value="sensor">Sensor</SelectItem>
                                            <SelectItem value="controller">Controller</SelectItem>
                                            <SelectItem value="gateway">Gateway</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deviceId">Device ID</Label>
                                    <Input
                                        id="deviceId"
                                        value={formData.deviceId}
                                        onChange={(e) => handleInputChange('deviceId', e.target.value)}
                                        placeholder="Device ID from URL"
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serialNumber">Serial Number</Label>
                                    <Input
                                        id="serialNumber"
                                        value={formData.serialNumber}
                                        onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                                        placeholder="Enter device serial number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="resolution">Resolution</Label>
                                    <Input
                                        id="resolution"
                                        value={formData.resolution}
                                        onChange={(e) => handleInputChange('resolution', e.target.value)}
                                        placeholder="Resolution from URL"
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="Enter device location"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isTouch"
                                    checked={formData.isTouch}
                                    onCheckedChange={(checked) => handleInputChange('isTouch', checked as boolean)}
                                    disabled
                                />
                                <Label htmlFor="isTouch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Touch Screen (from URL)
                                </Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Enter device description"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" className="flex-1">
                                    Register Device
                                </Button>
                                <Button type="button" variant="outline" className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
