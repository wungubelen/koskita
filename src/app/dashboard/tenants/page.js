'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Calendar, Phone, Mail, AlertCircle, X, Loader2, LogOut } from 'lucide-react';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchTenants();
    fetchVacantRooms();
  }, []);

  async function fetchTenants() {
    try {
      const res = await fetch('/api/tenants');
      if (!res.ok) throw new Error('Gagal mengambil data penyewa.');
      const data = await res.json();
      setTenants(data.tenants || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function fetchVacantRooms() {
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error('Gagal mengambil data kamar.');
      const data = await res.json();
      // Hanya ambil kamar yang statusnya VACANT
      const vacant = (data.rooms || []).filter(r => r.status === 'VACANT');
      setVacantRooms(vacant);
    } catch (err) {
      console.error(err);
    }
  }

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          roomId,
          checkInDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal melakukan check-in.');

      // Refresh data
      await fetchTenants();
      await fetchVacantRooms();
      setShowCheckInModal(false);
      setName('');
      setPhone('');
      setEmail('');
      setRoomId('');
      setCheckInDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCheckOut = async (id, tenantName) => {
    if (!confirm(`Apakah Anda yakin ingin melakukan check-out untuk ${tenantName}? Kamar akan kosong kembali.`)) return;

    try {
      const res = await fetch(`/api/tenants/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal check-out penyewa.');
      }

      await fetchTenants();
      await fetchVacantRooms();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Kelola Penyewa Kos</h1>
          <p className="text-slate-400 text-sm mt-1">Registrasi penyewa baru, catat nomor kontak, dan proses check-out.</p>
        </div>
        <button
          onClick={() => setShowCheckInModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/25"
        >
          <Plus className="h-4.5 w-4.5" />
          Check-In Penyewa
        </button>
      </div>

      {error && (
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-900/10 text-red-400 flex items-center gap-3">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-20 border border-slate-900 bg-slate-900/10 rounded-2xl">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300">Belum ada penyewa kos aktif</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">Daftarkan penyewa dengan menempatkan mereka pada kamar kosong.</p>
          <button
            onClick={() => setShowCheckInModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            Check-In Sekarang
          </button>
        </div>
      ) : (
        /* Tenants Table */
        <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-950 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase">
                  <th className="p-4">Nama Penyewa</th>
                  <th className="p-4">Kamar</th>
                  <th className="p-4">Kontak</th>
                  <th className="p-4">Tanggal Masuk</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-900/20 transition">
                    <td className="p-4 font-semibold text-white">{tenant.name}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Kamar {tenant.room?.roomNumber}
                      </span>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2 text-slate-300 text-xs">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        <span>{tenant.phone}</span>
                      </div>
                      {tenant.email && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <Mail className="h-3.5 w-3.5 text-slate-500" />
                          <span>{tenant.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span>
                          {new Date(tenant.checkInDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleCheckOut(tenant.id, tenant.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
                        title="Check-Out"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Check-Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div 
            className="absolute inset-0"
            onClick={() => setShowCheckInModal(false)}
          ></div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Check-In Penyewa Baru</h3>
              <button 
                onClick={() => setShowCheckInModal(false)}
                className="text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 p-1.5 rounded-lg transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-900/10 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nama Lengkap
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Nama lengkap penyewa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nomor Telepon
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email (Opsional)
                </label>
                <input 
                  type="email"
                  placeholder="penyewa@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Pilih Kamar Kosong
                </label>
                <select
                  required
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Pilih Kamar --</option>
                  {vacantRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Kamar {room.roomNumber} - Lantai {room.floor} (Rp {room.price.toLocaleString('id-ID')}/bln)
                    </option>
                  ))}
                </select>
                {vacantRooms.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    Semua kamar terisi. Silakan tambahkan kamar baru terlebih dahulu.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tanggal Mulai Masuk
                </label>
                <input 
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading || vacantRooms.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Check-In Penyewa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
