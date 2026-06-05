'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import { AdminStats } from '@/types';

export default function AdminDashboardPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) router.push('/');
  }, [user, isAdmin, isLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    userService.getStats().then(setStats).finally(() => setLoadingStats(false));
  }, [isAdmin]);

  if (isLoading || loadingStats) return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 bg-slate-200 rounded w-48" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!stats) return null;

  const statCards = [
    { icon: '🚗', label: 'Toplam Araç', value: stats.totalCars, color: 'from-blue-500 to-blue-600', sub: `${stats.availableCars} müsait` },
    { icon: '📋', label: 'Toplam Rezervasyon', value: stats.totalReservations, color: 'from-slate-600 to-slate-700', sub: `${stats.pendingReservations} bekliyor` },
    { icon: '✅', label: 'Onaylı', value: stats.approvedReservations, color: 'from-green-500 to-green-600', sub: 'aktif rezervasyon' },
    { icon: '⏳', label: 'Bekleyen', value: stats.pendingReservations, color: 'from-yellow-500 to-orange-500', sub: 'onay bekliyor' },
    { icon: '🚫', label: 'Müsait Değil', value: stats.totalCars - stats.availableCars, color: 'from-red-500 to-red-600', sub: 'araç kullanımda' },
    { icon: '💰', label: 'Toplam Gelir', value: `₺${stats.totalRevenue.toLocaleString('tr-TR')}`, color: 'from-emerald-500 to-teal-600', sub: 'tamamlanan kiralamalar' },
  ];

  const quickActions = [
    { href: '/admin/cars', icon: '🚗', label: 'Araç Ekle / Yönet', desc: 'Filosunu güncelle' },
    { href: '/admin/reservations', icon: '📋', label: 'Rezervasyonları Yönet', desc: `${stats.pendingReservations} bekleyen var` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Hoş geldiniz, {user?.firstName}</p>
        </div>
        <span className="text-sm text-slate-400">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${s.color}`} />
            </div>
            <p className="text-2xl font-black text-slate-900 mb-0.5">{s.value}</p>
            <p className="text-sm font-medium text-slate-700">{s.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Hızlı İşlemler */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl shadow-sm p-5 hover:shadow-md hover:border-orange-200 transition-all group"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-orange-100 transition-colors">
                {a.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{a.label}</p>
                <p className="text-sm text-slate-400">{a.desc}</p>
              </div>
              <svg className="ml-auto w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
