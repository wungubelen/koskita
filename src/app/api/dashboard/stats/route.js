import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getLandlordFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = getLandlordFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Tidak terotentikasi.' }, { status: 401 });
    }

    const landlordId = session.id;

    // 1. Hitung total kamar
    const totalRooms = await prisma.room.count({
      where: {
        property: { landlordId },
      },
    });

    // 2. Hitung kamar terisi
    const occupiedRooms = await prisma.room.count({
      where: {
        property: { landlordId },
        status: 'OCCUPIED',
      },
    });

    // 3. Ringkasan tagihan belum dibayar (UNPAID)
    const unpaidSummary = await prisma.bill.aggregate({
      where: {
        room: { property: { landlordId } },
        status: 'UNPAID',
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // 4. Ringkasan tagihan menunggu verifikasi (PENDING_VERIFICATION)
    const pendingSummary = await prisma.bill.aggregate({
      where: {
        room: { property: { landlordId } },
        status: 'PENDING_VERIFICATION',
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // 5. Hitung keluhan aktif (NEW & IN_PROGRESS)
    const activeComplaints = await prisma.complaint.count({
      where: {
        room: { property: { landlordId } },
        status: { in: ['NEW', 'IN_PROGRESS'] },
      },
    });

    // 6. Ambil 5 tagihan terbaru
    const recentBills = await prisma.bill.findMany({
      where: {
        room: { property: { landlordId } },
      },
      include: {
        tenant: { select: { name: true } },
        room: { select: { roomNumber: true } },
      },
      orderBy: {
        dueDate: 'desc',
      },
      take: 5,
    });

    // 7. Ambil 5 keluhan aktif terbaru
    const recentComplaints = await prisma.complaint.findMany({
      where: {
        room: { property: { landlordId } },
        status: { in: ['NEW', 'IN_PROGRESS'] },
      },
      include: {
        room: { select: { roomNumber: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        totalRooms,
        occupiedRooms,
        vacantRooms: totalRooms - occupiedRooms,
        unpaidCount: unpaidSummary._count || 0,
        unpaidAmount: unpaidSummary._sum.amount || 0,
        pendingCount: pendingSummary._count || 0,
        pendingAmount: pendingSummary._sum.amount || 0,
        activeComplaints,
      },
      recentBills,
      recentComplaints,
    }, { status: 200 });
  } catch (error) {
    console.error('Error at GET dashboard stats:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
