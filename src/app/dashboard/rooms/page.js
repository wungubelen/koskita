'use client';

import { useState, useEffect } from 'react';
import { DoorOpen, Plus, Trash2, Edit, AlertCircle, X, Check, Loader2 } from 'lucide-react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('1');
  const [price, setPrice] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit states
  const [editingRoom, setEditingRoom] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error('Gagal mengambil data kamar.');
      const data = await res.json();
      setRooms(data.rooms || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber,
          floor: parseInt(floor),
          price: parseFloat(price),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan kamar.');

      // Refresh list, close modal, reset form
      await fetchRooms();
      setShowAddModal(false);
      setRoomNumber('');
      setFloor('1');
      setPrice('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kamar ini? Penyewa yang tinggal di kamar ini juga akan terhapus.')) return;

    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus kamar.');
      }
      // Refresh list
      await fetchRooms();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartEdit = (room) => {
    setEditingRoom(room);
    setEditPrice(room.price);
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(editPrice) }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan perubahan.');
      }

      setEditingRoom(null);
      await fetchRooms();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daftar Kamar Kos</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola data kamar, harga sewa bulanan, dan status hunian.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/25"
        >
          <Plus className="h-4.5 w-4.5" />
          Kamar Baru
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
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 border border-slate-900 bg-slate-900/10 rounded-2xl">
          <DoorOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300">Belum ada kamar kos</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">Mulai tambahkan kamar pertama Anda untuk mengelola sewa.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            Tambah Kamar
          </button>
        </div>
      ) : (
        /* Room Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => {
            const isOccupied = room.status === 'OCCUPIED';
            const isEditing = editingRoom?.id === room.id;
            return (
              <div 
                key={room.id}
                className={`p-6 rounded-2xl border bg-slate-900/30 flex flex-col justify-between transition-all duration-300 ${
                  isOccupied 
                    ? 'border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-950/5' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Status Banner */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-xs font-semibold">Lantai {room.floor}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      isOccupied 
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {isOccupied ? 'Terisi' : 'Kosong'}
                    </span>
                  </div>

                  {/* Room Number */}
                  <h3 className="text-xl font-bold text-white mb-2">Kamar {room.roomNumber}</h3>

                  {/* Price info / Input */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-2 mb-4">
                      <span className="text-sm text-slate-400">Rp</span>
                      <input 
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1 text-sm w-32 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <p className="text-slate-300 font-medium text-sm mb-4">
                      {formatRupiah(room.price)} <span className="text-slate-500 font-normal">/bulan</span>
                    </p>
                  )}

                  {/* Tenant short summary if occupied */}
                  {isOccupied && room.tenants?.[0] && (
                    <div className="mt-4 pt-3 border-t border-slate-900 text-xs">
                      <span className="text-slate-500">Penyewa aktif:</span>
                      <p className="text-slate-300 font-semibold mt-0.5">{room.tenants[0].name}</p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-end gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(room.id)}
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition"
                        title="Simpan"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingRoom(null)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
                        title="Batal"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(room)}
                        className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Edit Kamar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition"
                        title="Hapus Kamar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div 
            className="absolute inset-0"
            onClick={() => setShowAddModal(false)}
          ></div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Tambah Kamar Baru</h3>
              <button 
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nomor Kamar
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: 101, 2A, A8"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Lantai
                </label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="1">Lantai 1</option>
                  <option value="2">Lantai 2</option>
                  <option value="3">Lantai 3</option>
                  <option value="4">Lantai 4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Harga Sewa Bulanan (Rp)
                </label>
                <input 
                  type="number"
                  required
                  placeholder="Contoh: 1500000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Kamar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
