import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLandlordFromRequest } from '@/lib/auth';

// GET all bills for landlord properties
export async function GET(request) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const bills = await prisma.bill.findMany({
      where: {
        room: {
          property: {
            landlordId: session.id,
          },
        },
      },
      include: {
        room: true,
        tenant: true,
      },
      orderBy: {
        dueDate: 'desc',
      },
    });

    return NextResponse.json({ bills }, { status: 200 });
  } catch (error) {
    console.error('Error at GET billing API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// POST a new manual bill
export async function POST(request) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const { roomId, tenantId, amount, dueDate } = await request.json();

    if (!roomId || !tenantId || !amount || !dueDate) {
      return NextResponse.json({ error: 'Kamar, penyewa, jumlah, dan tanggal jatuh tempo wajib diisi.' }, { status: 400 });
    }

    // Verifikasi kepemilikan kamar
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { property: true },
    });

    if (!room || room.property.landlordId !== session.id) {
      return NextResponse.json({ error: 'Kamar tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    const newBill = await prisma.bill.create({
      data: {
        roomId,
        tenantId,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        status: 'UNPAID',
      },
    });

    return NextResponse.json({ bill: newBill }, { status: 201 });
  } catch (error) {
    console.error('Error at POST billing API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
