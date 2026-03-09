'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18002';

const getAuthHeaders = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    return {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${token}`,
    };
};

export async function getUsers() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${getApiUrl()}/api/admin/users`, { headers, cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
}

export async function unlockUser(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${getApiUrl()}/api/admin/users/${id}/unlock`, {
        method: 'POST',
        headers,
    });
    if (!res.ok) throw new Error('Failed to unlock user');
    revalidatePath('/admin/users');
    return res.json();
}
