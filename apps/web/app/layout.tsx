import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';

export const metadata: Metadata = {
    title: 'InstaSell - eBay-Style Marketplace',
    description: 'Buy and sell items with real-time auctions and secure payments',
    keywords: 'marketplace, auctions, buy, sell, ecommerce, online shopping',
    authors: [{ name: 'InstaSell Team' }],
    robots: 'index, follow',
    openGraph: {
        title: 'InstaSell - eBay-Style Marketplace',
        description: 'Buy and sell items with real-time auctions and secure payments',
        type: 'website',
        url: 'https://instasell.com',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'InstaSell - eBay-Style Marketplace',
        description: 'Buy and sell items with real-time auctions and secure payments',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-gray-50 antialiased">
                <ErrorBoundary>
                    <ToastProvider>
                        <AuthProvider>
                            <Header />
                            <main className="min-h-screen">{children}</main>
                            <Footer />
                        </AuthProvider>
                    </ToastProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
