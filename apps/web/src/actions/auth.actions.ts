'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18003';

export async function loginAction(employeeId: string, password: string) {
    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ employeeId, password }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            return { success: false, error: errorData.message || 'Authentication failed' };
        }

        // The Nest.js server sends back a Set-Cookie header with the `auth_token`.
        // Next.js fetch API can read this from `res.headers.getSetCookie()` or `res.headers.get('set-cookie')`
        const setCookieHeaders = res.headers.getSetCookie();

        if (setCookieHeaders && setCookieHeaders.length > 0) {
            const cookieStore = await cookies();

            // We parse the auth_token cookie
            const authCookie = setCookieHeaders.find(c => c.startsWith('auth_token='));
            if (authCookie) {
                // Extract value before the first semicolon
                const tokenValue = authCookie.split(';')[0].split('=')[1];

                // Pass it along to Next.js cookie store so the browser gets it
                cookieStore.set('auth_token', tokenValue, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    path: '/',
                    maxAge: 15 * 60, // 15 minutes match
                });
            }
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Internal Server Error';
        return { success: false, error: errorMsg };
    }
}
