'use client';

import React, { useState, useEffect } from 'react';
import { getUsers, unlockUser } from '@/actions/users.actions';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
            alert('사용자 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async (id: string, employeeId: string) => {
        if (!confirm(`사번 ${employeeId} 계정의 잠금을 해제하시겠습니까?`)) return;
        try {
            await unlockUser(id);
            alert('성공적으로 잠금이 해제되었습니다.');
            await fetchUsers();
        } catch (error) {
            alert('잠금 해제에 실패했습니다.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">사용자 계정 관리</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사번</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">소속 권한 (Roles)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계정 상태</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최근 접속일</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">제어</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">데이터를 불러오는 중...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">등록된 사용자가 없습니다.</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.employeeId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-1">
                                        {user.roles?.map((role: string) => (
                                            <span key={role} className={`text-xs px-2 py-1 rounded-full ${role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {role.replace('ROLE_', '')}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.isLocked ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            잠김 (실패 {user.failedLoginAttempts}회)
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            활성
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '미접속'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {user.isLocked && (
                                        <button onClick={() => handleUnlock(user.id, user.employeeId)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded">
                                            잠금 해제
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
