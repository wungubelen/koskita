import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, name, phone } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, dan nama wajib diisi.' },
        { status: 400 }
      );
    }

    // Periksa apakah email sudah terdaftar
    const existingLandlord = await prisma.landlord.findUnique({
      where: { email },
    });

    if (existingLandlord) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar.' },
        { status: 400 }
      );
    }

    // Hash password dan simpan landlord baru
    const hashedPassword = hashPassword(password);
    const newLandlord = await prisma.landlord.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
      },
    });

    // Buat Properti Kos bawaan (default) agar langsung siap dipakai
    await prisma.property.create({
      data: {
        name: 'Kos Saya',
        address: 'Alamat belum diisi',
        landlordId: newLandlord.id,
      },
    });

    return NextResponse.json(
      { message: 'Pendaftaran berhasil.', landlordId: newLandlord.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error at register API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
