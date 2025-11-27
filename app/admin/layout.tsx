'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login?redirectTo=/admin');
          return;
        }

        // Check if user is admin by calling the admin stats API
        // If it returns 403, user is not admin
        const response = await fetch('/api/admin/stats');

        if (response.status === 403) {
          console.log('[ADMIN LAYOUT] Access denied - not an admin');
          router.push('/dashboard');
          return;
        }

        if (!response.ok) {
          console.error('[ADMIN LAYOUT] Error checking admin status');
          router.push('/dashboard');
          return;
        }

        // User is authorized
        setIsAuthorized(true);
      } catch (error) {
        console.error('[ADMIN LAYOUT] Error:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-slate-900 text-5xl font-bold">
          <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
