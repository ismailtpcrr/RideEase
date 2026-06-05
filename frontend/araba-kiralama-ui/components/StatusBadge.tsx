import { ReservationStatus } from '@/types';

const statusConfig: Record<ReservationStatus, { label: string; className: string }> = {
  Pending:   { label: 'Bekliyor',   className: 'bg-yellow-100 text-yellow-800' },
  Approved:  { label: 'Onaylandı', className: 'bg-green-100 text-green-800' },
  Rejected:  { label: 'Reddedildi', className: 'bg-red-100 text-red-800' },
  Cancelled: { label: 'İptal',     className: 'bg-gray-100 text-gray-700' },
  Completed: { label: 'Tamamlandı', className: 'bg-blue-100 text-blue-800' },
};

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
