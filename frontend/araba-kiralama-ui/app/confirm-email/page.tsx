'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

type State = 'loading' | 'success' | 'error';

function ConfirmEmailContent() {
  const params = useSearchParams();
  const [state, setState] = useState<State>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const userId = params.get('userId');
    const token = params.get('token');

    if (!userId || !token) {
      setState('error');
      setErrorMsg('Geçersiz doğrulama bağlantısı.');
      return;
    }

    authService.confirmEmail(userId, token)
      .then(() => setState('success'))
      .catch((err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setErrorMsg(msg || 'Doğrulama başarısız. Link geçersiz veya süresi dolmuş olabilir.');
        setState('error');
      });
  }, [params]);

  if (state === 'loading') {
    return (
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Doğrulanıyor...</p>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">E-posta Doğrulandı!</h1>
        <p className="text-slate-500 mb-6">
          Hesabınız aktif hale getirildi. Artık giriş yapabilirsiniz.
        </p>
        <Link href="/login"
          className="inline-block bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-xl font-bold transition-all">
          Giriş Yap →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full text-center">
      <div className="text-6xl mb-4">❌</div>
      <h1 className="text-2xl font-black text-slate-900 mb-2">Doğrulama Başarısız</h1>
      <p className="text-slate-500 mb-6">{errorMsg}</p>
      <Link href="/register" className="text-orange-500 hover:underline font-medium">
        Yeni hesap oluştur
      </Link>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Yükleniyor...</p>
        </div>
      }>
        <ConfirmEmailContent />
      </Suspense>
    </div>
  );
}
