import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLandlordFromRequest } from '@/lib/auth';

// Helper to check if room belongs to the landlord
async function verifyRoomOwner(roomId, landlordId) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      property: true,
    },
  });

  if (!room || room.property.landlordId !== landlordId) {
    return null;
  }
  return room;
}

// PUT (update) a room
export async function PUT(request, { params }) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const { id } = await params;
    const room = await verifyRoomOwner(id, session.id);
    if (!room) {
      return NextResponse.json({ error: 'Kamar tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    const { roomNumber, floor, price, status } = await request.json();

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        roomNumber: roomNumber !== undefined ? String(roomNumber) : undefined,
        floor: floor !== undefined ? parseInt(floor) : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    return NextResponse.json({ room: updatedRoom }, { status: 200 });
  } catch (error) {
    console.error('Error at PUT room API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// DELETE a room
export async function DELETE(request, { params }) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const { id } = await params;
    const room = await verifyRoomOwner(id, session.id);
    if (!room) {
      return NextResponse.json({ error: 'Kamar tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Kamar berhasil dihapus.' }, { status: 200 });
  } catch (error) {
    console.error('Error at DELETE room API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
