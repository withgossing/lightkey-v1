# 💻 개발자 참고 문서 (Developer Guide)

**프로젝트명:** Lightkey SSO System

본 문서는 사내 개발자 및 데브옵스, 운영 담당자가 로컬 개발 환경을 구축하고 Lightkey SSO 백엔드/프론트엔드를 스케일링/수정하는 데 필요한 핵심 정보를 제공합니다.

---

## 1. 프로젝트 구조 (Monorepo 기반)
프로젝트는 크게 `apps/` 폴더 아래 백엔드(api)와 프론트엔드(web)로 구성되어 있습니다.

```text
lightkey-v1/
├── apps/
│   ├── api/       # (NestJS v11) 인증 서버 코어 (OAuth, TypeORM, Passport)
│   └── web/       # (Next.js v16) 로그인 화면 및 어드민 대시보드 인터페이스
├── docs/          # 설계/명세 문서 저장소
├── docker-compose.yml # 통합 컨테이너 로컬/스테이징 구동 파일
└── README.md
```

## 2. 개발 환경 셋업 (Local Development)
모든 컴포넌트(DB, 백엔드, 프론트엔드)는 포트 충돌 방지를 위해 **`18000`번대**의 커스텀 대역 포트를 사용합니다. 가장 손쉽게 실행하는 방법은 Docker Compose를 이용하는 것입니다.

### 2.1 통합 컨테이너 실행
```bash
# 최상위 폴더에서 백그라운드로 모든 앱 실행 (DB, Redis, API, WEB)
docker-compose up -d --build
```
*   **Web 접속:** `http://localhost:18003`
*   **API 위치:** `http://localhost:18002`
*   **PostgreSQL:** `localhost:18001` (`lightkey_sso` 데이터베이스)
*   **Redis:** `localhost:18002` (API와 포트가 중복 노출되어 있는 경우, `18002`는 API가 쓰므로 추후 충돌 수정/확인 필요)

### 2.2 디버깅 및 단일 앱 실행
로컬 머신(Node)에 DB만 띄워두고 개별 서비스를 HMR(Hot Module Replacement)로 개발할 경우, `--scale` 옵션을 제어하거나 각 폴더의 npm script(`npm run dev`)를 사용합니다.
```bash
# DB 인프라만 컨테이너로 띄우기
docker-compose up -d lightkey-db sso-redis

# API (NestJS) 실행
cd apps/api && npm install && npm run start:dev

# Web (Next.js) 실행
cd apps/web && npm install && npm run dev
```

---

## 3. 핵심 모듈 가이드 (Backend - apps/api)

### 3.1 TypeORM 기반 스키마 (`users`, `oauth`, `roles`)
*   최초 애플리케이션 기동 시 `.env` 정보 (`DB_HOST`, `POSTGRES_USER` 등)를 바탕으로 `TypeOrmModule`에 의해 DB 테이블이 생성됩니다. (`synchronize: true` 사용 시 Production에서 주의)
*   **Soft Delete 정책:** 계정 정보는 이력을 위해 영구 삭제하지 않으며 `isLocked`, `roles` 상태값으로 제어합니다.

### 3.2 CSV 사원 동기화 (`SyncService`)
*   `apps/api/src/sync/sync.service.ts` 모듈은 특정 배치 스케줄, 또는 API 기동 시 지정 경로(CSV 파일 등 인사 정보 출처)를 읽어와 TypeORM Upsert를 진행하고, 비밀번호를 초기 해시화하여 `users` 테이블 풀을 채우는 역할을 합니다.

### 3.3 Authorization & Cookie Policy (`HttpOnly`)
보안상 치명적인 XSS 토큰 탈취를 방지하기 위해 클라이언트 로컬 스토리지 등에 토큰을 넘기지 않습니다.
*   `/api/auth/login` 응답은 Header Set-Cookie 메커니즘을 씁니다:
    *   `auth_token`: 수명 15분
    *   `refresh_token`: 수명 7일
*   Next.js 클라이언트는 API를 호출할 때 브라우저에 저장된 쿠키(Server Components 시 Fetch Options의 Header)를 실어 보냅니다. `apps/web/src/app/dashboard/page.tsx` 등 코드 확인.

### 3.4 IP Allowlisting Guard (`IpAllowlistGuard`)
*   SP(연동 앱)의 백엔드 서버가 인가 코드를 Token으로 교환하기 위해 진입하는 `/oauth/token` 엔드포인트는 `IpAllowlistGuard`가 적용되어 있습니다. SP 생성 시 등록한 CIDR/단일 IP 대역에 속하지 않은 서버의 요청은 무조건 403 Forbidden 차단됩니다.

---

## 4. 환경 변수 (Environment Variables .env)

`.env` 파일은 절대 Git 리포지토리에 올리지 말고 배포 환경마다 주입해야 합니다. 하드코딩되지 않은 변수 목록.
*   **DB 연동:** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
*   **API/WEB 포트:** `API_PORT`, `WEB_PORT`
*   **암호화:** `JWT_SECRET`
*   **기타:** `NEXT_PUBLIC_API_URL` (Web의 클라이언트 통신 기준 API 주소)
