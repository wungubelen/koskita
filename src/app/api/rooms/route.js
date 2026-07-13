import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLandlordFromRequest } from '@/lib/auth';

// GET all rooms for the authenticated landlord
export async function GET(request) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const rooms = await prisma.room.findMany({
      where: {
        property: {
          landlordId: session.id,
        },
      },
      include: {
        property: true,
        tenants: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Ambil penyewa aktif saat ini
        },
      },
      orderBy: [
        { floor: 'asc' },
        { roomNumber: 'asc' },
      ],
    });

    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error) {
    console.error('Error at GET rooms API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// POST a new room
export async function POST(request) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const { roomNumber, floor, price, propertyId } = await request.json();

    if (!roomNumber || !floor || !price) {
      return NextResponse.json({ error: 'Nomor kamar, lantai, dan harga wajib diisi.' }, { status: 400 });
    }

    // Jika propertyId tidak diberikan, cari property pertama milik landlord
    let targetPropertyId = propertyId;
    if (!targetPropertyId) {
      const defaultProperty = await prisma.property.findFirst({
        where: { landlordId: session.id },
      });
      if (!defaultProperty) {
        return NextResponse.json({ error: 'Properti tidak ditemukan. Buat properti terlebih dahulu.' }, { status: 400 });
      }
      targetPropertyId = defaultProperty.id;
    } else {
      // Verifikasi bahwa properti tersebut milik landlord
      const property = await prisma.property.findFirst({
        where: { id: targetPropertyId, landlordId: session.id },
      });
      if (!property) {
        return NextResponse.json({ error: 'Akses properti ditolak.' }, { status: 403 });
      }
    }

    const newRoom = await prisma.room.create({
      data: {
        roomNumber: String(roomNumber),
        floor: parseInt(floor),
        price: parseFloat(price),
        propertyId: targetPropertyId,
        status: 'VACANT',
      },
    });

    return NextResponse.json({ room: newRoom }, { status: 201 });
  } catch (error) {
    console.error('Error at POST rooms API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
