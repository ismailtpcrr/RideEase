'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(form);
      login(data);
      router.push(data.role === 'Admin' ? '/admin' : '/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'E-posta veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-mt-8 -mx-4 min-h-screen flex">
      {/* Sol panel */}
      <div className="hidden lg:flex flex-1 bg-slate-900 text-white flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black text-sm">AK</div>
          <span className="text-xl font-bold">Araba<span className="text-orange-500">Kiralama</span></span>
        </Link>

        <div>
          <blockquote className="text-2xl font-bold leading-snug text-white mb-4">
            "Yolculuğunuz için en iyi araç, en uygun fiyatla burada."
          </blockquote>
          <p className="text-slate-400">Binlerce müşterinin güvendiği araç kiralama platformu.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '500+', label: 'Araç Filosu' },
            { value: '50K+', label: 'Mutlu Müşteri' },
            { value: '%99', label: 'Memnuniyet' },
            { value: '7/24', label: 'Destek' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800 rounded-xl p-4">
              <div className="text-xl font-black text-orange-500">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sağ panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-black text-xs text-white">AK</div>
              <span className="font-bold text-slate-900">RideEase</span>
            </Link>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-2">Hoş geldiniz</h1>
          <p className="text-slate-500 mb-8">Devam etmek için giriş yapın.</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-posta</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm transition-all"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Şifre</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/25"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>
          </form>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-500">
              Hesabın yok mu?{' '}
              <Link href="/register" className="text-orange-500 hover:text-orange-400 font-semibold">
                Ücretsiz üye ol
              </Link>
            </p>
            <Link href="/forgot-password" className="text-sm text-slate-400 hover:text-orange-500 transition-colors">
              Şifremi unuttum
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
