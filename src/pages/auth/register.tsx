import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, ChevronRight, Loader2, MapPin, Building, UserPlus } from 'lucide-react';

// Interface for dropdown data
interface Province {
    id: string;
    name: string;
    code?: string;
}

interface District {
    id: string;
    name: string;
    code?: string;
    provinceId: string;
}

export default function RegisterPage() {

    // Multi-step form state
    const [step, setStep] = useState(1);

    // Step 1: Select Province and District
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
    const [isProvinceLoading, setIsProvinceLoading] = useState(true);
    const [isDistrictLoading, setIsDistrictLoading] = useState(false);

    // Step 2: Account details
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [adminName, setAdminName] = useState('');

    // General state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

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

        // Set selected province object
        const province = provinces.find(p => p.id === selectedProvinceId);
        setSelectedProvince(province || null);
    }, [selectedProvinceId, provinces]);

    // Update selected district object when district ID changes
    useEffect(() => {
        if (selectedDistrictId) {
            const district = districts.find(d => d.id === selectedDistrictId);
            setSelectedDistrict(district || null);
        } else {
            setSelectedDistrict(null);
        }
    }, [selectedDistrictId, districts]);

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
                    name: adminName,
                    provinceId: selectedProvinceId,
                    districtId: selectedDistrictId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            toast.success('Registration successful. Please check your email for verification.');
            setIsComplete(true);
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
                <title>Register District | Ward Data Bucket</title>
            </Head>
            <div className="min-h-screen bg-slate-50 p-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <Link href="/auth" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to authentication
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <Image
                            src="/logo.png"
                            alt="Ward Data Bucket Logo"
                            width={100}
                            height={100}
                            className="mx-auto mb-4"
                        />
                        <h1 className="text-2xl font-bold text-slate-900">District Registration</h1>
                        <p className="text-slate-600 mt-2">Register your district to start collecting data</p>
                    </div>

                    {!isComplete ? (
                        <Card className="mb-8">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Register Your District</CardTitle>
                                        <CardDescription>
                                            Complete the steps below to create your district account
                                        </CardDescription>
                                    </div>
                                    <div className="hidden md:flex items-center space-x-2">
                                        <div className={`flex items-center justify-center h-8 w-8 rounded-full border ${step === 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-500'}`}>
                                            1
                                        </div>
                                        <div className="h-0.5 w-8 bg-slate-200"></div>
                                        <div className={`flex items-center justify-center h-8 w-8 rounded-full border ${step === 2 ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 text-slate-500'}`}>
                                            2
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {step === 1 ? (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="province">Province</Label>
                                            <Select
                                                value={selectedProvinceId}
                                                onValueChange={handleProvinceChange}
                                                disabled={isProvinceLoading}
                                            >
                                                <SelectTrigger id="province" className="w-full">
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
                                                <p className="text-xs text-slate-500 flex items-center">
                                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                    Loading provinces...
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="district">District</Label>
                                            <Select
                                                value={selectedDistrictId}
                                                onValueChange={handleDistrictChange}
                                                disabled={!selectedProvinceId || isDistrictLoading}
                                            >
                                                <SelectTrigger id="district" className="w-full">
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
                                                <p className="text-xs text-slate-500 flex items-center">
                                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                    Loading districts...
                                                </p>
                                            )}
                                            {!selectedProvinceId && (
                                                <p className="text-xs text-slate-500">
                                                    Select a province first
                                                </p>
                                            )}
                                        </div>

                                        {selectedProvinceId && selectedDistrictId && (
                                            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-4">
                                                <h3 className="text-sm font-medium mb-2">Selected Location</h3>
                                                <Table>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className="py-2 font-medium">Province</TableCell>
                                                            <TableCell className="py-2">
                                                                <div className="flex items-center">
                                                                    <MapPin className="h-4 w-4 text-indigo-500 mr-2" />
                                                                    {selectedProvince?.name}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="py-2 font-medium">District</TableCell>
                                                            <TableCell className="py-2">
                                                                <div className="flex items-center">
                                                                    <Building className="h-4 w-4 text-indigo-500 mr-2" />
                                                                    {selectedDistrict?.name}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <form id="registration-form" onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="admin-name">Admin Name</Label>
                                            <Input
                                                id="admin-name"
                                                type="text"
                                                value={adminName}
                                                onChange={(e) => setAdminName(e.target.value)}
                                                placeholder="Enter your name"
                                                autoComplete="name"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-3">
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

                                        <div className="space-y-3">
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

                                        <div className="space-y-3">
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

                                        <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-3">
                                            <h3 className="text-sm font-medium">District Information</h3>
                                            <Table>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell className="py-2 font-medium">Province</TableCell>
                                                        <TableCell className="py-2">{selectedProvince?.name}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="py-2 font-medium">District</TableCell>
                                                        <TableCell className="py-2">{selectedDistrict?.name}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row sm:justify-between">
                                <div className="flex w-full mb-4 sm:mb-0">
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
                                            className="w-full sm:w-auto"
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
                                            className="w-full sm:w-auto"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Registering...
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    Register District
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>

                                <div className="text-center sm:text-right text-sm mt-4 sm:mt-0">
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
                    ) : (
                        <Card>
                            <CardContent className="pt-6 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
                                <p className="text-slate-600 mb-6">
                                    Your district registration request has been submitted. Please check your email for verification instructions.
                                </p>
                                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 w-full text-left mb-6">
                                    <h3 className="text-sm font-medium mb-2">District Information</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Province:</span>
                                            <span className="text-sm font-medium">{selectedProvince?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">District:</span>
                                            <span className="text-sm font-medium">{selectedDistrict?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Admin:</span>
                                            <span className="text-sm font-medium">{email}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href="/auth/login">
                                        Proceed to Login
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            Need help? Contact support at <a href="mailto:support@warddatabucket.gov.pg" className="text-indigo-600 hover:underline">support@warddatabucket.gov.pg</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}