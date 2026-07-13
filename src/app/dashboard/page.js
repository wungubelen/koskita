'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, 
  DoorOpen, 
  Users, 
  CreditCard, 
  Wrench, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) {
        throw new Error('Gagal mengambil data statistik.');
      }
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-900/10 text-red-400">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const occupancyPercent = stats.totalRooms > 0 
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ringkasan Dasbor</h1>
          <p className="text-slate-400 text-sm mt-1">Status operasional kos-kosan Anda hari ini.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/rooms" 
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <DoorOpen className="h-4.5 w-4.5" />
            Kelola Kamar
          </Link>
          <Link 
            href="/dashboard/tenants" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/25"
          >
            <Plus className="h-4.5 w-4.5" />
            Check-In Penyewa
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Occupancy */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Okupansi Kamar</span>
            <DoorOpen className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats.occupiedRooms}</span>
            <span className="text-slate-500 text-sm">/ {stats.totalRooms} Kamar Terisi</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Rasio Okupansi</span>
              <span>{occupancyPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${occupancyPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Unpaid bills */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Belum Dibayar</span>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-rose-400">{formatRupiah(stats.unpaidAmount)}</span>
            <span className="text-slate-500 text-xs mt-1">{stats.unpaidCount} Tagihan menunggu pembayaran</span>
          </div>
          <div className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Harap hubungi penyewa untuk melunasi
          </div>
        </div>

        {/* Card 3: Pending verification */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Perlu Verifikasi</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-amber-400">{formatRupiah(stats.pendingAmount)}</span>
            <span className="text-slate-500 text-xs mt-1">{stats.pendingCount} Bukti transfer diunggah</span>
          </div>
          <div className="mt-4 text-xs text-amber-400/80 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Segera verifikasi bukti pembayaran
          </div>
        </div>

        {/* Card 4: Active complaints */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Aduan Aktif</span>
            <Wrench className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400">{stats.activeComplaints}</span>
            <span className="text-slate-500 text-sm">Masalah Terbuka</span>
          </div>
          <div className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Butuh tindak lanjut perbaikan fasilitas
          </div>
        </div>
      </div>

      {/* Grid Split layout: Recent Bills & Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Bills (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Aktivitas Tagihan Terbaru</h3>
            <Link 
              href="/dashboard/billing" 
              className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1 group"
            >
              Semua Tagihan
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden">
            {data.recentBills.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Belum ada tagihan yang dibuat.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-950 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase">
                      <th className="p-4">Kamar / Penyewa</th>
                      <th className="p-4">Jumlah</th>
                      <th className="p-4">Jatuh Tempo</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {data.recentBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-900/20 transition">
                        <td className="p-4">
                          <div className="font-semibold text-white">Kamar {bill.room?.roomNumber}</div>
                          <div className="text-xs text-slate-400">{bill.tenant?.name}</div>
                        </td>
                        <td className="p-4 font-medium text-slate-200">{formatRupiah(bill.amount)}</td>
                        <td className="p-4 text-slate-400 text-xs">
                          {new Date(bill.dueDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          {bill.status === 'PAID' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Lunas
                            </span>
                          )}
                          {bill.status === 'PENDING_VERIFICATION' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Perlu Verifikasi
                            </span>
                          )}
                          {bill.status === 'UNPAID' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Belum Bayar
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Complaints (1/3 width) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Laporan Keluhan Terbaru</h3>
            <Link 
              href="/dashboard/complaints" 
              className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1 group"
            >
              Semua Aduan
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          <div className="border border-slate-900 bg-slate-900/10 rounded-2xl p-4 space-y-4">
            {data.recentComplaints.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                Tidak ada keluhan aktif saat ini. 👍
              </div>
            ) : (
              <div className="space-y-3.5">
                {data.recentComplaints.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-slate-900 bg-slate-900/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">Kamar {c.room?.roomNumber}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        c.status === 'NEW' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {c.status === 'NEW' ? 'Baru' : 'Diproses'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed truncate">{c.description}</p>
                    <div className="text-[10px] text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
