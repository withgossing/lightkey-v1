'use client';

import React, { useState, useEffect } from 'react';
import { getServiceProviders, createServiceProvider, deleteServiceProvider } from '@/actions/admin.actions';

export default function AdminAppsPage() {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [allowedIps, setAllowedIps] = useState('');

    // Result State
    const [createdSecret, setCreatedSecret] = useState<{ clientId: string; secret: string } | null>(null);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        setLoading(true);
        try {
            const data = await getServiceProviders();
            setApps(data);
        } catch (error) {
            console.error(error);
            alert('연동 앱 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await createServiceProvider({
                name,
                description,
                allowedIps: allowedIps.split(',').map(ip => ip.trim()).filter(Boolean),
            });
            setCreatedSecret({
                clientId: result.sp.clientId,
                secret: result.rawSecret,
            });
            await fetchApps();
            // Reset form but don't close modal so they can copy the secret
            setName('');
            setDescription('');
            setAllowedIps('');
        } catch (error: any) {
            alert('연동 앱 생성에 실패했습니다: ' + (error?.message || error));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말로 이 앱을 삭제하시겠습니까? 돌이킬 수 없습니다.')) return;
        try {
            await deleteServiceProvider(id);
            await fetchApps();
        } catch {
            alert('삭제에 실패했습니다.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">OAuth 연동 앱(SP) 관리</h1>
                <button
                    onClick={() => { setIsCreateModalOpen(true); setCreatedSecret(null); }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    + 신규 연동 앱 등록
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">애플리케이션 명칭</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">허용된 IP</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">데이터를 불러오는 중...</td></tr>
                        ) : apps.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">등록된 애플리케이션이 없습니다.</td></tr>
                        ) : apps.map((app) => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{app.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded select-all">{app.clientId}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500">{app.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="empty:before:content-['-'] max-w-xs overflow-hidden text-ellipsis">
                                        {app.allowedIps?.map((ip: string) => (
                                            <span key={ip} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded mr-1 mb-1">{ip}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleDelete(app.id)} className="text-red-600 hover:text-red-900 ml-4">삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsCreateModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">

                            {createdSecret ? (
                                <div className="p-6">
                                    <h3 className="text-lg leading-6 font-medium text-green-900 mb-4 bg-green-50 p-2 rounded">🎉 앱이 성공적으로 등록되었습니다!</h3>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-2">아래의 Client ID와 Secret을 저장하세요. <b>Secret은 보안을 위해 지금 단 한 번만 표시되며 다시 볼 수 없습니다.</b></p>
                                        <div className="bg-gray-100 p-4 rounded mt-4">
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Client ID</label>
                                            <code className="block bg-white p-2 border border-gray-300 rounded mb-4 select-all">{createdSecret.clientId}</code>

                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Client Secret</label>
                                            <code className="block bg-white p-2 border border-gray-300 rounded text-red-600 select-all">{createdSecret.secret}</code>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6">
                                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-900 text-base font-medium text-white hover:bg-slate-800 focus:outline-none sm:text-sm">
                                            확인 (닫기)
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleCreate}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">신규 연동 앱(SP) 발급</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">애플리케이션 명칭</label>
                                                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 구글 워크스페이스 연동" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
                                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="앱에 대한 간단한 설명" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">접속 허용 IP (CIDR 가능)</label>
                                                <input type="text" value={allowedIps} onChange={e => setAllowedIps(e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="192.168.1.0/24, 127.0.0.1 (쉼표 구분)" />
                                                <p className="mt-1 text-xs text-gray-500">비워둘 경우 모든 IP에서 접근이 허용됩니다.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-900 text-base font-medium text-white hover:bg-slate-800 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                                            발급하기
                                        </button>
                                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            취소
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
