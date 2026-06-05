import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'RideEase',
  description: 'Araç kiralama platformu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-slate-50 min-h-screen">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
