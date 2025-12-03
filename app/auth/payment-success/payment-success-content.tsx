'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      router.push('/auth/signup');
      return;
    }

    // Show success for 3 seconds then redirect to verify email
    const timer = setTimeout(() => {
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    }, 3000);

    setIsLoading(false);

    return () => clearTimeout(timer);
  }, [email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e5d9f2] via-[#f0eaf9] to-[#cfe2f3] px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-white" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          Payment Successful!
        </h1>

        <p className="text-slate-600 mb-6">
          Thank you for upgrading to AI Job Master Plus. Your account has been activated.
        </p>

        <p className="text-sm text-slate-500 mb-8">
          We&apos;re sending a verification email to <strong>{email}</strong>
        </p>

        <p className="text-xs text-slate-400">
          Redirecting to email verification in 3 seconds...
        </p>

        <div className="mt-8 flex gap-3 justify-center">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
