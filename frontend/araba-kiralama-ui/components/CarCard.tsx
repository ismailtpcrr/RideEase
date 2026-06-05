import Link from 'next/link';
import { Car } from '@/types';

export default function CarCard({ car }: { car: Car }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Görsel */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-1">
            <span className="text-5xl">🚗</span>
            <span className="text-xs text-slate-400 font-medium">{car.brand}</span>
          </div>
        )}

        {/* Durum badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
              car.isAvailable
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${car.isAvailable ? 'bg-green-200' : 'bg-red-200'}`} />
            {car.isAvailable ? 'Müsait' : 'Dolu'}
          </span>
        </div>

        {/* Kategori badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/60 text-white backdrop-blur-sm">
            {car.categoryName}
          </span>
        </div>
      </div>

      {/* İçerik */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-bold text-slate-900 text-base leading-tight">
            {car.brand} {car.model}
          </h3>
          <p className="text-slate-500 text-sm mt-0.5">{car.year} model</p>
          {(car.fuelType || car.transmission || car.seatCount > 0) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {car.fuelType && (
                <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  ⛽ {car.fuelType}
                </span>
              )}
              {car.transmission && (
                <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  ⚙️ {car.transmission}
                </span>
              )}
              {car.seatCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  🪑 {car.seatCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Fiyat + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-xl font-black text-slate-900">
              ₺{car.dailyPrice.toLocaleString('tr-TR')}
            </span>
            <span className="text-slate-400 text-xs ml-1">/gün</span>
          </div>
          <Link
            href={`/cars/${car.id}`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              car.isAvailable
                ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {car.isAvailable ? 'Kirala' : 'Dolu'}
          </Link>
        </div>
      </div>
    </div>
  );
}
