# 📄 애플리케이션 기능 명세서 (Feature Specification)

**프로젝트명:** Lightkey SSO System

## 1. 개요
한 번의 인증으로 사내 모든 서비스의 접근을 허용하는 통합 인증 플랫폼의 현재 구현된 핵심 기능들을 명세합니다.

## 2. 통합 인증 및 SSO 기능 (Authentication)
*   **중앙 집중식 로그인 (`/api/auth/login`):** 사번(Employee ID)과 비밀번호를 검증하여 유효한 사용자에게 초기 세션을 발급합니다.
*   **HttpOnly 보안 쿠키 발급:** `auth_token`(JWT, 15분)과 `refresh_token`(7일)을 자바스크립트에서 접근할 수 없는 `HttpOnly` 쿠키로 브라우저에 구워 XSS 방어력을 높입니다.
*   **통합 로그아웃 (`/api/auth/logout`):** 서버에서 즉각적으로 Redis 혹은 인증 시스템의 토큰을 만료 처리하고, 클라이언트의 쿠키를 파기하여 연동 서비스에서의 로그아웃 효과를 창출할 기반을 마련합니다.
*   **인가 코드 발행 흐름 (`/api/oauth/authorize` & `/token`):**
    *   OAuth 2.0 / OIDC Authorization Code Grant 방식을 따릅니다.
    *   인증된 사용자의 접근 시 SP(Service Provider)가 요구하는 `client_id` 및 `redirect_uri`를 검증하고 일회성 인가 코드를 발급해 되돌려보냅니다.
    *   SP 서버는 전달받은 코드와 `client_secret`을 이용해 토큰 교환(`POST /oauth/token`)을 수행합니다.

## 3. 계정 통제 및 데이터 동기화 (Account & User Sync)
*   **계정 데이터 동기화 (`SyncService`):**
    *   일반적인 회원가입 기능은 제공하지 않고, 중앙 인사 시스템 등에서 전달받는 CSV 형태의 파일 데이터를 파싱(`csv-parse`)하여 주기적으로 사용자를 DB에 동기화(upsert)합니다.
    *   기본 비밀번호는 입사 시 암호화(bcrypt)되어 등록됩니다.
*   **수동 계정 생성 (`/api/admin/users/register`):** 외부 협력사 등은 관리자가 직접 사번과 이메일, 초기 비밀번호를 지정해 수동으로 생성할 수 있습니다.
*   **계정 상태 및 잠금 (`/api/admin/users/:id/unlock`):**
    *   현재 구조상 비정상적 요인(비밀번호 연속 실패 등)으로 계정이 잠긴 경우, 최고 관리자 권한으로 해당 유저의 잠금을 해제(Unlock)할 수 있습니다.

## 4. 시스템 관리자 기능 (Admin & SP Console)
프론트엔드 대시보드(`/admin`) 및 백엔드 어드민 API(`/api/admin/*`)를 통해 운영 관리 기능을 제공합니다. 이 모든 엔드포인트는 `ROLE_ADMIN` 역할을 가진 계정만 접근(Guard)할 수 있습니다.

*   **대시보드 모니터링 (`/admin/users`):** 전체 등록된 사용자 풀을 조회하고, `failedLoginAttempts`, `lastLoginAt`, `isLocked` 여부 등 직원 인증 현황을 추적/열람합니다.
*   **Service Provider (연동 앱) 통합 관리 (`/api/admin/sp`):** 
    *   SSO 인가를 받을 사내 앱(메신저, 이메일 등)을 식별하기 위한 OAuth 클라이언트를 동적으로 생성, 수정, 삭제(CRUD)합니다.
    *   최초 SP 생성 시 단 한 번 **Raw Secret**을 노출하며 이후 단방향 해시로만 보관합니다.
    *   **IP Allowlist (접근 차단):** 각 연동 앱별로 접근을 허용할 IP 대역 목록(`allowedIps`)을 지정하여, 인가 코드 교환(`POST /oauth/token`) 시 승인된 서버망인지 철저히 체크합니다. (`IpAllowlistGuard` 동작)
