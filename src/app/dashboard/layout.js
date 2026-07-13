'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  DoorOpen, 
  Users, 
  CreditCard, 
  Wrench, 
  LogOut, 
  Menu, 
  X, 
  Loader2, 
  User 
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [landlord, setLandlord] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        const data = await res.json();
        setLandlord(data.landlord);
        setLoading(false);
      } catch (err) {
        // Hapus local storage dan kembalikan ke login
        localStorage.removeItem('landlord');
        router.push('/login');
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('landlord');
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { name: 'Ringkasan', href: '/dashboard', icon: Home },
    { name: 'Kelola Kamar', href: '/dashboard/rooms', icon: DoorOpen },
    { name: 'Kelola Penyewa', href: '/dashboard/tenants', icon: Users },
    { name: 'Tagihan & Keuangan', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Keluhan / Aduan', href: '/dashboard/complaints', icon: Wrench },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center gap-4">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">Memverifikasi sesi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-900 bg-slate-950 flex-shrink-0">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 gap-2 border-b border-slate-900">
          <div className="p-1.5 bg-indigo-600 rounded-lg">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            KosKita
          </span>
        </div>

        {/* User Info Section */}
        <div className="p-4 border-b border-slate-900 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold border border-slate-700">
            {landlord?.name ? landlord.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate">{landlord?.name}</h4>
            <p className="text-xs text-slate-500 truncate">{landlord?.email}</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                  isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition duration-200"
          >
            <LogOut className="h-5 w-5" />
            Keluar Aplikasi
          </button>
        </div>
      </aside>

      {/* Mobile Header / Sidebar Drawer */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-slate-900 bg-slate-950 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              KosKita
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Content drawer */}
            <div className="relative flex flex-col w-64 max-w-xs bg-slate-950 border-r border-slate-900 h-full z-10 p-6 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold text-white">KosKita</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 border border-slate-800 bg-slate-900 rounded-lg text-slate-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-900">
                <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold">
                  {landlord?.name ? landlord.name[0].toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold truncate text-white">{landlord?.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{landlord?.email}</p>
                </div>
              </div>

              <nav className="flex-1 space-y-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition duration-200 ${
                        isActive 
                          ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 mt-6 border-t border-slate-900">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  Keluar Aplikasi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
