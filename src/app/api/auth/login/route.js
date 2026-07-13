import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // Cari landlord berdasarkan email
    const landlord = await prisma.landlord.findUnique({
      where: { email },
    });

    if (!landlord || !comparePassword(password, landlord.password)) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    // Sign JWT Token
    const tokenPayload = {
      id: landlord.id,
      email: landlord.email,
      name: landlord.name,
    };
    const token = signToken(tokenPayload);

    // Kirim token dalam httpOnly cookie
    const response = NextResponse.json(
      {
        message: 'Login berhasil.',
        landlord: { id: landlord.id, email: landlord.email, name: landlord.name },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error at login API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
