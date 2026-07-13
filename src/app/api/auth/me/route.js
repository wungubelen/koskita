import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLandlordFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = getLandlordFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Tidak terotentikasi.' },
        { status: 401 }
      );
    }

    // Ambil data landlord terbaru dari database
    const landlord = await prisma.landlord.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        properties: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!landlord) {
      return NextResponse.json(
        { error: 'Landlord tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ landlord }, { status: 200 });
  } catch (error) {
    console.error('Error at auth me API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
