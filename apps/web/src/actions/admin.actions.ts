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

export async function getServiceProviders() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${getApiUrl()}/api/admin/sp`, { headers, cache: 'no-store' });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch SPs: ${res.status} ${text}`);
    }
    return res.json();
}

export async function createServiceProvider(data: { name: string; description: string; allowedIps: string[] }) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${getApiUrl()}/api/admin/sp`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create SP: ${res.status} ${text}`);
    }
    const json = await res.json();
    revalidatePath('/admin/apps');
    return json;
}

export async function updateServiceProvider(id: string, data: { name?: string; description?: string; allowedIps?: string[] }) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${getApiUrl()}/api/admin/sp/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update SP');
    revalidatePath('/admin/apps');
    return res.json();
}

export async function deleteServiceProvider(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${getApiUrl()}/api/admin/sp/${id}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) throw new Error('Failed to delete SP');
    revalidatePath('/admin/apps');
    return res.json();
}
