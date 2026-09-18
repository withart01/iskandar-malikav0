import type { APIRoute } from 'astro';
import { getFirebaseAuth, getFirestore } from '../../../lib/firebase-admin';

export const POST: APIRoute = async ({ request }) => {
  try {
    const auth = getFirebaseAuth();
    const db = getFirestore();
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and name are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Store additional user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      createdAt: new Date().toISOString(),
      role: 'user',
    });

    return new Response(
      JSON.stringify({
        success: true,
        uid: userRecord.uid,
        message: 'User registered successfully',
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Register error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Registration failed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
