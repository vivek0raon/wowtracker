import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET_KEY || 'super-secret-key-change-me-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  const isProtectedRoute = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/quiz');

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(token, encodedKey, { algorithms: ['HS256'] });
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
