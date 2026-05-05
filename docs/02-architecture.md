# 시스템 아키텍처 설계서

> 이 문서는 앱이 어떤 기술들로 구성되어 있고, 각 기술이 무슨 역할을 하는지 설명합니다.

---

## 1. 전체 구성도

```
[사용자 브라우저 / 모바일]
        ↓ HTTPS
[Vercel — Next.js App Router]
    ├── 사용자 페이지 (프론트엔드)
    ├── 관리자 페이지 (프론트엔드)
    └── API Routes (서버 사이드, 여기서만 민감한 키 사용)
        ↓
[Supabase]                    [Claude API / OpenAI API]
    ├── PostgreSQL DB          ← AI 분석 초안 생성
    ├── Auth (로그인/인증)
    └── Storage (이미지 저장)
        ↓
[GitHub — 코드 저장소]
```

---

## 2. 각 기술의 역할

### Next.js (Vercel에서 실행)
- 사용자가 보는 화면(페이지) 담당
- API Routes: 서버에서만 실행되는 코드 (AI API 호출, DB 관리 등)
- `app/` 폴더 기반 App Router 방식 사용

### Supabase
- **Auth**: 회원가입, 로그인, 세션 관리
- **PostgreSQL DB**: 신청 내역, 리포트, 사용자 정보 저장
- **Storage**: 카톡 캡처 이미지 저장 (private bucket)
- **RLS**: 사용자별 데이터 접근 권한 자동 관리

### Claude API
- 관리자가 "AI 초안 생성" 버튼 클릭 시 호출
- 고민 내용 + 관계 상황을 바탕으로 분석 초안 생성
- 서버 사이드(API Route)에서만 호출 (키 보안)

### Vercel
- Next.js 앱을 인터넷에 배포하는 플랫폼
- GitHub에 코드를 올리면 자동으로 배포됨
- 환경 변수를 안전하게 관리

---

## 3. 페이지 구조

### 사용자 페이지 (`app/(user)/`)
```
/ (랜딩페이지)
/auth/signup (회원가입)
/auth/login (로그인)
/mypage (마이페이지)
/test (연애 성향 테스트)
/apply (분석 신청)
/apply/[id]/payment (결제 안내)
/report/[id] (리포트 확인)
/match (매칭 신청)
```

### 관리자 페이지 (`app/(admin)/`)
```
/admin (대시보드 — 신청 목록)
/admin/requests/[id] (신청 상세)
/admin/matches (매칭 신청자 목록)
```

### API Routes (`app/api/`)
```
/api/ai/generate (AI 초안 생성 — Claude API 호출)
/api/admin/publish (리포트 공개 처리)
/api/admin/status (상태 변경)
```

---

## 4. 데이터 흐름 (신청 → 리포트)

```
1. 사용자 이미지 업로드
   → Supabase Storage (private bucket)에 저장
   → DB에 파일 경로만 저장 (실제 파일 URL은 서버에서만 생성)

2. 사용자 신청 정보 저장
   → Supabase DB (analyses 테이블)

3. 관리자 "AI 초안 생성" 클릭
   → Next.js API Route 호출
   → API Route에서 DB에서 고민 내용 가져옴
   → Claude API에 프롬프트 전송
   → 결과를 DB에 저장

4. 관리자 수정 + 공개 처리
   → DB의 is_published 값을 true로 변경

5. 사용자 리포트 확인
   → DB에서 is_published = true 인 것만 조회해서 표시
```

---

## 5. 권한 구조

| 역할 | 접근 가능 범위 |
|------|---------------|
| 비로그인 | 랜딩페이지만 |
| 일반 사용자 | 본인 데이터만 (RLS 자동 적용) |
| 관리자 | 전체 데이터 조회·수정 가능 |

### 관리자 권한 부여 방법
- Supabase의 `user_roles` 테이블에 `admin` 역할 부여
- 관리자 페이지 접근 시 서버에서 역할 확인 후 차단

---

## 6. 환경 변수 목록

```env
# Supabase (공개 가능 — 브라우저에서도 사용)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase (비공개 — 서버에서만 사용)
SUPABASE_SERVICE_ROLE_KEY=

# AI API (비공개 — 서버에서만 사용)
ANTHROPIC_API_KEY=

# 앱 설정
NEXT_PUBLIC_APP_URL=
```

**주의**: `NEXT_PUBLIC_` 이 없는 변수는 절대 클라이언트 코드에서 사용하지 않는다.
