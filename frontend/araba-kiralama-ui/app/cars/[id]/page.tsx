'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Car } from '@/types';
import { carService } from '@/services/carService';
import { reservationService } from '@/services/reservationService';
import { useAuth } from '@/hooks/useAuth';

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ startDate: '', endDate: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    carService.getById(Number(id)).then(setCar).catch(() => toast.error('Araç bulunamadı.')).finally(() => setLoading(false));
  }, [id]);

  const totalDays = form.startDate && form.endDate
    ? Math.max(0, (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000)
    : 0;

  const totalPrice = totalDays * (car?.dailyPrice ?? 0);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    setSubmitting(true);
    try {
      await reservationService.create({ carId: Number(id), startDate: form.startDate, endDate: form.endDate, notes: form.notes || undefined });
      toast.success('Rezervasyonunuz alındı! Onay için bekleniyor.');
      setForm({ startDate: '', endDate: '', notes: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Rezervasyon oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 bg-slate-200 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-48 bg-slate-100 rounded-2xl mt-6" />
        </div>
      </div>
    </div>
  );

  if (!car) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🔍</div>
      <p className="text-slate-500">Araç bulunamadı.</p>
      <Link href="/" className="mt-4 inline-block text-orange-500 hover:underline">Ana sayfaya dön</Link>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-orange-500 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/" className="hover:text-orange-500 transition-colors">Araçlar</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{car.brand} {car.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sol — Araç Bilgisi (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Görsel */}
          <div className="relative h-72 lg:h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl overflow-hidden">
            {car.imageUrl ? (
              <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <span className="text-8xl">🚗</span>
                <span className="text-slate-400 font-medium">{car.brand} {car.model}</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full bg-slate-900/70 text-white text-sm font-medium backdrop-blur-sm">
                {car.categoryName}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1.5 rounded-full text-white text-sm font-semibold backdrop-blur-sm ${car.isAvailable ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
                {car.isAvailable ? '✓ Müsait' : '✗ Dolu'}
              </span>
            </div>
          </div>

          {/* Araç Başlığı */}
          <div>
            <h1 className="text-3xl font-black text-slate-900">{car.brand} {car.model}</h1>
            <p className="text-slate-500 mt-1">{car.year} model • Plaka: <span className="font-mono font-semibold text-slate-700">{car.plate}</span></p>
          </div>

          {/* Özellik Kartları */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '📅', label: 'Model Yılı', value: String(car.year) },
              { icon: '🏷️', label: 'Kategori', value: car.categoryName },
              { icon: '💰', label: 'Günlük Fiyat', value: `₺${car.dailyPrice.toLocaleString('tr-TR')}` },
              ...(car.fuelType ? [{ icon: '⛽', label: 'Yakıt', value: car.fuelType }] : []),
              ...(car.transmission ? [{ icon: '⚙️', label: 'Vites', value: car.transmission }] : []),
              ...(car.seatCount > 0 ? [{ icon: '🪑', label: 'Koltuk', value: `${car.seatCount} kişilik` }] : []),
              ...(car.mileage ? [{ icon: '🛣️', label: 'Kilometre', value: `${car.mileage.toLocaleString('tr-TR')} km` }] : []),
            ].map((f) => (
              <div key={f.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="text-xl mb-2">{f.icon}</div>
                <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
                <p className="font-bold text-slate-900 text-sm">{f.value}</p>
              </div>
            ))}
          </div>

          {car.description && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2">Açıklama</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{car.description}</p>
            </div>
          )}
        </div>

        {/* Sağ — Rezervasyon Formu (2/5) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-lg p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-3xl font-black text-slate-900">₺{car.dailyPrice.toLocaleString('tr-TR')}</span>
                <span className="text-slate-400 text-sm ml-1">/gün</span>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${car.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {car.isAvailable ? 'Müsait' : 'Dolu'}
              </span>
            </div>

            <form onSubmit={handleReserve} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Alış Tarihi</label>
                <input
                  type="date" required min={today} value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">İade Tarihi</label>
                <input
                  type="date" required min={form.startDate || today} value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notlar <span className="font-normal text-slate-400">(isteğe bağlı)</span></label>
                <textarea
                  value={form.notes} rows={2}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
                  placeholder="Özel isteğiniz varsa belirtin..."
                />
              </div>

              {/* Fiyat Özeti */}
              {totalDays > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>₺{car.dailyPrice.toLocaleString('tr-TR')} × {totalDays} gün</span>
                    <span>₺{totalPrice.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 text-base border-t border-orange-200 pt-2 mt-2">
                    <span>Toplam</span>
                    <span className="text-orange-600">₺{totalPrice.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !car.isAvailable}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/25"
              >
                {submitting ? 'Gönderiliyor...' : !user ? 'Giriş Yap ve Rezerve Et' : car.isAvailable ? 'Rezervasyon Yap' : 'Şu An Müsait Değil'}
              </button>
            </form>

            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
              <span>🔒</span>
              <span>Güvenli rezervasyon · Anında onay bildirimi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
