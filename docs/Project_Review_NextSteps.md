# 프로젝트 현황 리뷰 및 향후 계획

현재 Lightkey SSO 시스템의 "인증 코어(Authentication Core)" 개발이 성공적으로 완료되었으며, 프론트엔드 연동의 기초가 마련되었습니다. 

## 1. 지금까지 완료된 작업 현황 (Phase 1 ~ Phase 8)

*   **백엔드 (NestJS) 코어 완성:**
    *   **DB 연동 & ORM (Phase 1):** PostgreSQL, TypeORM 연동 및 `User`, `Role`, `ServiceProvider` (SP) 엔티티 설계.
    *   **데이터 동기화 (Phase 2):** 인사 시스템 데이터 파일(CSV)을 읽어와서 DB 사용자풀을 구축하는 배치(Cron) 로직과 로컬 테스트용 On-load Sync 로직 구현 완료.
    *   **인증 및 세션 처리 (Phase 3 & 4):** 사용자 ID/비밀번호 검증, 5회 오류 시 계정 잠금 정책, 그리고 Redis 기반의 Refresh Token 발급/관리를 통한 상태 유지형(Stateful) 세션 인프라 구축.
    *   **보안 방벽 (Phase 5):** JWT 검증을 수행하는 Passport 전략 및 `JwtAuthGuard` 구현. 토큰은 오직 `HttpOnly`, `Secure` 쿠키를 통해서만 주고받아 프론트엔드 XSS 공격을 원천 차단.
    *   **관리자 전용 기능 (Phase 6):** `@Roles('ROLE_ADMIN')` 어노테이션을 통해 관리자만 접근하여 신규 사용자 프로필을 강제로 생성할 수 있는 엔드포인트 구현 완료.
    *   **접속 IP 통제 (Phase 7):** 인증을 거쳐 연동되는 앱(SP)들의 접속 가능 IP 범위(CIDR 기반)를 검증하고 차단하는 `IpAllowlistGuard` 구현 완료.

*   **프론트엔드 (Next.js) 연동 셋업 (Phase 8):**
    *   미니멀한 디자인의 **SSO Login UI** (`app/(auth)/login/page.tsx`) 구축.
    *   보안 강화를 위해 Next.js 14의 **Server Actions** (`actions/auth.actions.ts`)를 활용, 백엔드의 `Set-Cookie` 헤더를 안전하게 파싱하여 웹 브라우저 쿠키 저장소로 프록싱.
    *   인증 상태를 점검할 수 있는 **Dashboard UI** (`app/dashboard/page.tsx`) 작성.

---

## 2. 향후 진행 단계 (Next Steps) 검토

현재 "자체 로그인 및 토큰 시스템"은 완성되었으나, 목적한 "SSO(Single Sign-On)" 통합 플랫폼으로써 다른 애플리케이션들에게 인증 서비스를 제공하기 위해서는 다음 구성 요소의 구현이 필요합니다.

### Step 1. OAuth 2.0 / OIDC 표준 프로토콜 지원 (필수 SSO 기능)
단순한 사내 로그인 창을 넘어, 다른 서비스(예: 그룹웨어, 사내 메신저)가 Lightkey 시스템을 '인증 제공자(IdP)'로 의존하기 위한 프로토콜 구현입니다.
*   **Authorization Code Grant 흐름 구현:** `clientId`, `redirectUri` 확인 후 인가 코드를 발행.
*   **토큰 엔드포인트 파생:** 발행된 인증 코드를 Access/ID Token으로 교환해주는 로직.
*   연동 앱(SP)을 등록하고 Secret을 재발급받는 Admin UI 메뉴 개발.

### Step 2. 프론트엔드 대시보드 및 어드민 페이지 구현
*   **Next.js Dashboard 고도화:** 현재 더미(Dummy) 상태인 대시보드에 프로필 정보 API(`/api/users/me`) 연동.
*   **Admin Console 작성:** 관리자가 사용자를 수동으로 등록하고 연동 어플리케이션(SP)의 IP Allowlist를 웹 상에서 손쉽게 추가/삭제할 수 있는 관리자 화면 구축.

### Step 3. E2E 테스트 및 배포 연동
*   개발된 Next.js 로그인 페이지와 백엔드 API를 Docker를 이용하여 통합 구동하고 종단 간 보안 및 세션 유지, Redis 만료 로직 등을 철저하게 점검합니다.
*   Docker Compose 프로덕션 레벨 배포 스크립트화 (SSL, Nginx 리버스 프록시 연동).

---

## 3. 의견 요청
다음 목표인 **"1. OAuth 2.0 기반의 SSO 인증 제공자(IdP) 프로토콜 구축"** 작업을 바로 이어서 착수할까요? 혹은 프론트엔드의 **"2. 관리자 인터페이스(User & SP 관리 화면) 구축"**이 먼저 필요하신지 방향성에 대한 리뷰를 부탁드립니다.
