'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CarCard from '@/components/CarCard';
import { Car } from '@/types';
import { carService } from '@/services/carService';

const CATEGORIES = ['Tümü', 'Sedan', 'SUV', 'Minivan', 'Ticari', 'Lüks'];

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filtered, setFiltered] = useState<Car[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carService
      .getAll()
      .then((data) => { setCars(data); setFiltered(data); })
      .catch(() => setError('Araçlar yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      cars.filter((c) => {
        const matchSearch =
          c.brand.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.categoryName.toLowerCase().includes(q);
        const matchCat = activeCategory === 'Tümü' || c.categoryName === activeCategory;
        return matchSearch && matchCat;
      })
    );
  }, [search, activeCategory, cars]);

  const availableCount = cars.filter((c) => c.isAvailable).length;

  return (
    <div className="-mt-8 -mx-4">
      {/* Hero Section */}
      <section
        className="relative bg-slate-900 text-white overflow-hidden"
        style={{ minHeight: '520px' }}
      >
        {/* Dekoratif arka plan */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #f97316, transparent)' }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-12">
          {/* Sol — Metin */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              {availableCount} araç müsait
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4">
              Güvenli ve Uygun<br />
              <span className="text-orange-500">Araç Kiralama</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-md">
              Yüzlerce araç seçeneği, rekabetçi fiyatlar ve 7/24 destek ile sizi bekliyoruz.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link
                href="#fleet"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/25"
              >
                Araçları İncele
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-xl transition-all"
              >
                Ücretsiz Üye Ol
              </Link>
            </div>
          </div>

          {/* Sağ — İstatistikler */}
          <div className="flex-1 grid grid-cols-2 gap-4 max-w-sm w-full">
            {[
              { icon: '🚗', value: `${cars.length}+`, label: 'Araç Çeşidi' },
              { icon: '✅', value: '%100', label: 'Güvenli Ödeme' },
              { icon: '⚡', value: '5 dk', label: 'Hızlı Kiralama' },
              { icon: '🎯', value: '7/24', label: 'Müşteri Desteği' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm"
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-slate-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Araç Listesi */}
      <section id="fleet" className="max-w-7xl mx-auto px-6 py-12">
        {/* Başlık + Arama */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Araç Filosu</h2>
            <p className="text-slate-500 text-sm mt-0.5">{filtered.length} araç listeleniyor</p>
          </div>
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Marka veya model ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Kategori Filtreleri */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-slate-500">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-500 font-medium">Arama kriterlerine uygun araç bulunamadı.</p>
            <button onClick={() => { setSearch(''); setActiveCategory('Tümü'); }} className="mt-4 text-orange-500 hover:underline text-sm">
              Filtreleri temizle
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-xs">AK</div>
            <span className="text-white font-semibold">RideEase</span>
          </div>
          <p className="text-sm">© 2025 RideEase. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
