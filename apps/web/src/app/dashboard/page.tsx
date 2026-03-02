import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');

    // Verify auth token existence
    if (!authToken || !authToken.value) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Lightkey SSO Hub</h1>
                <div>
                    <div>
                        <span className="text-sm text-gray-600 mr-4">Authenticated Session Active</span>
                        <a href="/login" className="text-sm font-medium text-red-600 hover:text-red-800">
                            Switch Account
                        </a>
                    </div>
                </div>
            </nav>

            <main className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-4 space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to SSO Portal</h2>
                    <p className="text-gray-600 mb-8">
                        You have successfully authenticated using HttpOnly Secure cookies.
                        Select an application below to continue checking its Service Provider integration.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'HR System', desc: 'Manage payroll and employee data', status: 'Available' },
                            { name: 'Admin Console', desc: 'SSO application management', status: 'Restricted (Admin)' },
                            { name: 'Support Tickets', desc: 'Internal IT support platform', status: 'Available' },
                        ].map((app) => (
                            <div key={app.name} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-xl">
                                    <span className="font-bold">{app.name.charAt(0)}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                                <p className="text-sm text-gray-500 mt-2">{app.desc}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className={`text-xs px-2 py-1 rounded-full ${app.status.includes('Admin') ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                        {app.status}
                                    </span>
                                    <span className="text-blue-600 text-sm font-medium hover:underline">Launch →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
