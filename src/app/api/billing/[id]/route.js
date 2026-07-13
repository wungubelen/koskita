import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLandlordFromRequest } from '@/lib/auth';

// Helper to verify bill belongs to the landlord
async function verifyBillOwner(billId, landlordId) {
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      room: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!bill || bill.room.property.landlordId !== landlordId) {
    return null;
  }
  return bill;
}

// PUT (update) bill status/details
export async function PUT(request, { params }) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const { id } = await params;
    const bill = await verifyBillOwner(id, session.id);
    if (!bill) {
      return NextResponse.json({ error: 'Tagihan tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    const { status, paymentProofUrl, amount, dueDate } = await request.json();

    const dataToUpdate = {};
    if (status !== undefined) {
      dataToUpdate.status = status;
      if (status === 'PAID') {
        dataToUpdate.paymentDate = new Date();
      } else if (status === 'UNPAID') {
        dataToUpdate.paymentDate = null;
        dataToUpdate.paymentProofUrl = null;
      }
    }

    if (paymentProofUrl !== undefined) {
      dataToUpdate.paymentProofUrl = paymentProofUrl;
    }
    if (amount !== undefined) {
      dataToUpdate.amount = parseFloat(amount);
    }
    if (dueDate !== undefined) {
      dataToUpdate.dueDate = new Date(dueDate);
    }

    const updatedBill = await prisma.bill.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ bill: updatedBill }, { status: 200 });
  } catch (error) {
    console.error('Error at PUT billing API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// DELETE a bill
export async function DELETE(request, { params }) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const { id } = await params;
    const bill = await verifyBillOwner(id, session.id);
    if (!bill) {
      return NextResponse.json({ error: 'Tagihan tidak ditemukan atau akses ditolak.' }, { status: 403 });
    }

    await prisma.bill.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Tagihan berhasil dihapus.' }, { status: 200 });
  } catch (error) {
    console.error('Error at DELETE billing API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
