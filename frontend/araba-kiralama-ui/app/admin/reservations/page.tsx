'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { reservationService } from '@/services/reservationService';
import { Reservation } from '@/types';
import StatusBadge from '@/components/StatusBadge';

export default function AdminReservationsPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) router.push('/');
  }, [user, isAdmin, isLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    reservationService
      .getAll()
      .then(setReservations)
      .finally(() => setLoadingData(false));
  }, [isAdmin]);

  const doAction = async (id: number, action: 'approve' | 'reject' | 'complete') => {
    setActionId(id);
    try {
      await reservationService[action](id);
      const updated = await reservationService.getAll();
      setReservations(updated);
    } catch {
      toast.error('İşlem başarısız.');
    } finally {
      setActionId(null);
    }
  };

  if (isLoading || loadingData) return <p className="text-gray-500">Yükleniyor...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rezervasyon Yönetimi</h1>

      {reservations.length === 0 && <p className="text-gray-500 text-sm">Rezervasyon yok.</p>}

      <div className="space-y-4">
        {reservations.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">{r.carBrand} {r.carModel} — {r.carPlate}</p>
                <p className="text-sm text-gray-500">{r.startDate} → {r.endDate}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>Toplam: <strong className="text-blue-700">₺{r.totalPrice.toLocaleString('tr-TR')}</strong></span>
              {r.notes && <span className="text-gray-400">Not: {r.notes}</span>}
            </div>

            {r.status === 'Pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => doAction(r.id, 'approve')}
                  disabled={actionId === r.id}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Onayla
                </button>
                <button
                  onClick={() => doAction(r.id, 'reject')}
                  disabled={actionId === r.id}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Reddet
                </button>
              </div>
            )}

            {r.status === 'Approved' && (
              <button
                onClick={() => doAction(r.id, 'complete')}
                disabled={actionId === r.id}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Tamamlandı İşaretle
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
