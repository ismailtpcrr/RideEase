'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const email = params.get('email') ?? '';
  const token = params.get('token') ?? '';

  useEffect(() => {
    if (!email || !token) router.push('/forgot-password');
  }, [email, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(email, token, form.newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Şifre sıfırlanamadı. Bağlantı geçersiz veya süresi dolmuş olabilir.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Şifre Güncellendi</h1>
        <p className="text-slate-500 mb-6">Yeni şifrenizle giriş yapabilirsiniz.</p>
        <Link
          href="/login"
          className="inline-block bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          Giriş Yap →
        </Link>
      </div>
    );
  }

  const inputClass = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm transition-all';

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-black text-slate-900 mb-2">Yeni Şifre Belirle</h1>
      <p className="text-slate-500 mb-8">En az 6 karakter kullanın.</p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Yeni Şifre</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Yeni Şifre Tekrar</label>
          <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/25"
        >
          {loading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="-mt-8 -mx-4 min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={<p className="text-slate-500">Yükleniyor...</p>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
