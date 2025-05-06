import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Building, UserPlus, LogIn } from 'lucide-react';

export default function AuthLandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('login');

  // Redirect if already authenticated
  if (status === 'authenticated') {
    switch (session.user.role) {
      case 'ROOT':
        router.push('/root/dashboard');
        break;
      case 'ADMIN':
        router.push('/district/dashboard');
        break;
      case 'USER':
        router.push('/dashboard');
        break;
    }

    // Show loading while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-slate-200 h-16 w-16 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-24 mb-2.5"></div>
            <div className="h-3 bg-slate-200 rounded w-32"></div>
          </div>
        </div>
    );
  }

  return (
      <>
        <Head>
          <title>Sign In or Register | Ward Data Bucket</title>
          <meta name="description" content="Sign in or register for the Ward Data Bucket system" />
        </Head>

        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
              <Image
                  src="/logo.png"
                  alt="Ward Data Bucket Logo"
                  width={120}
                  height={120}
                  className="mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-slate-900">Ward Data Bucket</h1>
              <p className="text-slate-600 mt-2">Data collection and management system for Papua New Guinea</p>
            </div>

            <Tabs
                defaultValue="login"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="login" className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="district" className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Register District
                </TabsTrigger>
                <TabsTrigger value="rootadmin" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Root Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Sign In</CardTitle>
                      <CardDescription>
                        Access your Ward Data Bucket account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <Link href="/auth/login">
                          <Button size="lg" className="w-full md:w-auto">
                            <LogIn className="mr-2 h-4 w-4" />
                            Continue to Sign In
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="district">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Register as a District</CardTitle>
                      <CardDescription>
                        Create a new district account for data collection
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center justify-center space-y-2 py-4">
                        <Building className="h-16 w-16 text-indigo-600" />
                        <h3 className="text-xl font-semibold">District Registration</h3>
                        <p className="text-center text-sm text-slate-500">
                          Register a district to start collecting data for wards, LLGs, and locations
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <Link href="/auth/register">
                          <Button size="lg">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Register District
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Already have an account?</CardTitle>
                      <CardDescription>
                        Sign in to your existing district account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center justify-center space-y-2 py-4">
                        <Users className="h-16 w-16 text-indigo-600" />
                        <h3 className="text-xl font-semibold">Existing Districts</h3>
                        <p className="text-center text-sm text-slate-500">
                          If your district is already registered, simply sign in to access your data
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <Link href="/auth/login">
                          <Button size="lg" variant="outline">
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="rootadmin">
                <Card>
                  <CardHeader>
                    <CardTitle>Root Administrator Access</CardTitle>
                    <CardDescription>
                      For system administrators only
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                      <Shield className="h-16 w-16 text-indigo-600" />
                      <h3 className="text-xl font-semibold">System Administration</h3>
                      <p className="text-center text-sm text-slate-500">
                        Root administrators manage the entire system, including geographical structure and all districts
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-500 mr-3 mt-0.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <p className="text-sm text-amber-800">
                        This area is restricted to authorized system administrators only. Regular district users should use the district registration or sign in options.
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <Link href="/auth/login?role=root">
                        <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
                          <Shield className="mr-2 h-4 w-4" />
                          Root Admin Sign In
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Help and support section */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Need help? Contact support at <a href="mailto:support@warddatabucket.gov.pg" className="text-indigo-600 hover:underline">support@warddatabucket.gov.pg</a>
              </p>
              <div className="mt-2">
                <Link href="/" className="text-sm text-indigo-600 hover:underline">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
  );
}