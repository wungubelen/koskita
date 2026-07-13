'use client';

import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle, 
  X, 
  Loader2, 
  MessageSquare,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [rooms, setRooms] = useState([]); // untuk form simulasi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchComplaints();
    fetchRooms();
  }, []);

  async function fetchComplaints() {
    try {
      const res = await fetch('/api/complaints');
      if (!res.ok) throw new Error('Gagal mengambil data aduan.');
      const data = await res.json();
      setComplaints(data.complaints || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function fetchRooms() {
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error('Gagal mengambil data kamar.');
      const data = await res.json();
      // Boleh aduan dari kamar mana saja, tapi disarankan yang ada penyewanya (OCCUPIED)
      const occupied = (data.rooms || []).filter(r => r.status === 'OCCUPIED');
      setRooms(occupied);
    } catch (err) {
      console.error(err);
    }
  }

  const handleAddComplaint = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoomId,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal mengirim aduan.');

      await fetchComplaints();
      setShowSimulateModal(false);
      setSelectedRoomId('');
      setDescription('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal merubah status.');
      }

      await fetchComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aduan ini?')) return;

    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus aduan.');
      }

      await fetchComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  // Hitung stats untuk keluhan
  const totalCount = complaints.length;
  const newCount = complaints.filter(c => c.status === 'NEW').length;
  const progressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Keluhan & Laporan Fasilitas</h1>
          <p className="text-slate-400 text-sm mt-1">Simulasikan laporan kerusakan dari penyewa kos dan perbarui status perbaikan.</p>
        </div>
        <button
          onClick={() => setShowSimulateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/25"
        >
          <Plus className="h-4.5 w-4.5" />
          Simulasi Laporan
        </button>
      </div>

      {error && (
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-900/10 text-red-400 flex items-center gap-3">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      )}

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border border-slate-900 bg-slate-900/20 rounded-2xl text-center">
          <span className="text-xs text-slate-500 font-semibold block">Total Aduan</span>
          <span className="text-xl font-bold mt-1 block">{totalCount}</span>
        </div>
        <div className="p-4 border border-slate-900 bg-rose-500/5 rounded-2xl text-center">
          <span className="text-xs text-rose-500/80 font-semibold block">Laporan Baru</span>
          <span className="text-xl font-bold text-rose-400 mt-1 block">{newCount}</span>
        </div>
        <div className="p-4 border border-slate-900 bg-amber-500/5 rounded-2xl text-center">
          <span className="text-xs text-amber-500/80 font-semibold block">Sedang Diperbaiki</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">{progressCount}</span>
        </div>
        <div className="p-4 border border-slate-900 bg-emerald-500/5 rounded-2xl text-center">
          <span className="text-xs text-emerald-500/80 font-semibold block">Selesai / Resolved</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">{resolvedCount}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 border border-slate-900 bg-slate-900/10 rounded-2xl">
          <Wrench className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300">Belum ada aduan masuk</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">Penyewa kos belum mengirim keluhan apapun tentang fasilitas.</p>
          <button
            onClick={() => setShowSimulateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            Simulasi Keluhan Baru
          </button>
        </div>
      ) : (
        /* Complaints List Card */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.map((comp) => {
            const isNew = comp.status === 'NEW';
            const isProgress = comp.status === 'IN_PROGRESS';
            const isResolved = comp.status === 'RESOLVED';

            return (
              <div 
                key={comp.id}
                className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30 flex flex-col justify-between hover:border-slate-800 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Kamar {comp.room?.roomNumber}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      isNew ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      isProgress ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {isNew ? 'Baru' : isProgress ? 'Diproses' : 'Selesai'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mt-2">
                    <MessageSquare className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{comp.description}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    {new Date(comp.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    {isNew && (
                      <button
                        onClick={() => handleUpdateStatus(comp.id, 'IN_PROGRESS')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition font-semibold"
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                        Perbaiki
                      </button>
                    )}
                    {isProgress && (
                      <button
                        onClick={() => handleUpdateStatus(comp.id, 'RESOLVED')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition font-semibold"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selesai
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteComplaint(comp.id)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition"
                      title="Hapus Aduan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowSimulateModal(false)}></div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Simulasi Aduan Penyewa</h3>
              <button 
                onClick={() => setShowSimulateModal(false)}
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

            <form onSubmit={handleAddComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Pilih Kamar Penyewa
                </label>
                <select
                  required
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Pilih Kamar --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Kamar {room.roomNumber} - {room.tenants?.[0]?.name || 'Penyewa'}
                    </option>
                  ))}
                </select>
                {rooms.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    Tidak ada kamar terisi. Silakan isi kamar dengan penyewa terlebih dahulu untuk simulasi.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Deskripsi Keluhan / Kerusakan
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Contoh: AC kamar 101 mati total tidak bisa dinyalakan. Atau keran kamar mandi bocor terus menerus."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading || rooms.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
