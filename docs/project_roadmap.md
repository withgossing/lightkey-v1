# 🗺️ 향후 작업 로드맵 및 상세 계획서 (Project Roadmap)

**프로젝트명:** Lightkey SSO System v1.1.0 고도화 계획
**작성일:** 현재 기준 (MVP 완료 후)

이 문서는 PRD(제품 요구사항 정의서)의 "Next Steps" 트랙과 각 프로젝트 에이전트들의 검토 의견을 종합하여, 향후 3번의 스프린트 동안 진행할 상세 작업 계획을 명세합니다.

---

## 🎯 Phase 1. 실제 연동 검증 및 보안/테스트 인프라 구축
현재 개발된 OIDC 토큰 발급 코어가 실제 환경에서 무결하게 작동하는지 검증하고, 회귀 버그를 방지할 기초 체력을 다집니다.

*   **[테스트] 상용 연동 베타 테스트 (Integration Test)**
    *   **작업 내용:** 사내 실제 서비스(예: 백오피스 어드민, 사내 위키 등) 1~2개를 선정하여 Lightkey SSO의 연동 앱(SP)으로 등록.
    *   **검증 포인트:** Authorization Code 발급 -> 서버 간 Token 교환(M2M) -> 세션 유지 및 통합 로그아웃(SLO) 정상 작동 여부 확인.
*   **[QA] E2E 보안 자동화 테스트 도입**
    *   **작업 내용:** Playwright 또는 Cypress 환경 세팅.
    *   **검증 포인트:** 가상 유저의 폼 로그인부터 리다이렉션, 세션 쿠키(`HttpOnly`) 파싱 및 만료 처리 자동화 스크립트 작성 (PR 병합 기준 수립).
*   **[DevOps] CI/CD 파이프라인 기초 셋업**
    *   **작업 내용:** GitHub Actions (또는 GitLab CI) 워크플로우 `.yml` 작성.
    *   **검증 포인트:** Push/PR 발생 시 NestJS 및 Next.js 프로젝트의 `npm run lint`, `npm run build`, `npm run test` 자동 수행 및 성공 시에만 Merge 허용.

---

## 🎯 Phase 2. 대규모 트래픽 대비 백엔드 최적화 및 고가용성 보장
사내 구성원 전체가 아침 출근 시간에 동시 접속하는 상황(Peak Traffic)에 대비하여 병목을 제거합니다.

*   **[DBA] PostgreSQL 로그 파티셔닝 (Partitioning)**
    *   **작업 내용:** `login_histories` 테이블이 무한정 커지는 것을 막기 위해 월 단위(Monthly) 혹은 주 단위(Weekly) 파티셔닝 마이그레이션 스크립트 작성 및 적용.
*   **[백엔드] Redis 이중화 (HA) 아키텍처 도입**
    *   **작업 내용:** 단일 Redis 컨테이너를 Redis Sentinel 또는 Redis Cluster 구조의 `docker-compose.yml` 리소스로 확장.
    *   **검증 포인트:** 마스터 Redis 노드 다운 시 슬레이브로 자동 Failover(승격) 되더라도 기존 직원들의 인가 코드 및 Refresh Token 세션이 유지되는지 테스트.
*   **[백엔드/동기화] 인사 CSV 배치 성능 최적화**
    *   **작업 내용:** 만 명 단위의 `users` 테이블 Upsert 작업 시 메모리 초과 현상이 발생하지 않도록 Stream 파싱 및 Bulk Insert Chunk(예: 1,000건 단위) 로직 고도화.

---

## 🎯 Phase 3. 관리자 제어 콘솔(UX/UI) 고도화 및 안정성 확보
시스템 관리자가 수만 명의 사용자와 수백 개의 앱을 딜레이 없이 쾌적하게 관리할 수 있도록 프론트엔드 환경을 레벨업합니다.

*   **[프론트엔드] 대용량 Data Grid 제어 (Pagination & Search)**
    *   **작업 내용:** `/admin/users` 및 `/admin/sp` 페이지에 Server-side Pagination, Sorting, Search 쿼리 파라미터 적용.
    *   **백엔드 연계:** NestJS User/Sp Controller에 `?page=1&limit=50&search=홍길동` 처리를 위한 TypeORM `findAndCount` 로직 추가.
*   **[프론트엔드] 친절한 예외 처리 플로우 (Error Handling UX)**
    *   **작업 내용:** IP Allowlist 차단(403) 또는 세션 만료(401) 발생 시 투박한 백엔드 JSON 에러가 아닌, 사내 양식에 맞춘 세련된 에러 페이지(Error Boundary) 컴포넌트로 리다이렉트.
*   **[아키텍트] 통합 로그아웃 (SLO) 전파 아키텍처 보강**
    *   **작업 내용:** IdP(Lightkey)에서 로그아웃 시, 접속해 있던 SP(연동 앱)들의 백엔드 노드들로 `Logout Webhook` 을 쏘아주어 SP 측 로컬 세션도 동기화하여 완벽히 파기하도록 표준 API 명세 마련 및 구현.

---

## 💡 요약 및 배포 전략
*   위 3번의 Phase 완료 후 **버전 1.1.0 (상용 GA 버전)** 으로 태깅합니다.
*   이후 AWS/K8s 등 운영 인프라에 Helm 차트를 활용한 무중단 배포(Rolling Update) 환경 셋업을 마지막 관문으로 삼습니다.
