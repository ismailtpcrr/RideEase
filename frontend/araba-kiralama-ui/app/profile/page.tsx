'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import { reservationService } from '@/services/reservationService';
import { paymentService } from '@/services/paymentService';
import { Payment, Reservation, UserProfile } from '@/types';
import StatusBadge from '@/components/StatusBadge';

const LICENSE_CLASSES = ['A', 'B', 'C', 'D'];

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Map<number, Payment>>(new Map());
  const [loadingData, setLoadingData] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [tab, setTab] = useState<'profile' | 'reservations' | 'license' | 'password'>('profile');

  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', address: '' });
  const [saving, setSaving] = useState(false);

  const [licenseForm, setLicenseForm] = useState({ licenseNumber: '', licenseClass: 'B', expiryDate: '' });
  const [savingLicense, setSavingLicense] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([userService.getProfile(), reservationService.getMy()])
      .then(([p, r]) => {
        setProfile(p);
        setEditForm({ firstName: p.firstName, lastName: p.lastName, address: p.address || '' });
        if (p.license) {
          setLicenseForm({
            licenseNumber: p.license.licenseNumber,
            licenseClass: p.license.licenseClass,
            expiryDate: p.license.expiryDate,
          });
        }
        setReservations(r);
        return r;
      })
      .then(async (r) => {
        const approved = r.filter((res) => res.status === 'Approved');
        const paymentMap = new Map<number, Payment>();
        await Promise.all(
          approved.map(async (res) => {
            const p = await paymentService.getByReservation(res.id);
            if (p) paymentMap.set(res.id, p);
          })
        );
        setPayments(paymentMap);
      })
      .finally(() => setLoadingData(false));
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateProfile(editForm);
      setProfile(updated);
      toast.success('Profil güncellendi.');
    } catch {
      toast.error('Güncelleme başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLicense(true);
    try {
      if (profile?.license) {
        await userService.updateLicense(licenseForm);
        toast.success('Ehliyet güncellendi.');
      } else {
        await userService.addLicense(licenseForm);
        toast.success('Ehliyet eklendi.');
      }
      const updated = await userService.getProfile();
      setProfile(updated);
    } catch {
      toast.error('İşlem başarısız.');
    } finally {
      setSavingLicense(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor.');
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Şifre başarıyla değiştirildi.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Rezervasyonu iptal etmek istiyor musunuz?')) return;
    setCancellingId(id);
    try {
      await reservationService.cancel(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
      toast.success('Rezervasyon iptal edildi.');
    } catch {
      toast.error('İptal işlemi başarısız.');
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading || loadingData) return <p className="text-gray-500">Yükleniyor...</p>;

  const tabs = [
    { key: 'profile', label: 'Profil' },
    { key: 'reservations', label: 'Rezervasyonlarım' },
    { key: 'license', label: 'Ehliyetim' },
    { key: 'password', label: 'Güvenlik' },
  ] as const;

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hesabım</h1>

      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Profil Bilgileri</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                <input type="text" value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                <input type="text" value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input type="email" value={profile?.email} disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <input type="text" value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className={inputClass} />
            </div>
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        </div>
      )}

      {tab === 'reservations' && (
        <div className="space-y-4">
          {reservations.length === 0 && (
            <p className="text-gray-500 text-sm">Henüz rezervasyonunuz yok.</p>
          )}
          {reservations.map((r) => {
            const payment = payments.get(r.id);
            const isPaid = payment?.status === 'Completed';
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{r.carBrand} {r.carModel}</p>
                    <p className="text-sm text-gray-500">{r.carPlate}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Başlangıç</p>
                    <p>{r.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Bitiş</p>
                    <p>{r.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Toplam</p>
                    <p className="font-semibold text-blue-700">₺{r.totalPrice.toLocaleString('tr-TR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {(r.status === 'Pending' || r.status === 'Approved') && (
                    <button onClick={() => handleCancel(r.id)} disabled={cancellingId === r.id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50">
                      {cancellingId === r.id ? 'İptal ediliyor...' : 'İptal Et'}
                    </button>
                  )}
                  {r.status === 'Approved' && (
                    isPaid ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-700 font-medium bg-green-50 px-3 py-1 rounded-full">
                        ✓ Ödendi
                      </span>
                    ) : (
                      <Link href={`/payment/${r.id}`}
                        className="inline-flex items-center gap-1 text-sm bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                        Ödeme Yap
                      </Link>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'license' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Ehliyet Bilgileri</h2>
          {profile?.license && (
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile.license.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {profile.license.isVerified ? 'Doğrulandı' : 'Doğrulama Bekliyor'}
              </span>
            </div>
          )}
          <form onSubmit={handleSaveLicense} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ehliyet No</label>
                <input required type="text" value={licenseForm.licenseNumber}
                  onChange={(e) => setLicenseForm({ ...licenseForm, licenseNumber: e.target.value })}
                  className={inputClass} placeholder="12345678901" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sınıf</label>
                <select value={licenseForm.licenseClass}
                  onChange={(e) => setLicenseForm({ ...licenseForm, licenseClass: e.target.value })}
                  className={inputClass}>
                  {LICENSE_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Son Geçerlilik Tarihi</label>
              <input required type="date" value={licenseForm.expiryDate}
                onChange={(e) => setLicenseForm({ ...licenseForm, expiryDate: e.target.value })}
                className={inputClass} />
            </div>
            <button type="submit" disabled={savingLicense}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {savingLicense ? 'Kaydediliyor...' : profile?.license ? 'Güncelle' : 'Ekle'}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Şifre Değiştir</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
              <input required type="password" value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
              <input required type="password" minLength={6} value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className={inputClass} placeholder="En az 6 karakter" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre Tekrar</label>
              <input required type="password" value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className={inputClass} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={savingPassword}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {savingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
