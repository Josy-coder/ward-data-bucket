import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RootLayout from '@/components/layout/RootLayout';
import { RefreshCw, Search, Database, Map, Users, Building } from 'lucide-react';

// Define tenant type
interface Tenant {
    id: string;
    district: {
        id: string;
        name: string;
        province: {
            id: string;
            name: string;
        };
    };
    isActive: boolean;
    users: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        isActive: boolean;
    }[];
    createdAt: string;
}

export default function RootDashboardPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    // Check authentication on mount
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
            return;
        }

        if (status === 'authenticated') {
            if (session.user.role !== 'ROOT') {
                toast.error('Only ROOT users can access this page');
                router.push('/dashboard');
                return;
            }

            fetchTenants();
        }
    }, [status, session, router]);

    // Fetch tenants data
    const fetchTenants = async () => {
        setIsLoading(true);
        try {
            // This endpoint would need to be implemented
            const response = await fetch('/api/admin/tenants');

            if (!response.ok) {
                throw new Error('Failed to fetch tenants');
            }

            const data = await response.json();
            setTenants(data.tenants || []);
            setFilteredTenants(data.tenants || []);
        } catch (error) {
            console.error('Error fetching tenants:', error);
            toast.error('Failed to load districts');
            // For demo purposes, use empty array
            setTenants([]);
            setFilteredTenants([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter tenants based on search query and active tab
    useEffect(() => {
        let filtered = tenants;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                tenant =>
                    tenant.district.name.toLowerCase().includes(query) ||
                    tenant.district.province.name.toLowerCase().includes(query)
            );
        }

        // Filter by active status
        if (activeTab === 'active') {
            filtered = filtered.filter(tenant => tenant.isActive);
        } else if (activeTab === 'inactive') {
            filtered = filtered.filter(tenant => !tenant.isActive);
        }

        setFilteredTenants(filtered);
    }, [searchQuery, activeTab, tenants]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <RootLayout title="Dashboard">
            <Head>
                <title>Root Admin Dashboard | Ward Data Bucket</title>
            </Head>

            <div className="space-y-6">
                {/* Stats section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Districts
                            </CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tenants.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Registered districts in the system
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Districts
                            </CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {tenants.filter(tenant => tenant.isActive).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Districts with active accounts
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {tenants.reduce((total, tenant) => total + tenant.users.length, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Registered users across all districts
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Access Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Button onClick={() => router.push('/root/tenants')}>
                        <Building className="h-4 w-4 mr-2" />
                        Manage Districts
                    </Button>
                    <Button onClick={() => router.push('/root/users')}>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                    </Button>
                    <Button onClick={() => router.push('/root/geographic-management')}>
                        <Map className="h-4 w-4 mr-2" />
                        Geographic Structure
                    </Button>
                </div>

                {/* Districts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Districts</CardTitle>
                        <CardDescription>
                            Manage registered districts and their data
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search districts..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <Button onClick={fetchTenants} variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                            <TabsList>
                                <TabsTrigger value="all">All Districts</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="p-0">
                                <div className="rounded-md border mt-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Province
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    District
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Users
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Created
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredTenants.length > 0 ? (
                                                filteredTenants.map((tenant) => (
                                                    <tr key={tenant.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {tenant.district.province.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {tenant.district.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    tenant.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                  {tenant.isActive ? 'Active' : 'Inactive'}
                                </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {tenant.users.length}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(tenant.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={`/root/tenants/${tenant.id}`}>
                                                                    <Button variant="ghost" size="sm">
                                                                        Details
                                                                    </Button>
                                                                </Link>
                                                                <Link href={`/root/tenants/${tenant.id}/data-buckets`}>
                                                                    <Button variant="ghost" size="sm">
                                                                        Data
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        {searchQuery ? 'No districts found matching your search.' : 'No districts registered yet.'}
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="active" className="p-0">
                                {/* Same table structure as above, filtered for active tenants */}
                            </TabsContent>

                            <TabsContent value="inactive" className="p-0">
                                {/* Same table structure as above, filtered for inactive tenants */}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </RootLayout>
    );
}