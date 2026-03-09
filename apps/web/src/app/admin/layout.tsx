import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken || !authToken.value) {
        redirect('/login');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18002';
    const fetchOptions = {
        headers: { Cookie: `auth_token=${authToken.value}` },
        cache: 'no-store' as RequestCache,
    };

    const res = await fetch(`${apiUrl}/api/users/me`, fetchOptions);
    if (!res.ok) {
        redirect('/login');
    }

    const user = await res.json();

    // Check if user is admin
    if (!user.roles || !user.roles.includes('ROLE_ADMIN')) {
        // Redirect to standard dashboard if not an admin
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold tracking-tight">Lightkey Admin</h2>
                    <p className="text-slate-400 text-sm mt-1">통합 관리자 콘솔</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link href="/admin" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                        대시보드 홈
                    </Link>
                    <Link href="/admin/users" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                        사용자 계정 관리
                    </Link>
                    <Link href="/admin/apps" className="block px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                        OAuth 연동 앱 관리
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800 mb-4 mx-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold mr-3">
                            A
                        </div>
                        <div>
                            <p className="text-sm font-medium">{user.employeeId}</p>
                            <span className="text-xs text-blue-400">System Admin</span>
                        </div>
                    </div>
                </div>
                <div className="px-8 pb-8">
                    <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
                        ← 일반 대시보드로 복귀
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
                <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-8 w-full justify-between">
                    <h1 className="text-lg font-medium text-gray-800">관리자 페이지</h1>
                    <div className="text-sm text-gray-500">Security Control Level: Maximum</div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
