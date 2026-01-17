'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function SellLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    // Protect route - redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Store intended destination for redirect after login
            const returnUrl = encodeURIComponent(pathname);
            router.push(`/login?returnUrl=${returnUrl}`);
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render content if not authenticated
    if (!isAuthenticated || !user) {
        return null;
    }

    return <>{children}</>;
}
