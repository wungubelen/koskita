'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle, 
  X, 
  Loader2, 
  FileText, 
  Eye, 
  UploadCloud,
  CheckCircle,
  Printer
} from 'lucide-react';

export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [rooms, setRooms] = useState([]); // untuk form tagihan manual
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Modal Verifikasi
  const [activeBill, setActiveBill] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Modal Invoice (Print Preview)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceBill, setInvoiceBill] = useState(null);

  useEffect(() => {
    fetchBills();
    fetchRooms();
  }, []);

  async function fetchBills() {
    try {
      const res = await fetch('/api/billing');
      if (!res.ok) throw new Error('Gagal mengambil data tagihan.');
      const data = await res.json();
      setBills(data.bills || []);
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
      // Hanya ambil kamar yang memiliki penyewa aktif untuk dibuatkan tagihan
      const occupied = (data.rooms || []).filter(r => r.status === 'OCCUPIED');
      setRooms(occupied);
    } catch (err) {
      console.error(err);
    }
  }

  const handleAddBill = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    // Cari penyewa dari kamar terpilih
    const targetRoom = rooms.find(r => r.id === selectedRoomId);
    const tenantId = targetRoom?.tenants?.[0]?.id;

    if (!tenantId) {
      setFormError('Kamar tidak memiliki penyewa aktif.');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoomId,
          tenantId,
          amount: parseFloat(amount),
          dueDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan tagihan.');

      await fetchBills();
      setShowAddModal(false);
      setSelectedRoomId('');
      setAmount('');
      setDueDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSimulatePayment = async (billId) => {
    // Simulasi penyewa mengunggah bukti transfer
    const simulatedProofUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600';
    try {
      const res = await fetch(`/api/billing/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PENDING_VERIFICATION',
          paymentProofUrl: simulatedProofUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal simulasi pembayaran.');
      }

      await fetchBills();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyPayment = async (billId, statusAction) => {
    setVerifyLoading(true);
    try {
      const res = await fetch(`/api/billing/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusAction, // PAID atau UNPAID
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal verifikasi pembayaran.');
      }

      await fetchBills();
      setShowVerifyModal(false);
      setActiveBill(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleDeleteBill = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tagihan ini?')) return;

    try {
      const res = await fetch(`/api/billing/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus tagihan.');
      }

      await fetchBills();
    } catch (err) {
      alert(err.message);
    }
  };

  const openVerifyModal = (bill) => {
    setActiveBill(bill);
    setShowVerifyModal(true);
  };

  const openInvoiceModal = (bill) => {
    setInvoiceBill(bill);
    setShowInvoiceModal(true);
  };

  const handlePrint = () => {
    window.print();
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tagihan & Keuangan</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola tagihan bulanan penyewa, verifikasi bukti transfer, dan cetak kuitansi sewa.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/25"
        >
          <Plus className="h-4.5 w-4.5" />
          Buat Tagihan
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
      ) : bills.length === 0 ? (
        <div className="text-center py-20 border border-slate-900 bg-slate-900/10 rounded-2xl">
          <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300">Belum ada tagihan sewa</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">Buat tagihan sewa bulanan untuk penyewa kos Anda.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            Buat Tagihan Pertama
          </button>
        </div>
      ) : (
        /* Bills Table */
        <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-950 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase">
                  <th className="p-4">Kamar / Penyewa</th>
                  <th className="p-4">Jumlah Tagihan</th>
                  <th className="p-4">Jatuh Tempo</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Simulasi Penyewa</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {bills.map((bill) => {
                  const isPaid = bill.status === 'PAID';
                  const isPending = bill.status === 'PENDING_VERIFICATION';
                  const isUnpaid = bill.status === 'UNPAID';

                  return (
                    <tr key={bill.id} className="hover:bg-slate-900/20 transition">
                      <td className="p-4">
                        <div className="font-semibold text-white">Kamar {bill.room?.roomNumber}</div>
                        <div className="text-xs text-slate-400">{bill.tenant?.name}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-200">{formatRupiah(bill.amount)}</td>
                      <td className="p-4 text-slate-300">
                        {new Date(bill.dueDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        {isPaid && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Lunas
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Perlu Verifikasi
                          </span>
                        )}
                        {isUnpaid && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Belum Bayar
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {isUnpaid ? (
                          <button
                            onClick={() => handleSimulatePayment(bill.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/35 rounded-xl text-xs transition"
                          >
                            <UploadCloud className="h-3.5 w-3.5" />
                            Simulasi Kirim Bukti
                          </button>
                        ) : isPending ? (
                          <span className="text-xs text-slate-500">Bukti sudah dikirim</span>
                        ) : (
                          <span className="text-xs text-slate-500">Selesai</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {isPending && (
                          <button
                            onClick={() => openVerifyModal(bill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Verifikasi
                          </button>
                        )}
                        {isPaid && (
                          <button
                            onClick={() => openInvoiceModal(bill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white transition border border-slate-700"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Kuitansi
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBill(bill.id)}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Buat Tagihan Baru</h3>
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

            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Pilih Kamar Terisi (Penyewa)
                </label>
                <select
                  required
                  value={selectedRoomId}
                  onChange={(e) => {
                    setSelectedRoomId(e.target.value);
                    const r = rooms.find(room => room.id === e.target.value);
                    if (r) setAmount(r.price.toString());
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Pilih Kamar --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Kamar {room.roomNumber} - {room.tenants?.[0]?.name || 'Tanpa Nama'} (Rp {room.price.toLocaleString('id-ID')}/bln)
                    </option>
                  ))}
                </select>
                {rooms.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    Tidak ada kamar terisi yang memerlukan tagihan.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Jumlah Tagihan (Rp)
                </label>
                <input 
                  type="number"
                  required
                  placeholder="Masukkan jumlah nominal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tanggal Jatuh Tempo
                </label>
                <input 
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                  disabled={formLoading || rooms.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Payment Modal */}
      {showVerifyModal && activeBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => { setShowVerifyModal(false); setActiveBill(null); }}></div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Verifikasi Bukti Pembayaran</h3>
              <button 
                onClick={() => { setShowVerifyModal(false); setActiveBill(null); }}
                className="text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 p-1.5 rounded-lg transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1 text-sm">
                <div>Kamar: <span className="font-bold text-white">Kamar {activeBill.room?.roomNumber}</span></div>
                <div>Penyewa: <span className="font-semibold text-slate-200">{activeBill.tenant?.name}</span></div>
                <div>Jumlah: <span className="font-bold text-indigo-400">{formatRupiah(activeBill.amount)}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Bukti Pembayaran (Mockup)
                </label>
                <div className="border border-slate-800 rounded-xl overflow-hidden aspect-video bg-slate-950 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={activeBill.paymentProofUrl} 
                    alt="Bukti Transfer Mockup" 
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between gap-3">
                <button
                  type="button"
                  disabled={verifyLoading}
                  onClick={() => handleVerifyPayment(activeBill.id, 'UNPAID')}
                  className="px-4 py-2 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-xl text-sm font-semibold transition"
                >
                  Tolak Bukti
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowVerifyModal(false); setActiveBill(null); }}
                    className="px-4 py-2 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={verifyLoading}
                    onClick={() => handleVerifyPayment(activeBill.id, 'PAID')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
                  >
                    {verifyLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Setujui Pembayaran
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal (Print Layout) */}
      {showInvoiceModal && invoiceBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm print:relative print:bg-white print:p-0">
          <div className="absolute inset-0 print:hidden" onClick={() => { setShowInvoiceModal(false); setInvoiceBill(null); }}></div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-xl relative z-10 shadow-2xl print:bg-white print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none">
            
            {/* Modal actions (hide on print) */}
            <div className="flex justify-between items-center mb-8 print:hidden">
              <h3 className="text-lg font-bold text-white">Pratinjau Kuitansi Sewa</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/20"
                >
                  <Printer className="h-4 w-4" />
                  Cetak / Simpan PDF
                </button>
                <button 
                  onClick={() => { setShowInvoiceModal(false); setInvoiceBill(null); }}
                  className="text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 p-1.5 rounded-lg transition"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Print Document Content */}
            <div className="p-6 bg-white text-slate-900 rounded-2xl border border-slate-100 print:p-0 print:border-none">
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-indigo-600">KOSKITA</h2>
                  <p className="text-xs text-slate-500 mt-1">Sistem Pengelolaan Kos Digital</p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase rounded-full tracking-wider">
                    LUNAS
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Kuitansi Pembayaran</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Diberikan Kepada:</span>
                  <span className="font-bold text-sm block">{invoiceBill.tenant?.name}</span>
                  <span className="text-slate-500 block mt-0.5">{invoiceBill.tenant?.phone}</span>
                  <span className="font-medium text-slate-700 block mt-1">Kamar {invoiceBill.room?.roomNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block mb-1">Detail Pembayaran:</span>
                  <div className="space-y-0.5">
                    <div>No. Tagihan: <span className="font-semibold text-slate-700">{invoiceBill.id.substring(0, 8).toUpperCase()}</span></div>
                    <div>Jatuh Tempo: <span className="font-semibold text-slate-700">{new Date(invoiceBill.dueDate).toLocaleDateString('id-ID')}</span></div>
                    {invoiceBill.paymentDate && (
                      <div>Dibayar Tanggal: <span className="font-semibold text-slate-700">{new Date(invoiceBill.paymentDate).toLocaleDateString('id-ID')}</span></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bill Details */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs my-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="p-3">Deskripsi Pembayaran</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 text-slate-700">
                        Pembayaran Sewa Bulanan - Kamar {invoiceBill.room?.roomNumber}
                        <span className="text-[10px] text-slate-400 block mt-0.5">Masa sewa bulanan</span>
                      </td>
                      <td className="p-3 text-right text-slate-900 font-semibold">{formatRupiah(invoiceBill.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <div className="w-1/2 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(invoiceBill.amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Pajak / Biaya Layanan:</span>
                    <span>Rp 0</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-slate-900">
                    <span>Total Pembayaran:</span>
                    <span>{formatRupiah(invoiceBill.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-6">
                Terima kasih atas pembayaran Anda. Kuitansi ini dihasilkan secara otomatis dan sah secara digital.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
