import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process request');
            }

            setIsSubmitted(true);
        } catch (error) {
            console.error('Password reset request error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Head>
                <title>Forgot Password | Ward Data Bucket</title>
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
                            <CardTitle>Forgot Password</CardTitle>
                            <CardDescription>
                                {!isSubmitted
                                    ? 'Enter your email to receive a password reset link'
                                    : 'Password reset link sent'}
                            </CardDescription>
                        </CardHeader>

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            autoComplete="email"
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
                                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                    </Button>
                                    <div className="text-center">
                                        <Link
                                            href="/auth/login"
                                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center justify-center"
                                        >
                                            <ArrowLeft size={16} className="mr-2" />
                                            Back to login
                                        </Link>
                                    </div>
                                </CardFooter>
                            </form>
                        ) : (
                            <CardContent className="space-y-6 pt-4">
                                <div className="bg-green-50 text-green-800 p-4 rounded-md flex items-start">
                                    <div className="bg-green-100 rounded-full p-2 mr-3">
                                        <Mail size={18} className="text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1">Check your email</h3>
                                        <p className="text-sm">
                                            We&#39;ve sent a password reset link to <strong>{email}</strong>.
                                            Click the link in the email to reset your password.
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center space-y-4">
                                    <p className="text-sm text-slate-600">
                                        Didn&#39;t receive the email? Check your spam folder or try again in a few minutes.
                                    </p>

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