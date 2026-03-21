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
