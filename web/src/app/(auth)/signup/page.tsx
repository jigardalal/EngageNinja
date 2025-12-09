'use client';

import Image from 'next/image';
import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { persistSession, postAuth } from '@/lib/auth-client';

const signupSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password must include uppercase, lowercase, number, and be at least 8 characters.')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      'Password must include uppercase, lowercase, number, and be at least 8 characters.',
    ),
  tenantName: z.string().optional(),
});

type SignupForm = z.infer<typeof signupSchema>;

function SignupContent() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', tenantName: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const result = await postAuth('/auth/signup', values);
      persistSession(result.tokens, result.tenant.id);
      router.push(`/dashboard?tenantId=${result.tenant.id}`);
    } catch (error) {
      setApiError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const stored = (localStorage.getItem('auth-theme') as 'light' | 'dark') || 'light';
    setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('auth-theme', theme);
  }, [theme, mounted]);

  const isDark = mounted ? theme === 'dark' : false;
  const pageBg = isDark ? 'bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark
    ? 'bg-slate-900/80 text-slate-50 ring-white/10 shadow-slate-900/30'
    : 'bg-white text-slate-900 ring-slate-100 shadow-slate-200';
  const inputBg = isDark ? 'bg-slate-950/60 border-slate-700 focus:ring-emerald-500/60' : 'bg-white border-slate-200 focus:ring-emerald-100';
  const inputBorder = isDark ? 'border-slate-700 focus:border-emerald-400' : 'border-slate-200 focus:border-emerald-500';
  const accentText = isDark ? 'text-emerald-300' : 'text-emerald-600';

  return (
    <main className={`min-h-screen ${pageBg}`}>
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
        <div className={`mb-4 flex w-full max-w-xl items-center justify-between gap-3 text-sm ${accentText}`}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12">
              <Image src="/logo.png" alt="EngageNinja logo" width={48} height={48} className="h-full w-full rounded-full bg-white/10 p-1" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">Create account</span>
          </div>
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="rounded-full border border-emerald-200/50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-400/40 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
          >
            Switch to {isDark ? 'light' : 'dark'}
          </button>
        </div>
        <div className={`w-full max-w-xl rounded-2xl p-8 shadow-xl ring-1 ${cardBg}`}>
          <div className="mb-6 space-y-2 text-center">
            <p className={`text-xs font-semibold uppercase tracking-wide ${accentText}`}>Create account</p>
            <h1 className="text-3xl font-semibold">Sign up to EngageNinja</h1>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Start a workspace with secure signup and tenant-aware routing.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`w-full rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${inputBg} ${inputBorder}`}
                placeholder="you@example.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-rose-500" role="alert">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={`w-full rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${inputBg} ${inputBorder}`}
                placeholder="••••••••"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-rose-500" role="alert">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium" htmlFor="tenantName">
                Workspace name (optional)
              </label>
              <input
                id="tenantName"
                type="text"
                className={`w-full rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${inputBg} ${inputBorder}`}
                placeholder="Acme Agency"
                {...form.register('tenantName')}
              />
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                If left blank, we’ll name it from your email handle.
              </p>
            </div>

            {apiError && <p className="text-sm text-rose-500">{apiError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-slate-900"
            >
              {isSubmitting ? 'Creating...' : 'Create account'}
            </button>

            <p className={`text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              You'll land in your workspace after signup.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
