import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data } = body;

    if (!data || typeof data !== 'string') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Save the base64 string to the Image table
    const image = await prisma.image.create({
      data: {
        data: data
      }
    });

    // Return the URL that will serve this image
    return NextResponse.json({ url: `/api/image/${image.id}` });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
