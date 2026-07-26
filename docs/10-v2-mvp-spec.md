# 스캔톡 v2 MVP 상세 명세 (라운드 1 개발 착수용)

> [09-viral-ai-matching-plan.md](09-viral-ai-matching-plan.md)의 라운드 0~1을 **개발을 바로 시작할 수 있는 수준**으로 구체화한 문서입니다.
> 이 문서에 없는 기능은 이 MVP에서 만들지 않습니다.

---

## 1. 이 MVP가 답해야 하는 질문

**"사람들이 검사를 하고, 공유하고, 가입하고, '어울리는 사람과 채팅' 사전신청까지 하는가?"**

AI봇도, 채팅도, 호감도도 이 MVP에는 없습니다. 오직 **바이럴 검사 → 리드 확보 퍼널**과 **그것을 측정하는 인프라**만 만듭니다.

### 통과 기준 (라운드 1 게이트)

| 퍼널 | 기준 | | 유입 | 기준 |
|------|------|-|------|------|
| 방문 → 검사 시작 | 60%+ | | 첫 2주 방문자 | 1,000명 |
| 시작 → 완료 | 70%+ | | 완료자 공유율 | 20%+ |
| 완료 → 가입 | 30%+ | | 유효 채널 | 1곳 식별 |
| 가입 → 사전신청 | 30%+ | | | |

---

## 2. 범위

### 만드는 것 (이것이 전부)

1. 공개 검사 페이지 "내가 결혼할 확률은?" (비로그인 진행)
2. 결과 미리보기 → 간편 가입 → 결과 전체 공개
3. 공유 기능 (공유 카드 이미지 + 링크 복사 + 카카오톡)
4. "나와 어울리는 사람과 채팅하기" 사전신청
5. 이벤트 트래킹 (자체 events 테이블 + UTM)
6. 관리자 인사이트 탭 v1 (/admin/insights)
7. 외부 분석 도구 연결 (Vercel Analytics · GA4 · PostHog)

### 만들지 않는 것 (요청이 와도 이 라운드에선 거절)

- AI봇 생성·봇 대화·호감도 — 라운드 2~3
- 챗/나의 AI 탭 — 라운드 2~3
- 매칭·결제 신규 기능 — 라운드 4
- 검사 콘텐츠 2개 이상 — 1개로 검증 먼저
- 광고 집행, 푸시 알림, 카카오 로그인
- **OpenAI API 호출 없음** — 결과는 규칙 기반 계산. 이 라운드의 AI 비용은 0원

---

## 3. 사용자 플로우

```
SNS 링크 클릭 (?utm_source=instagram 등)
→ /quiz/marriage 인트로 ("내가 결혼할 확률은?" + 시작 버튼)
→ 문항 12개 (한 화면에 1문항, 진행바, 뒤로가기 가능)
→ 완료 → 결과 미리보기 (확률 숫자는 블러 + "결과 보려면 3초 가입")
→ 간편 가입 (기존 /signup 재활용, 완료 후 결과로 복귀)
→ 결과 전체 공개 (확률 % + 유형 + 설명 + 공유 카드)
→ [공유하기]  /  [나와 어울리는 사람과 채팅하기 → 사전신청 완료]
```

핵심 규칙:
- 가입 전 응답은 **브라우저에 임시 보관**(sessionStorage), 가입 완료 직후 서버에 저장
- 방문자마다 익명 `session_id`(쿠키, UUID)를 발급해 가입 전후 퍼널을 하나로 연결

---

## 4. 페이지 구조

| 경로 | 상태 | 로그인 | 내용 |
|------|------|--------|------|
| `/quiz/marriage` | **신규** | 불필요 | 인트로 + 문항 진행 (클라이언트 컴포넌트) |
| `/quiz/marriage/result/[id]` | **신규** | 필요 | 결과 전체 + 공유 + 사전신청 CTA |
| `/quiz/marriage/opengraph-image` 또는 `/api/og/marriage/[id]` | **신규** | 불필요 | 공유 카드 이미지 자동 생성 (next/og) |
| `/signup`, `/login` | 수정 | — | `redirect_to` 파라미터 지원 (가입 후 결과로 복귀) |
| `/admin/insights` | **신규** | admin | 인사이트 대시보드 v1 |
| `/` 랜딩 | 수정 | 불필요 | 상단에 검사 배너 1개 추가 (그 외 변경 없음) |

⚠️ **[src/proxy.ts](../src/proxy.ts) 수정 필요**: `PUBLIC_PATHS`에 `/quiz` 경로를 추가해야 비로그인 검사가 가능합니다.

```
현재: ['/', '/login', '/signup', '/auth/callback']
변경: pathname.startsWith('/quiz') 도 공개 처리 (+ /api/og)
```

---

## 5. 검사 콘텐츠 명세

### 문항 (12개)

- 형식: 4지선다, 한 화면 1문항, 소요 90초 이내 목표
- 문항 주제 (초안 — 콘텐츠 기획 시 확정): 연애 태도 4개 + 생활 습관 3개 + 관계 가치관 3개 + 결혼관 2개
- **설계 제약**: 응답 축은 라운드 2에서 AI봇 성향 프로필로 재활용할 수 있도록 4개 축(표현 방식/속도/독립성/안정 지향)에 매핑해 둔다

### 결과 계산 (규칙 기반, AI 미사용)

- 확률 % = 기본 50% + 축별 가중치 합산 (범위 35%~95%로 클램프 — 0%/100%는 재미를 해침)
- 유형 6종: 확률 구간 × 주 성향 축 조합으로 결정 (예: "따뜻한 계획형 — 결혼 확률 78%")
- 유형별 텍스트: 요약 2문장 + 강점 1개 + 밈 한 줄 (공유 카드에 들어갈 문구)
- ⚠️ 문구 정책: "반드시 결혼한다/못한다" 단정 금지 — CLAUDE.md 8번 AI 분석 정책과 동일 톤

### 공유 카드

- next/og로 1080×1080(정방형) 이미지 자동 생성: 확률 % + 유형 이름 + 밈 한 줄 + 서비스 URL
- 결과 페이지 버튼: ① 이미지 저장 ② 링크 복사 ③ 카카오톡 공유 (JS SDK 없으면 링크 복사로 대체)
- 공유 링크에는 `?utm_source=share&ref={session_id 해시}` 자동 부착 → 바이럴 계수 측정

---

## 6. DB 변경 (Supabase)

기존 테이블은 건드리지 않고 3개만 추가합니다. `love_tests`는 로그인 필수 구조라 재사용하지 않습니다 (비로그인 진행 + 확률/축 데이터 구조가 다름).

### quiz_results

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid FK → auth.users, **nullable** | 가입 직후 연결 |
| session_id | text | 익명 세션과 연결 |
| quiz_slug | text | 'marriage' (콘텐츠 추가 대비) |
| answers | jsonb | 응답 원본 |
| axes | jsonb | 4축 점수 (라운드 2 봇 프로필 재료) |
| probability | int | 확률 % |
| result_type | text | 유형 이름 |
| created_at | timestamptz | |

RLS: 본인(user_id) 조회만 허용. INSERT는 서버 액션에서만.

### preregistrations (사전신청)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid FK, unique | 1인 1신청 |
| quiz_result_id | uuid FK | 어떤 결과에서 신청했는지 |
| created_at | timestamptz | |

### events (측정의 기준 데이터)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | bigint PK | |
| session_id | text | 익명 쿠키 UUID |
| user_id | uuid, nullable | 로그인 후 자동 병기 |
| name | text | 아래 이벤트 명세의 이름만 허용 |
| properties | jsonb | 추가 정보 (PII 금지) |
| utm_source / utm_medium / utm_campaign / ref | text, nullable | 첫 방문 시 캡처 후 세션 내 유지 |
| created_at | timestamptz | |

RLS: 일반 사용자 SELECT 불가. INSERT는 서버 경유만. 조회는 admin 전용.

---

## 7. 이벤트 명세 (이 8개만, 임의 추가 금지)

| 이벤트 | 시점 | properties |
|--------|------|------------|
| `quiz_view` | 인트로 도달 | — |
| `quiz_start` | 1번 문항 표시 | — |
| `quiz_complete` | 12번 응답 완료 | probability, result_type |
| `signup_start` | 미리보기에서 가입 클릭 | — |
| `signup_complete` | 가입 성공 | — |
| `result_view` | 결과 전체 열람 | — |
| `share_click` | 공유 버튼 | method: image/link/kakao |
| `prereg_complete` | 사전신청 완료 | — |

구현: 서버 액션 `trackEvent(name, properties)` 하나로 통일. 클라이언트에서 직접 DB 접근 금지.
PostHog에도 같은 이름으로 이중 발송 (자체 DB가 기준, PostHog는 리코딩·퍼널 시각화용).

---

## 8. 관리자 인사이트 v1 (/admin/insights)

기존 admin 레이아웃(권한 체크)에 탭 추가. 데이터 소스는 `events` 테이블 집계 쿼리만 사용.

| 영역 | 내용 | 구현 |
|------|------|------|
| KPI 카드 4개 | 방문(quiz_view) · 완료(quiz_complete) · 가입(signup_complete) · 사전신청(prereg_complete) | 기간별 count |
| 퍼널 | 방문→시작→완료→가입→사전신청 단계별 전환율 | 단계별 고유 session_id 수 |
| 목표 대비 | 각 전환율 옆에 게이트 기준과 ✅/❌ | 1번 섹션의 기준값 하드코딩 아닌 상수 파일 |
| 채널 표 | utm_source별 방문·가입 수 | group by utm_source |
| 공유 지표 | 공유율, ref 경유 방문 수(바이럴 계수 분자) | share_click / quiz_complete |
| 기간 필터 | 오늘 / 7일 / 30일 / 전체 | 쿼리 파라미터 |

차트 라이브러리 도입 금지 — 숫자 카드와 CSS 바로 충분 (KISS).

---

## 9. 외부 도구 셋업 (개발과 병행, 30분 작업)

| 도구 | 할 일 | env |
|------|------|-----|
| Vercel Analytics | 대시보드에서 활성화 + `@vercel/analytics` 추가 | — |
| GA4 | 속성 생성, gtag 스니펫 (layout에 Script) | `NEXT_PUBLIC_GA_ID` |
| PostHog | 프로젝트 생성, posthog-js 초기화, 세션 리코딩 ON | `NEXT_PUBLIC_POSTHOG_KEY` |

원칙: 키는 전부 환경변수. 이벤트 이름은 7번 명세와 동일하게 통일.

---

## 10. 비기능 요구사항

- **모바일 우선**: 375px 기준 설계. 문항 버튼은 엄지 터치 크기(44px+)
- **속도**: 검사 진행은 클라이언트 상태로만 (문항마다 서버 왕복 금지). 결과 페이지 LCP 2.5s 이내
- **개인정보**: events.properties에 이메일·닉네임 등 PII 저장 금지. 검사 응답은 가입한 본인만 조회 가능
- **문구 안전**: 단정적 표현 금지 (5번 참조)
- **접근 제어**: /quiz만 공개, 나머지 기존 정책 유지. /admin/insights는 admin만

---

## 11. 개발 순서 (제안: 2주)

| # | 작업 | 예상 |
|---|------|------|
| 0 | R0 마무리: Vercel 배포 + Supabase 운영 점검 | 1~2일 |
| 1 | DB 마이그레이션 3개 테이블 + RLS | 0.5일 |
| 2 | trackEvent 서버 액션 + session_id 쿠키 + UTM 캡처 | 1일 |
| 3 | /quiz/marriage 문항 플로우 (문항은 더미로 먼저) | 1.5일 |
| 4 | 결과 계산 로직 + 미리보기 → 가입 복귀 → 결과 페이지 | 1.5일 |
| 5 | 공유 카드(next/og) + 공유 버튼 + ref 링크 | 1일 |
| 6 | 사전신청 | 0.5일 |
| 7 | /admin/insights v1 | 1.5일 |
| 8 | 외부 도구 3종 연결 | 0.5일 |
| 9 | 문항·결과 카피 확정 반영 (기획 병행) | 개발 외 |
| 10 | 지인 10~20명 POC 테스트 → 이벤트 정합성 검증 | 2일 |

POC 통과 조건: 테스터 전원이 이탈 없이 완주 + events에 8개 이벤트가 순서대로 정확히 쌓임.

---

## 12. 출시 전 테스트 체크리스트

- [ ] `npm run build` 통과
- [ ] 비로그인으로 /quiz/marriage 전체 진행 가능
- [ ] 가입 후 결과 페이지로 정확히 복귀, 응답 유실 없음
- [ ] 새로고침/뒤로가기 시 진행 상태 처리 (최소: 인트로로 복귀해도 오류 없음)
- [ ] 타인의 quiz_result id로 접근 시 차단 (RLS)
- [ ] 일반 유저가 /admin/insights 접근 불가
- [ ] events에 PII 없음 확인
- [ ] UTM 붙은 링크 → 채널 표에 집계 확인
- [ ] 공유 카드 이미지가 카톡/인스타 미리보기에서 정상 노출 (OG 태그)
- [ ] 375px 화면에서 전 플로우 확인

---

## 13. 이 문서의 위치

- 상위 전략: [09-viral-ai-matching-plan.md](09-viral-ai-matching-plan.md) (라운드 전체)
- 투자자용: [ir/scantalk-ir-deck.pdf](ir/scantalk-ir-deck.pdf)
- 라운드 1 게이트 통과 후 → 라운드 2(AI봇 대화) 명세를 같은 형식으로 작성한다
