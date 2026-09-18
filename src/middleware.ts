import { defineMiddleware } from 'astro:middleware';
import { getFirebaseAuth } from './lib/firebase-admin';

const publicPaths = new Set(['/','/home','/login','/register']);
const publicPrefixes = ['/api/auth/'];

function isPublicPath(pathname: string) {
  return publicPaths.has(pathname) || publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/') ||
    pathname === '/profile' || pathname.startsWith('/profile/') ||
    pathname === '/cart' || pathname.startsWith('/cart/') ||
    pathname === '/checkout' || pathname.startsWith('/checkout/');
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  if (isPublicPath(pathname) || !isProtectedPath(pathname)) {
    return next();
  }

  const sessionCookie = context.cookies.get('session')?.value;

  if (!sessionCookie) {
    return context.redirect(`/login?redirect=${encodeURIComponent(pathname)}`, 302);
  }

  try {
    const decodedToken = await getFirebaseAuth().verifySessionCookie(sessionCookie, true);
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
    const isAdmin = decodedToken.role === 'admin' || decodedToken.admin === true;

    if (isAdminRoute && !isAdmin) {
      return context.redirect('/home?error=forbidden', 302);
    }

    context.locals.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: isAdmin ? 'admin' : 'user',
    };

    return next();
  } catch {
    context.cookies.delete('session', { path: '/' });
    return context.redirect(`/login?redirect=${encodeURIComponent(pathname)}`, 302);
  }
});

declare global {
  namespace App {
    interface Locals {
      user?: {
        uid: string;
        email?: string;
        role: 'admin' | 'user';
      };
    }
  }
}
