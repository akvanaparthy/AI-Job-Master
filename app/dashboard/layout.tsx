'use client';

import { FileText, Mail, MessageSquare, History, Settings, User, LayoutDashboard, KeyRound, LogOut, ChevronDown, Shield, Crown } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationsBell } from '@/components/NotificationsBell';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cover Letter', href: '/dashboard/cover-letter', icon: FileText },
  { name: 'LinkedIn', href: '/dashboard/linkedin', icon: MessageSquare },
  { name: 'Email', href: '/dashboard/email', icon: Mail },
  { name: 'History', href: '/dashboard/history', icon: History },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userType, setUserType] = useState<string>('FREE');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Helper function to format user type for display
  const formatUserType = (type: string) => {
    const typeMap: Record<string, string> = {
      'FREE': 'Free',
      'PLUS': 'Plus',
      'ADMIN': 'Admin'
    };
    return typeMap[type] || type;
  };

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      // Check if user is admin and get user type
      if (user) {
        try {
          const response = await fetch('/api/admin/stats');
          setIsAdmin(response.ok);
        } catch (error) {
          setIsAdmin(false);
        }

        // Get user type
        try {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const data = await res.json();
            setUserType(data.userType || 'FREE');
          }
        } catch (error) {
          console.error('Failed to load user type:', error);
        }
      }
    };
    loadUser();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      
      router.push('/');
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-[280px] bg-[#f5f5f5] flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold">AJ</span>
          </div>
          <span className="text-xl font-bold text-gray-900">AI Job Master</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto">
          {/* Main Section */}
          <div className="mb-6">
            <div className="px-3 mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tools</span>
            </div>
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                // Dashboard should only be active when exactly on /dashboard, not on sub-pages
                const isActive = item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-normal transition-all",
                      isActive
                        ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                        : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <div className="px-3 mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Other</span>
            </div>
            <div className="space-y-1">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-normal transition-all",
                  pathname === '/settings'
                    ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
                )}
              >
                <Settings className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span>Settings</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-normal transition-all",
                    pathname?.startsWith('/admin')
                      ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
                  )}
                >
                  <Shield className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-300/50 mt-auto">
          <DropdownMenu onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2.5 mb-3 w-full rounded-xl hover:bg-white/40 transition-all">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white font-bold text-sm">{userEmail ? userEmail[0].toUpperCase() : 'U'}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{userEmail || 'Loading...'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {userType === 'ADMIN' && <Shield className="w-3 h-3 text-red-600" strokeWidth={2.5} />}
                    {userType === 'PLUS' && <Crown className="w-3 h-3 text-purple-600" strokeWidth={2.5} />}
                    <span className={`text-[10px] font-bold tracking-wide ${
                      userType === 'ADMIN' ? 'text-red-600' :
                      userType === 'PLUS' ? 'text-purple-600' :
                      'text-gray-500'
                    }`}>{formatUserType(userType)}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <KeyRound className="w-4 h-4 mr-2" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors">
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-[280px]">
        {/* Top header bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-end">
            <NotificationsBell />
          </div>
        </div>

        <main className="min-h-screen p-8 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
