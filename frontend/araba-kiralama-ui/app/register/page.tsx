'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/authService';

const inputClass =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm transition-all';
const labelClass = 'block text-sm font-semibold text-slate-700 mb-2';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', birthDate: '', address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const [registered, setRegistered] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(form);
      setRegistered(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Kayıt başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendConfirmation(form.email);
    } finally {
      setResending(false);
    }
  };

  if (registered) {
    return (
      <div className="-mt-8 -mx-4 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full text-center p-8">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">E-postanızı Doğrulayın</h1>
          <p className="text-slate-500 mb-6">
            <strong>{form.email}</strong> adresine doğrulama linki gönderdik.
            Gelen kutunuzu (ve spam klasörünü) kontrol edin.
          </p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-orange-500 hover:underline disabled:opacity-50"
          >
            {resending ? 'Gönderiliyor...' : 'Tekrar gönder'}
          </button>
          <div className="mt-6">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">
              Giriş sayfasına dön →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-8 -mx-4 min-h-screen flex">
      {/* Sol panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-slate-900 text-white p-12 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center font-black text-sm">AK</div>
          <span className="text-xl font-bold">Araba<span className="text-orange-500">Kiralama</span></span>
        </Link>

        <div>
          <h2 className="text-3xl font-black mb-4 leading-tight">Aramıza katılın,<br />fırsatları kaçırmayın.</h2>
          <div className="space-y-3">
            {[
              '✅ Ücretsiz üyelik, anında aktif',
              '🚗 Yüzlerce araç arasından seçim yapın',
              '💳 Güvenli online rezervasyon',
              '🎁 İlk kiralama indirimlerinden yararlanın',
            ].map((item) => (
              <p key={item} className="text-slate-300 text-sm">{item}</p>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-sm mb-1">Platform güvencesi</p>
          <p className="text-white font-semibold">Tüm araçlarımız sigortalı ve bakımlıdır.</p>
        </div>
      </div>

      {/* Sağ panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-black text-xs text-white">AK</div>
              <span className="font-bold text-slate-900">RideEase</span>
            </Link>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-2">Hesap oluşturun</h1>
          <p className="text-slate-500 mb-8">Ücretsiz ve hızlıca kayıt olun.</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Ad</label>
                <input type="text" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputClass} placeholder="Adınız" />
              </div>
              <div>
                <label className={labelClass}>Soyad</label>
                <input type="text" required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputClass} placeholder="Soyadınız" />
              </div>
            </div>

            <div>
              <label className={labelClass}>E-posta</label>
              <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} placeholder="ornek@email.com" />
            </div>

            <div>
              <label className={labelClass}>Şifre</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} className={inputClass} placeholder="En az 6 karakter" />
            </div>

            <div>
              <label className={labelClass}>Doğum Tarihi</label>
              <input type="date" required value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Adres <span className="font-normal text-slate-400">(isteğe bağlı)</span></label>
              <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)} className={inputClass} placeholder="Adresiniz" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/25 mt-2"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Hesap Oluştur →'}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-6">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-400 font-semibold">
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
