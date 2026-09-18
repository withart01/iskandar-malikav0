import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Clear session cookie
    cookies.delete('session', { path: '/' });

    return new Response(
      JSON.stringify({ success: true, message: 'Logged out successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Logout error:', error.message);
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
