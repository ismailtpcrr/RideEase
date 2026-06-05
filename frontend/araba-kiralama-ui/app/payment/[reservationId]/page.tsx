'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { reservationService } from '@/services/reservationService';
import { paymentService } from '@/services/paymentService';
import { Reservation } from '@/types';

const PAYMENT_METHODS = ['KrediKartı', 'BankaKartı', 'Havale'];

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function PaymentPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paid, setPaid] = useState(false);

  const [form, setForm] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardHolder: '',
    paymentMethod: 'KrediKartı',
  });

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    reservationService.getMy()
      .then((reservations) => {
        const r = reservations.find((res) => res.id === Number(reservationId));
        if (!r) { router.push('/profile'); return; }
        if (r.status !== 'Approved') { router.push('/profile'); return; }
        setReservation(r);
      })
      .finally(() => setLoading(false));
  }, [user, reservationId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = form.cardNumber.replace(/\s/g, '');
    if (digits.length !== 16) { toast.error('Geçerli bir kart numarası girin.'); return; }
    if (form.cvv.length < 3) { toast.error('Geçerli bir CVV girin.'); return; }

    setSubmitting(true);
    try {
      await paymentService.create({
        reservationId: Number(reservationId),
        paymentMethod: form.paymentMethod,
        cardLastFour: digits.slice(-4),
      });
      setPaid(true);
      toast.success('Ödeme başarıyla tamamlandı!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Ödeme işlemi başarısız.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) return <p className="text-gray-500">Yükleniyor...</p>;
  if (!reservation) return null;

  const days = Math.max(0,
    (new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / 86400000
  );

  if (paid) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ödeme Tamamlandı</h1>
        <p className="text-slate-500 mb-6">
          {reservation.carBrand} {reservation.carModel} için ₺{reservation.totalPrice.toLocaleString('tr-TR')} ödemeniz alındı.
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          Profilime Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Ödeme</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sol — Rezervasyon Özeti */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Rezervasyon Özeti</h2>
            <div className="space-y-3">
              <div>
                <p className="text-lg font-bold text-slate-900">{reservation.carBrand} {reservation.carModel}</p>
                <p className="text-sm text-slate-500">{reservation.carPlate}</p>
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Alış</span>
                  <span className="font-medium">{reservation.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>İade</span>
                  <span className="font-medium">{reservation.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Süre</span>
                  <span className="font-medium">{days} gün</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Toplam</span>
                  <span className="text-xl font-black text-orange-600">₺{reservation.totalPrice.toLocaleString('tr-TR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ — Ödeme Formu */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-4">Kart Bilgileri</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ödeme Yöntemi</label>
                <div className="flex gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm({ ...form, paymentMethod: m })}
                      className={`flex-1 py-2 text-sm rounded-lg border transition-all ${
                        form.paymentMethod === m
                          ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kart Numarası</label>
                <input
                  required
                  type="text"
                  value={form.cardNumber}
                  onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kart Sahibi</label>
                <input
                  required
                  type="text"
                  value={form.cardHolder}
                  onChange={(e) => setForm({ ...form, cardHolder: e.target.value.toUpperCase() })}
                  placeholder="AD SOYAD"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Son Kullanma</label>
                  <input
                    required
                    type="text"
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                  <input
                    required
                    type="text"
                    value={form.cvv}
                    onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                Bu bir simülasyon ödeme sayfasıdır. Gerçek kart bilgisi girmeyin.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/25"
              >
                {submitting ? 'İşleniyor...' : `₺${reservation.totalPrice.toLocaleString('tr-TR')} Öde`}
              </button>
            </form>

            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
              <span>🔒</span>
              <span>256-bit SSL şifreleme · Güvenli ödeme simülasyonu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
