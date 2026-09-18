import type { APIRoute } from 'astro';
import { getFirebaseAuth } from '../../../lib/firebase-admin';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = getFirebaseAuth();
    const { idToken } = await request.json();

    if (!idToken) {
      return new Response(JSON.stringify({ error: 'ID token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify ID token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Create session cookie (valid for 5 days)
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: 5 * 24 * 60 * 60 * 1000,
    });

    // Set secure session cookie
    cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 24 * 60 * 60,
      path: '/',
    });

    return new Response(
      JSON.stringify({
        success: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Session error:', error.message);
    return new Response(JSON.stringify({ error: 'Session creation failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
