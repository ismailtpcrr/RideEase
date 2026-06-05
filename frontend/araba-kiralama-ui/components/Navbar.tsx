'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout, isAdmin, isStaff } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm group-hover:bg-orange-400 transition-colors">
            RE
          </div>
          <span className="text-lg font-bold tracking-tight">
            Ride<span className="text-orange-500">Ease</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 text-sm">
          <Link href="/" className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
            Araçlar
          </Link>

          {user ? (
            <>
              {isStaff ? (
                <>
                  <Link href="/admin" className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
                    Dashboard
                  </Link>
                  {(isAdmin || user.role === 'CarManager') && (
                    <Link href="/admin/cars" className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
                      Araçlar
                    </Link>
                  )}
                  {(isAdmin || user.role === 'Moderator') && (
                    <Link href="/admin/reservations" className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
                      Rezervasyonlar
                    </Link>
                  )}
                  {(isAdmin || user.role === 'Moderator') && (
                    <Link href="/admin/users" className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
                      Kullanıcılar
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/profile" className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
                  Profilim
                </Link>
              )}

              <div className="ml-3 flex items-center gap-3 pl-3 border-l border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">
                    {user.firstName[0]}
                  </div>
                  <span className="text-slate-300 text-sm">{user.firstName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white text-sm transition-all"
                >
                  Çıkış
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-400 transition-all"
              >
                Üye Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
