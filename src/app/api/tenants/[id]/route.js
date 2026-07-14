import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLandlordFromRequest } from '@/lib/auth';

// Helper to verify tenant belongs to the landlord
async function verifyTenantOwner(tenantId, landlordId) {
  if (!tenantId) return null;
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      room: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!tenant || tenant.room.property.landlordId !== landlordId) {
    return null;
  }
  return tenant;
}

// PUT (update) tenant details
export async function PUT(request, { params }) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'ID penyewa tidak valid.' }, { status: 400 });
    }

    const tenant = await verifyTenantOwner(id, session.id);
    if (!tenant) {
      return NextResponse.json({ error: 'Penyewa tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    const { name, phone, email } = await request.json();

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (email !== undefined) dataToUpdate.email = email;

    const updatedTenant = await prisma.tenant.update({
      where: { id: id },
      data: dataToUpdate,
    });

    return NextResponse.json({ tenant: updatedTenant }, { status: 200 });
  } catch (error) {
    console.error('Error at PUT tenant API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// DELETE (Check-out) tenant
export async function DELETE(request, { params }) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'ID penyewa tidak valid.' }, { status: 400 });
    }

    const tenant = await verifyTenantOwner(id, session.id);
    if (!tenant) {
      return NextResponse.json({ error: 'Penyewa tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    const roomId = tenant.roomId;

    // Jalankan transaksi: hapus penyewa dan ubah status kamar menjadi kosong (VACANT)
    await prisma.$transaction(async (tx) => {
      // 1. Hapus penyewa (tagihan ikut terhapus karena Cascade)
      await tx.tenant.delete({
        where: { id: id },
      });

      // 2. Ubah status kamar menjadi kosong (VACANT)
      await tx.room.update({
        where: { id: roomId },
        data: { status: 'VACANT' },
      });
    });

    return NextResponse.json({ message: 'Penyewa berhasil check-out dan kamar dikosongkan.' }, { status: 200 });
  } catch (error) {
    console.error('Error at DELETE tenant API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
