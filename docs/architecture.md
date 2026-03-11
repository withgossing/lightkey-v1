# 🏛️ 애플리케이션 전체 아키텍처 (Application Architecture)

**프로젝트명:** 사원정보 기반 싱글 사인온(SSO) 통합 인증 관리 애플리케이션 (Lightkey SSO System)

## 1. 시스템 개요
Lightkey SSO 시스템은 한 번의 인증 과정(Single Sign-On)으로 기업 내 다양한 연동 시스템 및 그룹웨어에 안전하고 편리하게 접근할 수 있는 중앙 집중형 인증 시스템(Identity Provider, IdP)을 제공합니다. 
본 시스템은 **OAuth 2.0 및 OIDC(OpenID Connect)** 프로토콜(인가 코드 흐름)을 기반으로 동작하여, 연동 서비스(SP)들에게 표준화된 인증 및 권한 검증 수단을 제공합니다.

---

## 2. 주요 시스템 구성 (Architecture Components)
애플리케이션은 크게 사용자 및 관리자가 상호작용하는 **Frontend(Web)**, 핵심 인증 로직과 API를 제공하는 **Backend(API)**, 그리고 데이터를 저장하는 **Database** 인프라로 나뉘며, 모든 서비스는 **Docker 컨테이너**로 묶여 독립성과 확장성을 보장합니다.

### 2.1. Frontend 서비스 (`apps/web`)
통합 로그인 창 및 관리자 대시보드 화면을 제공합니다.
*   **프레임워크:** Next.js (v16) / React 19
*   **스타일링:** Tailwind CSS (v4)
*   **주요 역할:** 
    *   통합 로그인 폼 제공 및 관리자 세션 모니터링 대시보드.
    *   Server Actions 기능을 활용하여 인증 쿠키(`HttpOnly`)를 안전하게 파싱 및 프록싱.
*   **포트:** `18003`

### 2.2. Backend 서비스 (`apps/api`)
SSO/IdP 인증 코어 서버로서, 토큰 발급, OAuth 연동, DB 동기화 구역을 담당합니다.
*   **프레임워크:** NestJS (v11) / Node.js
*   **인증/보안 코어:** Passport.js (JWT), bcrypt
*   **데이터 접근:** TypeORM (PostgreSQL 통신)
*   **주요 역할:** 
    *   사번/비밀번호 검증 및 SSO 로그인 세션 쿠키 발급.
    *   인증 코드 생성 및 Access/Refresh 토큰 교환.
    *   사내 인사 시스템 CSV 파일 스케줄링 동기화 배치.
    *   접근 허용 IP(Allowlist) 검증 및 관리 API 제공.
*   **포트:** `18002`

### 2.3. 데이터베이스 인프라 (`docker-compose.yml`)
SSO의 고가용성과 영속성을 책임지는 두 가지 데이터 저장소입니다.
*   **관계형 DB (PostgreSQL 18):** 
    *   사원 정보, 직급/권한 데이터, OAuth 클라이언트(SP) 및 리다이렉트 URI 풀 저장 공간.
    *   포트: `18001` 매핑 (`lightkey-db`)
*   **In-Memory DB (Redis 8):** 
    *   SSO 중앙 로그인 세션 관리, 임시 인가 코드(Auth Code) 캐싱, 리프레시 토큰 화이트리스트 및 차단 블랙리스트 영위. (단, 현재 로컬 `docker-compose.yml`에는 등록되어 있으며 백엔드 연동 확장이 진행/예정 중입니다.)
    *   포트: `18002` 외부 노출 (충돌 방지를 위한 포트 조정 권장)

---

## 3. 인증 및 통신 흐름도 (SSO Flow)

본 시스템은 안전한 Cookie 기반 세션과 JWT 토큰 전략을 병행합니다. 토큰 유출 방지를 위해 Frontend(브라우저)에서 자바스크립트로 접근할 수 없도록 모든 토큰은 `HttpOnly`, `Secure` 옵션을 가진 쿠키를 통해 전송됩니다.

1.  **로그인 요청:** 사용자가 연동 애플리케이션(SP) 접근 시 비로그인 상태면 Lightkey SSO Web으로 리다이렉트.
2.  **IdP 인증:** Lightkey Web에서 사번과 비번을 입력하면 백엔드(NestJS)가 DB 통신 후, 성공 시 IdP Session `HttpOnly` 쿠키 발급.
3.  **인가 코드 발급:** 백엔드가 일회성 Authorization Code를 생성.
4.  **토큰 교환 (Back-channel):** SP(연동 앱)의 서버가 SSO Backend (API)로 Authorization Code를 보내고 Access/ID 토큰을 교환받음.
5.  **통합 로그아웃 (SLO):** 사용자가 로그아웃 시 백엔드에서 Redis 세션 파기 및 전체 SP 토큰 무효화(Revoke) 지시.

---

## 4. 인프라 및 배포 환경 (Deployment)
*   사내 포트 충돌 방지를 위해 기존의 3000, 5432 등의 포트 대신 **`18000` 대역 포트 매핑 정책**을 사용합니다.
*   로컬 개발 환경 및 스테이징 환경은 프로젝트 루트의 `docker-compose.yml`을 통해 전체 컨테이너를 এক 번에 오케스트레이션합니다. (DB 독립 볼륨 마운트)
*   설정값, 패스워드, JWT 시크릿 키는 절대 하드코딩하지 않고 환경 변수(`.env`)로 분리 운용합니다.
