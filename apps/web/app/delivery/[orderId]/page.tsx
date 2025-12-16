'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Package,
    Truck,
    MapPin,
    CheckCircle,
    Clock,
    Phone,
    Camera,
    FileText,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface DeliveryStatus {
    id: string;
    orderId: string;
    trackingNumber: string;
    status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
    estimatedDelivery: string;
    actualDelivery?: string;
    deliveryAddress: {
        name: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        phone: string;
    };
    carrier: {
        name: string;
        phone: string;
        driverName?: string;
        driverPhone?: string;
    };
    timeline: {
        status: string;
        description: string;
        timestamp: string;
        location?: string;
    }[];
    requiresOpenBox: boolean;
    deliveryPhotos?: string[];
    signature?: string;
    deliveryNotes?: string;
}

export default function DeliveryTrackingPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [delivery, setDelivery] = useState<DeliveryStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchDeliveryStatus();
        }
    }, [orderId]);

    const fetchDeliveryStatus = async () => {
        try {
            // Mock data - replace with actual API call
            const mockDelivery: DeliveryStatus = {
                id: 'DEL-001',
                orderId: orderId,
                trackingNumber: '1Z999AA1234567890',
                status: 'out_for_delivery',
                estimatedDelivery: '2024-01-16T18:00:00Z',
                deliveryAddress: {
                    name: 'John Doe',
                    street: '123 Main Street, Apt 4B',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94102',
                    phone: '+1 (555) 123-4567'
                },
                carrier: {
                    name: 'FastShip Express',
                    phone: '+1 (800) 555-0123',
                    driverName: 'Mike Johnson',
                    driverPhone: '+1 (555) 987-6543'
                },
                timeline: [
                    {
                        status: 'Order Placed',
                        description: 'Your order has been confirmed and is being prepared for shipment.',
                        timestamp: '2024-01-14T10:00:00Z'
                    },
                    {
                        status: 'Picked Up',
                        description: 'Package has been picked up from the seller.',
                        timestamp: '2024-01-14T16:30:00Z',
                        location: 'San Jose, CA'
                    },
                    {
                        status: 'In Transit',
                        description: 'Package is on its way to the destination facility.',
                        timestamp: '2024-01-15T08:15:00Z',
                        location: 'Oakland, CA'
                    },
                    {
                        status: 'Out for Delivery',
                        description: 'Package is out for delivery and will arrive today.',
                        timestamp: '2024-01-16T09:00:00Z',
                        location: 'San Francisco, CA'
                    }
                ],
                requiresOpenBox: true
            };

            setDelivery(mockDelivery);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch delivery status:', error);
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'picked_up':
                return <Package className="h-5 w-5 text-blue-500" />;
            case 'in_transit':
                return <Truck className="h-5 w-5 text-purple-500" />;
            case 'out_for_delivery':
                return <MapPin className="h-5 w-5 text-orange-500" />;
            case 'delivered':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'failed':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'picked_up':
                return 'text-blue-600 bg-blue-100';
            case 'in_transit':
                return 'text-purple-600 bg-purple-100';
            case 'out_for_delivery':
                return 'text-orange-600 bg-orange-100';
            case 'delivered':
                return 'text-green-600 bg-green-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!delivery) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery Not Found</h3>
                    <p className="text-gray-500">
                        We couldn't find delivery information for order {orderId}.
                    </p>
                    <Link href="/account/orders" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <Link href="/account/orders" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Orders
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Delivery Tracking</h1>
                        <p className="text-gray-600">Order #{delivery.orderId}</p>
                    </div>

                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-2 capitalize">{delivery.status.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Tracking Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Current Status</h2>

                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                {getStatusIcon(delivery.status)}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 capitalize">
                                    {delivery.status.replace('_', ' ')}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {delivery.timeline[delivery.timeline.length - 1]?.description}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Tracking Number</p>
                                <p className="text-sm text-gray-900 font-mono">{delivery.trackingNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Estimated Delivery</p>
                                <p className="text-sm text-gray-900">
                                    {formatDate(delivery.estimatedDelivery)}
                                </p>
                            </div>
                        </div>

                        {delivery.requiresOpenBox && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <div className="flex items-center">
                                    <Camera className="h-5 w-5 text-yellow-600 mr-2" />
                                    <p className="text-sm text-yellow-800">
                                        <strong>Open-Box Delivery Required:</strong> This item requires verification upon delivery.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Tracking Timeline</h2>

                        <div className="space-y-4">
                            {delivery.timeline.map((event, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${index === delivery.timeline.length - 1
                                            ? 'bg-blue-600'
                                            : 'bg-gray-300'
                                        }`}></div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">
                                                {event.status}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(event.timestamp)}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {event.description}
                                        </p>
                                        {event.location && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                📍 {event.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Photos */}
                    {delivery.deliveryPhotos && delivery.deliveryPhotos.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Delivery Photos</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {delivery.deliveryPhotos.map((photo, index) => (
                                    <img
                                        key={index}
                                        src={photo}
                                        alt={`Delivery photo ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Delivery Address */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">{delivery.deliveryAddress.name}</p>
                            <p className="text-gray-600">{delivery.deliveryAddress.street}</p>
                            <p className="text-gray-600">
                                {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state} {delivery.deliveryAddress.zipCode}
                            </p>
                            <div className="flex items-center pt-2 border-t border-gray-200">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                <p className="text-gray-600">{delivery.deliveryAddress.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Carrier Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Carrier Information</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-medium">{delivery.carrier.name}</p>
                                <div className="flex items-center text-gray-600">
                                    <Phone className="h-4 w-4 mr-2" />
                                    <p>{delivery.carrier.phone}</p>
                                </div>
                            </div>

                            {delivery.carrier.driverName && (
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="font-medium">Driver: {delivery.carrier.driverName}</p>
                                    <div className="flex items-center text-gray-600">
                                        <Phone className="h-4 w-4 mr-2" />
                                        <p>{delivery.carrier.driverPhone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <Phone className="h-4 w-4 mr-2" />
                                Contact Carrier
                            </button>

                            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <FileText className="h-4 w-4 mr-2" />
                                Report Issue
                            </button>

                            {delivery.status === 'delivered' && (
                                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirm Delivery
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}