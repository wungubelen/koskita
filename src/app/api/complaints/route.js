import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLandlordFromRequest } from '@/lib/auth';

// GET all complaints
export async function GET(request) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const complaints = await prisma.complaint.findMany({
      where: {
        room: {
          property: {
            landlordId: session.id,
          },
        },
      },
      include: {
        room: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ complaints }, { status: 200 });
  } catch (error) {
    console.error('Error at GET complaints API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// POST a new complaint (Simulated from tenant)
export async function POST(request) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const { roomId, description } = await request.json();

    if (!roomId || !description) {
      return NextResponse.json({ error: 'Kamar dan deskripsi keluhan wajib diisi.' }, { status: 400 });
    }

    // Verifikasi kepemilikan kamar
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { property: true },
    });

    if (!room || room.property.landlordId !== session.id) {
      return NextResponse.json({ error: 'Kamar tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    const newComplaint = await prisma.complaint.create({
      data: {
        roomId,
        description,
        status: 'NEW',
      },
    });

    return NextResponse.json({ complaint: newComplaint }, { status: 201 });
  } catch (error) {
    console.error('Error at POST complaints API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
