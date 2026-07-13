import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLandlordFromRequest } from '@/lib/auth';

// GET all tenants for the landlord
export async function GET(request) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const tenants = await prisma.tenant.findMany({
      where: {
        room: {
          property: {
            landlordId: session.id,
          },
        },
      },
      include: {
        room: {
          include: {
            property: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ tenants }, { status: 200 });
  } catch (error) {
    console.error('Error at GET tenants API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// POST a new tenant (Check-in)
export async function POST(request) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const { name, phone, email, roomId, checkInDate } = await request.json();

    if (!name || !phone || !roomId) {
      return NextResponse.json({ error: 'Nama, telepon, dan kamar wajib diisi.' }, { status: 400 });
    }

    // Verifikasi kepemilikan kamar
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { property: true },
    });

    if (!room || room.property.landlordId !== session.id) {
      return NextResponse.json({ error: 'Kamar tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    if (room.status === 'OCCUPIED') {
      return NextResponse.json({ error: 'Kamar sudah terisi oleh penyewa lain.' }, { status: 400 });
    }

    const checkInDateTime = checkInDate ? new Date(checkInDate) : new Date();

    // Jalankan transaksi: buat penyewa, update status kamar, dan buat tagihan pertama
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat Penyewa
      const newTenant = await tx.tenant.create({
        data: {
          name,
          phone,
          email,
          checkInDate: checkInDateTime,
          roomId,
        },
      });

      // 2. Ubah status kamar menjadi terisi (OCCUPIED)
      await tx.room.update({
        where: { id: roomId },
        data: { status: 'OCCUPIED' },
      });

      // 3. Buat Tagihan Pertama (otomatis jatuh tempo 3 hari dari tanggal masuk)
      const dueDate = new Date(checkInDateTime);
      dueDate.setDate(dueDate.getDate() + 3);

      const initialBill = await tx.bill.create({
        data: {
          roomId,
          tenantId: newTenant.id,
          amount: room.price,
          dueDate,
          status: 'UNPAID',
        },
      });

      return { tenant: newTenant, bill: initialBill };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error at POST tenants API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
