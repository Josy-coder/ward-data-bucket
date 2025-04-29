import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import {
    Users,
    LayoutDashboard,
    Map,
    Database,
    LogOut,
    Bell,
    ChevronDown,
    Settings,
    Menu,
    X
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface RootLayoutProps {
    children: ReactNode;
    title: string;
}

export default function RootLayout({ children, title }: RootLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/auth/login');
    };

    const navItems = [
        {
            name: 'Dashboard',
            href: '/root/dashboard',
            icon: <LayoutDashboard className="h-5 w-5" />
        },
        {
            name: 'Tenants',
            href: '/root/tenants',
            icon: <Database className="h-5 w-5" />
        },
        {
            name: 'Users',
            href: '/root/users',
            icon: <Users className="h-5 w-5" />
        },
        {
            name: 'Geographic Structure',
            href: '/root/geographic-management',
            icon: <Map className="h-5 w-5" />
        },
        {
            name: 'Settings',
            href: '/root/settings',
            icon: <Settings className="h-5 w-5" />
        }
    ];

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar for desktop */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-indigo-800 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center justify-between px-4">
                    <Link href="/root/dashboard" className="flex items-center">
                        <Image
                            src="/logo.png"
                            alt="Ward Data Bucket"
                            width={40}
                            height={40}
                            className="mr-2"
                        />
                        <span className="text-lg font-semibold">Ward Data Bucket</span>
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="rounded p-1 md:hidden"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="px-4 py-2">
                    <p className="mb-2 text-xs uppercase text-indigo-200">Root Admin</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                                    router.pathname === item.href
                                        ? 'bg-indigo-900 text-white'
                                        : 'text-indigo-100 hover:bg-indigo-700'
                                }`}
                            >
                                {item.icon}
                                <span className="ml-3">{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col">
                {/* Top navigation */}
                <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-600 md:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="ml-4 text-xl font-semibold text-gray-800 md:ml-0">{title}</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="rounded-full bg-gray-100 p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-600">
                            <Bell className="h-6 w-6" />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">
                                        {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'R'}
                                    </div>
                                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <div className="p-2">
                                    <p className="text-sm font-medium">{session?.user?.name || 'Root Admin'}</p>
                                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/root/profile" className="cursor-pointer">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/root/settings" className="cursor-pointer">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}