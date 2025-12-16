'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, RefreshCw, ArrowLeft, Gavel } from 'lucide-react';

function VerifyEmailContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    useEffect(() => {
        // If there's a token in the URL, verify it automatically
        if (token) {
            verifyEmail(token);
        }
    }, [token]);

    const verifyEmail = async (verificationToken: string) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: verificationToken }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsVerified(true);
                setMessage('Your email has been successfully verified! You can now sign in to your account.');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(data.error || 'Email verification failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resendVerificationEmail = async () => {
        if (!email) {
            setError('Email address is required');
            return;
        }

        setIsResending(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Verification email sent! Please check your inbox.');
            } else {
                setError(data.error || 'Failed to resend verification email');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center justify-center mb-8">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-xl mr-3 shadow-lg">
                            <Gavel className="h-8 w-8" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            InstaSell
                        </h1>
                    </Link>
                </div>

                {/* Verification Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {isVerified ? (
                        // Success State
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
                            <p className="text-gray-600 mb-6">
                                Your email has been successfully verified. You will be redirected to the login page shortly.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                            >
                                Continue to Sign In
                            </Link>
                        </div>
                    ) : isLoading ? (
                        // Loading State
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Email...</h2>
                            <p className="text-gray-600">
                                Please wait while we verify your email address.
                            </p>
                        </div>
                    ) : (
                        // Default State
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail className="h-8 w-8 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h2>
                            <p className="text-gray-600 mb-6">
                                {email ? (
                                    <>
                                        We've sent a verification link to <strong>{email}</strong>.
                                        Please check your inbox and click the link to verify your account.
                                    </>
                                ) : (
                                    'Please check your email for a verification link to activate your account.'
                                )}
                            </p>

                            {/* Messages */}
                            {message && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                                    {error}
                                </div>
                            )}

                            {/* Resend Button */}
                            <button
                                onClick={resendVerificationEmail}
                                disabled={isResending || !email}
                                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4"
                            >
                                {isResending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Resend Verification Email
                                    </>
                                )}
                            </button>

                            {/* Back to Login */}
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Sign In
                            </Link>
                        </div>
                    )}
                </div>

                {/* Help Text */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        <strong>Didn't receive the email?</strong>
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>• Check your spam or junk folder</p>
                        <p>• Make sure you entered the correct email address</p>
                        <p>• Wait a few minutes for the email to arrive</p>
                        <p>• Contact support if you continue having issues</p>
                    </div>
                </div>

                {/* Support Link */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Need help?{' '}
                        <Link href="/help" className="font-medium text-blue-600 hover:text-blue-700">
                            Contact Support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}