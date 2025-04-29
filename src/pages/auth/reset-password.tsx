import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState('');
    const [isValidToken, setIsValidToken] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const router = useRouter();

    useEffect(() => {
        // Get token from URL query
        if (router.isReady) {
            const { token } = router.query;

            if (typeof token === 'string') {
                setToken(token);
                setIsLoading(false);
                // For this UI demo, we'll assume token is valid
                // In a real implementation, you would verify the token with an API call
                setIsValidToken(true);
            } else {
                setIsLoading(false);
                setIsValidToken(false);
            }
        }
    }, [router.isReady, router.query]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Validate form
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setIsSuccess(true);
            toast.success('Password reset successful');
        } catch (error) {
            console.error('Password reset error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to reset password');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-600">Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Reset Password | Ward Data Bucket</title>
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
                            <CardTitle>Reset Password</CardTitle>
                            <CardDescription>
                                {isValidToken && !isSuccess
                                    ? 'Create a new password for your account'
                                    : isSuccess
                                        ? 'Password reset complete'
                                        : 'Invalid or expired reset token'}
                            </CardDescription>
                        </CardHeader>

                        {!isValidToken ? (
                            <CardContent className="space-y-6">
                                <div className="bg-amber-50 text-amber-800 p-4 rounded-md flex items-start">
                                    <AlertCircle className="h-5 w-5 mr-3 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium mb-1">Invalid Reset Link</h3>
                                        <p className="text-sm">
                                            This password reset link is invalid or has expired.
                                            Please request a new link.
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
                                    >
                                        Request New Link
                                    </Link>
                                </div>
                            </CardContent>
                        ) : !isSuccess ? (
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter new password (min. 8 characters)"
                                            autoComplete="new-password"
                                            required
                                            minLength={8}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm Password</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your new password"
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Updating...' : 'Reset Password'}
                                    </Button>
                                </CardFooter>
                            </form>
                        ) : (
                            <CardContent className="space-y-6">
                                <div className="bg-green-50 text-green-800 p-4 rounded-md flex items-start">
                                    <div className="bg-green-100 rounded-full p-2 mr-3">
                                        <Shield size={18} className="text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1">Password Reset Complete</h3>
                                        <p className="text-sm">
                                            Your password has been successfully reset. You can now login with your new password.
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Link
                                        href="/auth/login"
                                        className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
                                    >
                                        <ArrowLeft size={16} className="mr-2" />
                                        Back to login
                                    </Link>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}