import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
    const [isVerifying, setIsVerifying] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();

    useEffect(() => {
        async function verifyEmail() {
            // Wait for router to be ready and have the token
            if (!router.isReady || !router.query.token) {
                return;
            }

            const { token } = router.query;

            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Email verification failed');
                }

                setIsSuccess(true);
            } catch (error) {
                console.error('Email verification error:', error);
                setErrorMessage(error instanceof Error ? error.message : 'Failed to verify email');
                setIsSuccess(false);
            } finally {
                setIsVerifying(false);
            }
        }

        verifyEmail();
    }, [router.isReady, router.query]);

    return (
        <>
            <Head>
                <title>Verify Email | Ward Data Bucket</title>
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-full max-w-md p-4">
                    <div className="text-center mb-8">
                        <Image
                            src="/logo.png"
                            alt="Ward Data Bucket Logo"
                            width={120}
                            height={120}
                            className="mx-auto mb-4"
                        />
                        <h1 className="text-2xl font-bold text-slate-900">Ward Data Bucket</h1>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Email Verification</CardTitle>
                            <CardDescription>
                                {isVerifying
                                    ? 'Verifying your email address'
                                    : isSuccess
                                        ? 'Your email has been verified'
                                        : 'Email verification failed'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center text-center">
                            {isVerifying ? (
                                <div className="py-8 flex flex-col items-center">
                                    <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
                                    <p className="text-slate-600">Verifying your email address...</p>
                                </div>
                            ) : isSuccess ? (
                                <div className="py-8 flex flex-col items-center">
                                    <CheckCircle2 className="h-14 w-14 text-green-500 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Verification Successful</h3>
                                    <p className="text-slate-600 mb-6">
                                        Your email has been successfully verified.
                                        You can now log in to your account.
                                    </p>
                                    <Button asChild>
                                        <Link href="/auth/login">
                                            Log In to Your Account
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-8 flex flex-col items-center">
                                    <XCircle className="h-14 w-14 text-red-500 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Verification Failed</h3>
                                    <p className="text-slate-600 mb-2">
                                        {errorMessage || 'We were unable to verify your email address. The verification link may be invalid or expired.'}
                                    </p>
                                    <p className="text-slate-600 mb-6">
                                        Please try logging in to request a new verification email.
                                    </p>
                                    <Button asChild>
                                        <Link href="/auth/login">
                                            Back to Login
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}