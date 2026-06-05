'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { carService } from '@/services/carService';
import { Car, CarCategory, CarCreateRequest } from '@/types';

const FUEL_TYPES = ['Benzin', 'Dizel', 'Elektrik', 'Hibrit', 'LPG'];
const TRANSMISSIONS = ['Otomatik', 'Manuel'];

const emptyForm: CarCreateRequest = {
  brand: '', model: '', year: new Date().getFullYear(),
  plate: '', dailyPrice: 0, isAvailable: true,
  description: '', imageUrl: '',
  fuelType: 'Benzin', transmission: 'Otomatik', seatCount: 5, mileage: undefined,
  categoryId: 1,
};

export default function AdminCarsPage() {
  const { user, isAdmin, isStaff, hasClaim, isLoading } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<CarCategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CarCreateRequest>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const canDelete = isAdmin || hasClaim('can_delete_car', 'true');

  useEffect(() => {
    if (!isLoading && (!user || !isStaff)) router.push('/');
  }, [user, isStaff, isLoading, router]);

  useEffect(() => {
    if (!isStaff) return;
    Promise.all([carService.getAll(), carService.getCategories()])
      .then(([c, cats]) => { setCars(c); setCategories(cats); })
      .finally(() => setLoadingData(false));
  }, [isAdmin]);

  const set = (field: keyof CarCreateRequest, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await carService.uploadImage(file);
      set('imageUrl', url);
    } catch {
      toast.error('Görsel yüklenemedi.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await carService.update(editingId, form);
      } else {
        await carService.create(form);
      }
      const updated = await carService.getAll();
      setCars(updated);
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'İşlem başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (car: Car) => {
    setEditingId(car.id);
    setForm({
      brand: car.brand, model: car.model, year: car.year,
      plate: car.plate, dailyPrice: car.dailyPrice, isAvailable: car.isAvailable,
      description: car.description || '', imageUrl: car.imageUrl || '',
      fuelType: car.fuelType || 'Benzin', transmission: car.transmission || 'Otomatik',
      seatCount: car.seatCount || 5, mileage: car.mileage,
      categoryId: car.categoryId,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Aracı silmek istiyor musunuz?')) return;
    setDeletingId(id);
    try {
      await carService.delete(id);
      setCars((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error('Silme işlemi başarısız.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (car: Car) => {
    await carService.setAvailability(car.id, !car.isAvailable);
    setCars((prev) => prev.map((c) => c.id === car.id ? { ...c, isAvailable: !c.isAvailable } : c));
  };

  if (isLoading || loadingData) return <p className="text-gray-500">Yükleniyor...</p>;


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Araç Yönetimi</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Yeni Araç
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {editingId ? 'Araç Düzenle' : 'Yeni Araç Ekle'}
          </h2>
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
              <input required value={form.brand} onChange={(e) => set('brand', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input required value={form.model} onChange={(e) => set('model', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
              <input type="number" required value={form.year} onChange={(e) => set('year', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plaka</label>
              <input required value={form.plate} onChange={(e) => set('plate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Günlük Fiyat (₺)</label>
              <input type="number" required value={form.dailyPrice} onChange={(e) => set('dailyPrice', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select value={form.categoryId} onChange={(e) => set('categoryId', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yakıt Türü</label>
              <select value={form.fuelType} onChange={(e) => set('fuelType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vites</label>
              <select value={form.transmission} onChange={(e) => set('transmission', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Koltuk Sayısı</label>
              <input type="number" required min={2} max={9} value={form.seatCount} onChange={(e) => set('seatCount', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilometre (opsiyonel)</label>
              <input type="number" value={form.mileage ?? ''} onChange={(e) => set('mileage', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="km" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Araç Görseli</label>
              <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <label className={`flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-blue-400 transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageFile} className="hidden" />
                    <span className="text-gray-500">{uploadingImage ? 'Yükleniyor...' : 'Dosya seç (.jpg, .png, .webp — max 5MB)'}</span>
                  </label>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => set('imageUrl', e.target.value)}
                    placeholder="veya görsel URL yapıştır"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="önizleme" className="w-20 h-16 object-cover rounded-lg border border-gray-200 shrink-0" />
                )}
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="avail" checked={form.isAvailable}
                onChange={(e) => set('isAvailable', e.target.checked)} className="rounded" />
              <label htmlFor="avail" className="text-sm font-medium text-gray-700">Müsait</label>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Ekle'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(''); }}
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Araç', 'Plaka', 'Kategori', 'Fiyat/gün', 'Durum', 'İşlem'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{car.brand} {car.model} ({car.year})</td>
                <td className="px-4 py-3 text-gray-600">{car.plate}</td>
                <td className="px-4 py-3 text-gray-600">{car.categoryName}</td>
                <td className="px-4 py-3 text-blue-700 font-semibold">₺{car.dailyPrice.toLocaleString('tr-TR')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleAvailability(car)}
                    className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-opacity hover:opacity-80 ${car.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {car.isAvailable ? 'Müsait' : 'Dolu'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(car)}
                      className="text-blue-600 hover:underline text-xs">Düzenle</button>
                    {canDelete && (
                      <button onClick={() => handleDelete(car.id)} disabled={deletingId === car.id}
                        className="text-red-600 hover:underline text-xs disabled:opacity-50">
                        {deletingId === car.id ? '...' : 'Sil'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cars.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">Henüz araç yok.</p>
        )}
      </div>
    </div>
  );
}
