import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLandlordFromRequest } from '@/lib/auth';

// Helper to verify complaint belongs to the landlord
async function verifyComplaintOwner(complaintId, landlordId) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: {
      room: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!complaint || complaint.room.property.landlordId !== landlordId) {
    return null;
  }
  return complaint;
}

// PUT (update) complaint status
export async function PUT(request, { params }) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const { id } = await params;
    const complaint = await verifyComplaintOwner(id, session.id);
    if (!complaint) {
      return NextResponse.json({ error: 'Aduan tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    const { status, description } = await request.json();

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    return NextResponse.json({ complaint: updatedComplaint }, { status: 200 });
  } catch (error) {
    console.error('Error at PUT complaint API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// DELETE a complaint
export async function DELETE(request, { params }) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const { id } = await params;
    const complaint = await verifyComplaintOwner(id, session.id);
    if (!complaint) {
      return NextResponse.json({ error: 'Aduan tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    await prisma.complaint.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Aduan berhasil dihapus.' }, { status: 200 });
  } catch (error) {
    console.error('Error at DELETE complaint API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}