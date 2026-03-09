import React from 'react';

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">시스템 현황 요약</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">총 활성 사용자</h3>
                    <p className="text-3xl font-bold text-gray-900">2명</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">등록된 연동 앱(SP)</h3>
                    <p className="text-3xl font-bold text-blue-600">1개</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">오늘의 발급된 인가 코드</h3>
                    <p className="text-3xl font-bold text-green-600">0건</p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mt-8">
                <h3 className="font-semibold text-blue-900 mb-2">시작하기 전에</h3>
                <p className="text-sm text-blue-800 leading-relaxed mb-4">
                    통합 관리자 콘솔에서는 시스템 전반의 핵심 보안 설정을 제어할 수 있습니다.
                    가장 먼저 <b>OAuth 연동 앱 관리</b> 메뉴로 이동하여 SSO를 지원할 애플리케이션 정보를 추가하거나 수정해보세요.
                </p>
            </div>
        </div>
    );
}
