'use client';

import Link from 'next/link';
import { Home, Users, CreditCard, Wrench, CheckCircle, ArrowRight, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              KosKita
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition shadow-lg shadow-indigo-600/30"
            >
              Mulai Sekarang
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl -z-10 animate-pulse"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/50 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6">
            <Star className="h-3.5 w-3.5 fill-indigo-300" />
            SaaS Pengelolaan Kos Terbaik di Indonesia
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
            Kelola Kos-Kosan Jadi Lebih <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Praktis, Akurat & Otomatis
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Hentikan pencatatan manual di kertas. Pantau kamar kosong, tagih sewa bulanan otomatis, verifikasi bukti transfer, dan tindak lanjuti komplain fasilitas dalam satu dasbor premium.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center gap-2 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl transition shadow-xl shadow-indigo-600/35 group"
            >
              Coba Gratis Sekarang
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center text-base font-semibold border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white px-8 py-4 rounded-xl transition"
            >
              Lihat Demo Dasbor
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Fitur Lengkap untuk Kemudahan Manajemen Kos</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Dirancang berdasarkan kebutuhan riil pemilik kos untuk mempercepat operasional harian.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50 transition duration-300">
              <div className="p-3 bg-indigo-900/50 text-indigo-400 rounded-xl w-fit mb-6">
                <Home className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Manajemen Kamar</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pantau ketersediaan kamar, filter kamar kosong atau terisi, dan kelola tarif sewa per kamar secara fleksibel.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50 transition duration-300">
              <div className="p-3 bg-indigo-900/50 text-indigo-400 rounded-xl w-fit mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Data Penyewa Aktif</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Simpan data identitas penyewa, kontak telepon, email, dan tanggal mulai masuk sewa dengan rapi.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50 transition duration-300">
              <div className="p-3 bg-indigo-900/50 text-indigo-400 rounded-xl w-fit mb-6">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Tagihan & Kuitansi</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Buat tagihan sewa otomatis bulanan, catat status bayar, verifikasi bukti transfer, dan cetak kuitansi digital.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50 transition duration-300">
              <div className="p-3 bg-indigo-900/50 text-indigo-400 rounded-xl w-fit mb-6">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Keluhan Penyewa</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pantau laporan kerusakan fasilitas kos dari penyewa, tandai status perbaikan dari baru, diproses, hingga selesai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Grade Section */}
      <section className="py-20 border-t border-slate-900 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Skema Harga SaaS (Mockup)</h2>
            <p className="text-slate-400">Semua fitur terbuka untuk kebutuhan penilaian tugas proyek.</p>
          </div>

          <div className="max-w-md mx-auto rounded-3xl border border-indigo-500/30 bg-slate-900/80 p-8 shadow-2xl shadow-indigo-500/5">
            <div className="text-center mb-6">
              <span className="text-indigo-400 text-xs font-extrabold tracking-wider uppercase bg-indigo-900/50 px-3 py-1 rounded-full">
                EDUKASI / PENILAIAN
              </span>
              <h3 className="text-2xl font-bold mt-4">Full Access Pass</h3>
              <div className="flex justify-center items-baseline mt-4">
                <span className="text-5xl font-extrabold tracking-tight">Rp 0</span>
                <span className="text-slate-400 ml-1">/selamanya</span>
              </div>
              <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                Lisensi gratis khusus untuk demonstrasi aplikasi, pengujian dosen penilai, dan simulasi fitur.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                'Kelola Kamar Kos Tanpa Batas',
                'Input & Check-out Penyewa',
                'Otomatisasi Tagihan & Pencatatan',
                'Simulasi Unggah Bukti Bayar',
                'Cetak Kuitansi & Invoice PDF',
                'Kelola Aduan Kerusakan Kamar',
                'Database PostgreSQL (Neon DB)',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span className="text-sm text-slate-200">{feature}</span>
                </div>
              ))}
            </div>

            <Link 
              href="/register" 
              className="block w-full text-center font-semibold bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              Registrasi Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} KosKita. Proyek Mandiri Tugas Kuliah Software as a Service.
        </div>
      </footer>
    </div>
  );
}
