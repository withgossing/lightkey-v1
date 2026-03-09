import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface UserProfile {
    id: string;
    employeeId: string;
    email: string;
    roles: string[];
}

interface ServiceProvider {
    id: string;
    clientId: string;
    name: string;
    description: string;
    canAccess: boolean;
    reason: string | null;
}

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');

    // Verify auth token existence
    if (!authToken || !authToken.value) {
        redirect('/login');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18002';

    // Fetch data using the user's cookie
    const fetchOptions = {
        headers: { Cookie: `auth_token=${authToken.value}` },
        cache: 'no-store' as RequestCache,
    };

    const [meRes, spRes] = await Promise.all([
        fetch(`${apiUrl}/api/users/me`, fetchOptions),
        fetch(`${apiUrl}/api/sp`, fetchOptions),
    ]);

    if (!meRes.ok) {
        // Token is invalid or expired via backend verification
        redirect('/login');
    }

    const user: UserProfile = await meRes.json();
    const apps: ServiceProvider[] = spRes.ok ? await spRes.json() : [];

    const getLaunchUrl = (clientId: string) => {
        // Usually redirect_uri is pre-registered, but for our dynamic testing we can pass a dummy callback
        return `${apiUrl}/api/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=http://localhost:3000/callback`;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Lightkey 통합 인증 허브</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        {user.employeeId} 님
                    </span>
                    <a href="/login" className="text-sm font-medium text-red-600 hover:text-red-800">
                        로그아웃 (계정 전환)
                    </a>
                </div>
            </nav>

            <main className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-4 space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">SSO 포털에 오신 것을 환영합니다</h2>
                    <p className="text-gray-600 mb-8">
                        성공적으로 인증되었습니다. 하단의 애플리케이션을 선택하여 해당 서비스로 안전하게 이동하세요.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apps.map((app) => {
                            const CardContent = (
                                <>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-xl ${app.canAccess ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                        <span className="font-bold">{app.name.charAt(0)}</span>
                                    </div>
                                    <h3 className={`text-lg font-semibold ${app.canAccess ? 'text-gray-900' : 'text-gray-500'}`}>{app.name}</h3>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-10">{app.description || '연동 애플리케이션'}</p>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span className={`text-xs px-2 py-1 rounded-full ${app.canAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {app.canAccess ? '접속 가능' : `접근 제한 (${app.reason})`}
                                        </span>
                                        {app.canAccess && (
                                            <span className="text-blue-600 text-sm font-medium hover:underline">
                                                이동하기 →
                                            </span>
                                        )}
                                    </div>
                                </>
                            );

                            if (app.canAccess) {
                                return (
                                    <a key={app.id} href={getLaunchUrl(app.clientId)} className="block border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white cursor-pointer">
                                        {CardContent}
                                    </a>
                                );
                            }

                            return (
                                <div key={app.id} className="block border border-gray-100 bg-gray-50 opacity-75 cursor-not-allowed rounded-xl p-6">
                                    {CardContent}
                                </div>
                            );
                        })}
                        {apps.length === 0 && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                현재 등록된 서비스 제공자(연동 애플리케이션)가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
