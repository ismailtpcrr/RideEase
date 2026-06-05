'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'İşlem başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="-mt-8 -mx-4 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full text-center p-8">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">E-posta Gönderildi</h1>
          <p className="text-slate-500 mb-6">
            <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
            Gelen kutunuzu kontrol edin.
          </p>
          <Link href="/login" className="text-orange-500 hover:underline font-medium">
            Giriş sayfasına dön →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-8 -mx-4 min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8">
        <div className="mb-8">
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">
            ← Giriş sayfasına dön
          </Link>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2">Şifremi Unuttum</h1>
        <p className="text-slate-500 mb-8">
          Kayıtlı e-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">E-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm transition-all"
              placeholder="ornek@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/25"
          >
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
}
