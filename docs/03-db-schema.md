# 데이터베이스 스키마 설계서

> Supabase PostgreSQL 기준으로 설계합니다.
> 모든 테이블에는 RLS(Row Level Security)를 반드시 설정합니다.

---

## 1. 테이블 목록

| 테이블명 | 설명 |
|----------|------|
| `profiles` | 사용자 기본 정보 |
| `user_roles` | 관리자 권한 관리 |
| `love_tests` | 연애 성향 테스트 결과 |
| `analyses` | 카카오톡 분석 신청 내역 |
| `analysis_images` | 업로드된 이미지 경로 |
| `reports` | 분석 리포트 (AI 초안 + 운영자 수정본) |
| `match_requests` | 매칭 신청 내역 |
| `products` | 유료 상품 정보 |

---

## 2. 테이블 상세

### profiles (사용자 프로필)
```
id           UUID       기본키, auth.users.id 참조
email        TEXT       이메일
nickname     TEXT       닉네임 (선택)
created_at   TIMESTAMP  가입일
updated_at   TIMESTAMP  수정일
```
- RLS: 본인만 조회·수정 가능

---

### user_roles (관리자 권한)
```
id           UUID       기본키
user_id      UUID       profiles.id 참조
role         TEXT       'admin' 또는 'user'
created_at   TIMESTAMP
```
- RLS: 관리자만 읽기 가능 (일반 사용자 접근 불가)

---

### love_tests (연애 성향 테스트 결과)
```
id              UUID       기본키
user_id         UUID       profiles.id 참조
answers         JSONB      질문별 답변 (JSON 형태)
result_type     TEXT       성향 유형 결과
result_summary  TEXT       결과 요약 텍스트
created_at      TIMESTAMP
```
- RLS: 본인만 조회 가능

---

### analyses (분석 신청)
```
id                UUID        기본키
user_id           UUID        profiles.id 참조
product_id        UUID        products.id 참조
situation         TEXT        관계 상황 (썸/소개팅/연애/재회)
concern           TEXT        고민 내용 (사용자 입력)
privacy_agreed    BOOLEAN     개인정보 가림 동의 여부 (필수)
payment_status    TEXT        결제 상태 (pending/paid/refunded)
process_status    TEXT        처리 상태 (waiting/analyzing/reviewing/done)
payment_note      TEXT        결제 관련 메모 (관리자용)
created_at        TIMESTAMP
updated_at        TIMESTAMP
```
- RLS: 본인만 조회 가능 / 관리자는 전체 조회·수정 가능

**payment_status 값**
- `pending`: 결제 대기 중
- `paid`: 결제 완료
- `refunded`: 환불 처리됨

**process_status 값**
- `waiting`: 결제 확인 대기
- `analyzing`: AI 분석 중
- `reviewing`: 관리자 검수 중
- `done`: 완료 (리포트 공개)

---

### analysis_images (신청 이미지)
```
id            UUID       기본키
analysis_id   UUID       analyses.id 참조
storage_path  TEXT       Supabase Storage 경로 (private bucket)
order_index   INTEGER    이미지 순서 (1~5)
created_at    TIMESTAMP
```
- RLS: 본인 신청 이미지만 조회 가능 / 관리자는 전체 가능
- 실제 이미지 URL은 서버 사이드에서 signed URL로 생성

---

### reports (분석 리포트)
```
id                  UUID       기본키
analysis_id         UUID       analyses.id 참조 (1:1)
ai_draft            TEXT       AI 생성 초안
final_content       TEXT       운영자 최종 수정본
situation_summary   TEXT       현재 상황 요약
interest_level      TEXT       호감 가능성 (가능성 중심 표현)
positive_signals    TEXT[]     긍정 신호 목록
negative_signals    TEXT[]     부정 신호 목록
do_not_do           TEXT[]     하면 안 되는 행동 목록
reply_suggestions   TEXT[]     추천 답장 목록
coaching_3days      TEXT       3일 코칭 (심층 이상)
coaching_7days      TEXT       7일 코칭 (7일 코칭 상품만)
direction           TEXT       방향성 제안
is_published        BOOLEAN    공개 여부 (false면 사용자에게 보이지 않음)
published_at        TIMESTAMP  공개 시각
created_at          TIMESTAMP
updated_at          TIMESTAMP
```
- RLS: `is_published = true`인 것만 본인이 조회 가능 / 관리자는 전체 가능

---

### match_requests (매칭 신청)
```
id           UUID       기본키
user_id      UUID       profiles.id 참조
love_test_id UUID       love_tests.id 참조
status       TEXT       신청 상태 (pending/reviewing/matched/closed)
note         TEXT       관리자 메모
created_at   TIMESTAMP
```
- RLS: 본인만 조회 가능 / 관리자는 전체 조회·수정

---

### products (상품 정보)
```
id           UUID       기본키
name         TEXT       상품명
price        INTEGER    가격 (원 단위)
description  TEXT       상품 설명
features     TEXT[]     포함 기능 목록
is_active    BOOLEAN    판매 여부
sort_order   INTEGER    표시 순서
created_at   TIMESTAMP
```
- RLS: 모든 사용자 읽기 가능 / 수정은 관리자만

**초기 데이터**
```
썸톡 간단 분석  9900원
썸톡 심층 분석  29000원
7일 대화 코칭   99000원
```

---

## 3. RLS 정책 요약

| 테이블 | 사용자 정책 | 관리자 정책 |
|--------|------------|------------|
| profiles | 본인만 read/update | 전체 read |
| user_roles | 접근 불가 | 전체 read |
| love_tests | 본인만 read/insert | 전체 read |
| analyses | 본인만 read/insert | 전체 read/update |
| analysis_images | 본인만 read/insert | 전체 read |
| reports | is_published=true인 본인만 read | 전체 read/update |
| match_requests | 본인만 read/insert | 전체 read/update |
| products | 전체 read | 전체 read/update |

---

## 4. Supabase Storage 버킷 설정

| 버킷명 | 공개 여부 | 용도 |
|--------|----------|------|
| `analysis-images` | **private** | 카카오톡 캡처 이미지 |

**폴더 구조**
```
analysis-images/
└── {user_id}/
    └── {analysis_id}/
        ├── 1.jpg
        ├── 2.jpg
        └── ...
```

**이미지 접근 방법**
- 직접 URL 접근 금지 (private bucket)
- 서버 사이드에서 `supabase.storage.createSignedUrl()` 로 임시 URL 생성
- 임시 URL 유효 시간: 1시간 이내
