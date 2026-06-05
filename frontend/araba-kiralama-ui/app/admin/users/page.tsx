'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import { UserListItem } from '@/types';

const ROLES = ['Admin', 'Moderator', 'CarManager', 'Customer'];

export default function AdminUsersPage() {
  const { user, isAdmin, isStaff, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !isStaff)) router.push('/');
  }, [user, isStaff, isLoading, router]);

  useEffect(() => {
    if (!isStaff) return;
    userService.getAllUsers()
      .then(setUsers)
      .finally(() => setLoadingData(false));
  }, [isStaff]);

  const toggleLock = async (u: UserListItem) => {
    setActionId(u.id);
    try {
      if (u.isLocked) {
        await userService.activateUser(u.id);
        toast.success(`${u.firstName} ${u.lastName} aktif edildi.`);
      } else {
        await userService.deactivateUser(u.id);
        toast.success(`${u.firstName} ${u.lastName} deaktif edildi.`);
      }
      setUsers((prev) =>
        prev.map((item) => item.id === u.id ? { ...item, isLocked: !item.isLocked } : item)
      );
    } catch {
      toast.error('İşlem başarısız.');
    } finally {
      setActionId(null);
    }
  };

  const changeRole = async (u: UserListItem, newRole: string) => {
    if (newRole === u.role) return;
    setActionId(u.id);
    try {
      await userService.assignRole(u.id, newRole);
      setUsers((prev) => prev.map((item) => item.id === u.id ? { ...item, role: newRole } : item));
      toast.success(`${u.firstName} ${u.lastName} → ${newRole} rolüne atandı.`);
    } catch {
      toast.error('Rol değiştirilemedi.');
    } finally {
      setActionId(null);
    }
  };

  const toggleDeleteClaim = async (u: UserListItem) => {
    const hasClaim = u.claims?.['can_delete_car'] === 'true';
    setActionId(u.id);
    try {
      if (hasClaim) {
        await userService.removeClaim(u.id, 'can_delete_car');
        setUsers((prev) => prev.map((item) => {
          if (item.id !== u.id) return item;
          const claims = { ...item.claims };
          delete claims['can_delete_car'];
          return { ...item, claims };
        }));
        toast.success('Silme yetkisi kaldırıldı.');
      } else {
        await userService.addClaim(u.id, 'can_delete_car', 'true');
        setUsers((prev) => prev.map((item) =>
          item.id === u.id ? { ...item, claims: { ...item.claims, can_delete_car: 'true' } } : item
        ));
        toast.success('Silme yetkisi verildi.');
      }
    } catch {
      toast.error('İşlem başarısız.');
    } finally {
      setActionId(null);
    }
  };

  if (isLoading || loadingData) return <p className="text-gray-500">Yükleniyor...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <span className="text-sm text-gray-500">{users.length} kullanıcı</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Kullanıcı', 'E-posta', 'Rol', 'Yetkiler', 'Durum', 'Kayıt Tarihi', 'İşlem'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  {isAdmin && u.email !== user?.email ? (
                    <select
                      value={u.role}
                      disabled={actionId === u.id}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'Moderator' ? 'bg-yellow-100 text-yellow-700' :
                      u.role === 'CarManager' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.role === 'CarManager' && isAdmin && (
                    <button
                      onClick={() => toggleDeleteClaim(u)}
                      disabled={actionId === u.id}
                      title="Araç silme yetkisi"
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-colors disabled:opacity-50 ${
                        u.claims?.['can_delete_car'] === 'true'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {u.claims?.['can_delete_car'] === 'true' ? 'Silme: Açık' : 'Silme: Kapalı'}
                    </button>
                  )}
                  {u.role !== 'CarManager' && <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    u.isLocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {u.isLocked ? 'Kilitli' : 'Aktif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {isAdmin && u.role !== 'Admin' && u.email !== user?.email && (
                      <button
                        onClick={() => toggleLock(u)}
                        disabled={actionId === u.id}
                        className={`text-xs hover:underline disabled:opacity-50 ${u.isLocked ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {actionId === u.id ? '...' : u.isLocked ? 'Aktif Et' : 'Deaktif Et'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">Henüz kullanıcı yok.</p>
        )}
      </div>
    </div>
  );
}
