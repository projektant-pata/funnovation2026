'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const params = useParams();
  const lang   = (params?.lang as string) ?? 'cs';
  const router = useRouter();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/${lang}/setup`);
        router.refresh();
      } else {
        setError(data.message ?? 'Přihlášení selhalo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF3E0] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <Link href={`/${lang}`} className="block text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="žemLOVEka" className="h-14 w-auto mx-auto" />
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-[#4E342E]/8 p-8">
          <h1 className="text-2xl font-black text-[#4E342E] mb-6">Přihlásit se</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#6D4C41] mb-1">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#4E342E]/20 rounded-xl px-4 py-3 text-base text-[#4E342E] focus:outline-none focus:border-[#FEDC56] focus:ring-2 focus:ring-[#FEDC56]/30 transition"
                placeholder="ty@priklad.cz"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#6D4C41] mb-1">Heslo</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#4E342E]/20 rounded-xl px-4 py-3 text-base text-[#4E342E] focus:outline-none focus:border-[#FEDC56] focus:ring-2 focus:ring-[#FEDC56]/30 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#FEDC56] hover:bg-[#f5d430] disabled:opacity-50 text-[#4E342E] font-bold text-base px-6 py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Přihlašuji…' : 'Přihlásit se'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-[#4E342E]/10" />
            <span className="text-xs text-[#6D4C41]/40 font-medium">nebo</span>
            <div className="flex-1 h-px bg-[#4E342E]/10" />
          </div>

          <button
            type="button"
            onClick={() => alert('Není implementováno – nemáme public URL.')}
            className="flex items-center justify-center gap-3 w-full border border-[#4E342E]/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#4E342E] hover:bg-[#FFF3E0] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Přihlásit se přes Google
          </button>

          <p className="text-center text-sm text-[#6D4C41]/60 mt-4">
            Nemáš účet?{' '}
            <Link href={`/${lang}/register`} className="text-[#4E342E] font-semibold hover:underline">
              Zaregistrovat se
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#6D4C41]/40 mt-6">
          Demo: demo@zemloveka.cz / demo1234
        </p>
      </div>
    </div>
  );
}
