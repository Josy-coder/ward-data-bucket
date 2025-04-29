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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, ArrowLeft } from 'lucide-react';

// Interface for dropdown data
interface Region {
    id: string;
    name: string;
}

interface Province {
    id: string;
    name: string;
    regionId: string;
}

interface District {
    id: string;
    name: string;
    provinceId: string;
}

export default function RegisterPage() {
    // Form steps
    const [step, setStep] = useState(1);

    // Step 1: Select Province and District
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [isProvinceLoading, setIsProvinceLoading] = useState(true);
    const [isDistrictLoading, setIsDistrictLoading] = useState(false);

    // Step 2: Account details
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // General state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Fetch provinces on component mount
    useEffect(() => {
        async function fetchProvinces() {
            try {
                const response = await fetch('/api/geo/provinces');

                if (!response.ok) {
                    throw new Error('Failed to fetch provinces');
                }

                const data = await response.json();
                setProvinces(data.provinces || []);
            } catch (error) {
                console.error('Error fetching provinces:', error);
                toast.error('Failed to load provinces');
            } finally {
                setIsProvinceLoading(false);
            }
        }

        fetchProvinces();
    }, []);

    // Fetch districts when province is selected
    useEffect(() => {
        if (!selectedProvinceId) {
            setDistricts([]);
            return;
        }

        async function fetchDistricts() {
            setIsDistrictLoading(true);
            try {
                const response = await fetch(`/api/geo/districts?provinceId=${selectedProvinceId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch districts');
                }

                const data = await response.json();
                setDistricts(data.districts || []);
            } catch (error) {
                console.error('Error fetching districts:', error);
                toast.error('Failed to load districts');
            } finally {
                setIsDistrictLoading(false);
            }
        }

        fetchDistricts();
    }, [selectedProvinceId]);

    // Handle province selection
    const handleProvinceChange = (provinceId: string) => {
        setSelectedProvinceId(provinceId);
        setSelectedDistrictId(''); // Reset district selection
    };

    // Handle district selection
    const handleDistrictChange = (districtId: string) => {
        setSelectedDistrictId(districtId);
    };

    // Move to next step
    const handleNextStep = () => {
        if (step === 1) {
            if (!selectedProvinceId || !selectedDistrictId) {
                toast.error('Please select both province and district');
                return;
            }
        }

        setStep(step + 1);
    };

    // Move to previous step
    const handlePrevStep = () => {
        setStep(step - 1);
    };

    // Handle registration form submission
    const handleSubmit = async (e: React.FormEvent) => {
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
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    provinceId: selectedProvinceId,
                    districtId: selectedDistrictId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            toast.success('Registration successful. Please check your email for verification.');
            router.push('/auth/login');
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error instanceof Error ? error.message : 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Register | Ward Data Bucket</title>
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
                        <p className="text-slate-600">Register your district account</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>District Registration</CardTitle>
                            <CardDescription>
                                {step === 1 ? 'Select your province and district' : 'Create your account'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="province">Province</Label>
                                        <Select
                                            value={selectedProvinceId}
                                            onValueChange={handleProvinceChange}
                                            disabled={isProvinceLoading}
                                        >
                                            <SelectTrigger id="province">
                                                <SelectValue placeholder="Select Province" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.map(province => (
                                                    <SelectItem key={province.id} value={province.id}>
                                                        {province.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {isProvinceLoading && (
                                            <p className="text-xs text-slate-500">Loading provinces...</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="district">District</Label>
                                        <Select
                                            value={selectedDistrictId}
                                            onValueChange={handleDistrictChange}
                                            disabled={!selectedProvinceId || isDistrictLoading}
                                        >
                                            <SelectTrigger id="district">
                                                <SelectValue placeholder="Select District" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {districts.map(district => (
                                                    <SelectItem key={district.id} value={district.id}>
                                                        {district.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {isDistrictLoading && (
                                            <p className="text-xs text-slate-500">Loading districts...</p>
                                        )}
                                        {!selectedProvinceId && (
                                            <p className="text-xs text-slate-500">Select a province first</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <form id="registration-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a password (min. 8 characters)"
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
                                            placeholder="Confirm your password"
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>
                                </form>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <div className="flex w-full">
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrevStep}
                                        className="mr-2"
                                    >
                                        <ArrowLeft size={16} className="mr-2" />
                                        Back
                                    </Button>
                                )}

                                {step === 1 && (
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="w-full"
                                        disabled={!selectedProvinceId || !selectedDistrictId}
                                    >
                                        Next
                                        <ChevronRight size={16} className="ml-2" />
                                    </Button>
                                )}

                                {step === 2 && (
                                    <Button
                                        type="submit"
                                        form="registration-form"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Registering...' : 'Register'}
                                    </Button>
                                )}
                            </div>

                            <div className="text-center text-sm">
                                <span className="text-slate-600">Already have an account?</span>{' '}
                                <Link
                                    href="/auth/login"
                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Login
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}