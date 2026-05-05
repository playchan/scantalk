-- =============================================
-- 스캔톡 데이터베이스 초기 설정
-- Supabase > SQL Editor에서 전체 복사 후 실행
-- =============================================


-- =============================================
-- 1. 테이블 생성 (의존성 순서대로)
-- =============================================

-- profiles (auth.users와 1:1)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  nickname    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- products (analyses보다 먼저 생성)
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  features    TEXT[] NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- love_tests
CREATE TABLE IF NOT EXISTS public.love_tests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers         JSONB NOT NULL DEFAULT '{}',
  result_type     TEXT NOT NULL DEFAULT '',
  result_summary  TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- analyses
CREATE TABLE IF NOT EXISTS public.analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id),
  situation       TEXT NOT NULL CHECK (situation IN ('썸', '소개팅', '연애', '재회')),
  concern         TEXT NOT NULL DEFAULT '',
  privacy_agreed  BOOLEAN NOT NULL DEFAULT FALSE,
  payment_status  TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  process_status  TEXT NOT NULL DEFAULT 'waiting' CHECK (process_status IN ('waiting', 'analyzing', 'reviewing', 'done')),
  payment_note    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- analysis_images
CREATE TABLE IF NOT EXISTS public.analysis_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id   UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  order_index   INTEGER NOT NULL CHECK (order_index BETWEEN 1 AND 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- reports
CREATE TABLE IF NOT EXISTS public.reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id       UUID NOT NULL UNIQUE REFERENCES public.analyses(id) ON DELETE CASCADE,
  ai_draft          TEXT,
  final_content     TEXT,
  situation_summary TEXT,
  interest_level    TEXT,
  positive_signals  TEXT[] NOT NULL DEFAULT '{}',
  negative_signals  TEXT[] NOT NULL DEFAULT '{}',
  do_not_do         TEXT[] NOT NULL DEFAULT '{}',
  reply_suggestions TEXT[] NOT NULL DEFAULT '{}',
  coaching_3days    TEXT,
  coaching_7days    TEXT,
  direction         TEXT,
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- match_requests
CREATE TABLE IF NOT EXISTS public.match_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  love_test_id  UUID REFERENCES public.love_tests(id),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'matched', 'closed')),
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================
-- 2. 헬퍼 함수
-- =============================================

-- 관리자 여부 확인 (RLS 정책에서 재귀 없이 사용)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
$$;

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 회원가입 시 profiles 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


-- =============================================
-- 3. 트리거
-- =============================================

-- 회원가입 → profiles 자동 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 자동 갱신
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_analyses_updated_at ON public.analyses;
CREATE TRIGGER set_analyses_updated_at
  BEFORE UPDATE ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_reports_updated_at ON public.reports;
CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- =============================================
-- 4. RLS 활성화
-- =============================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_tests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;


-- =============================================
-- 5. RLS 정책
-- =============================================

-- profiles
CREATE POLICY "본인 프로필 조회" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "본인 프로필 수정" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "트리거에 의한 프로필 생성" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "본인 권한 조회" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- love_tests
CREATE POLICY "본인 테스트 조회" ON public.love_tests
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "본인 테스트 등록" ON public.love_tests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- analyses
CREATE POLICY "본인 신청 조회" ON public.analyses
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "본인 신청 등록" ON public.analyses
  FOR INSERT WITH CHECK (user_id = auth.uid() AND privacy_agreed = TRUE);

CREATE POLICY "관리자 신청 수정" ON public.analyses
  FOR UPDATE USING (public.is_admin());

-- analysis_images
CREATE POLICY "본인 이미지 조회" ON public.analysis_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.analyses
      WHERE id = analysis_id
        AND (user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "본인 이미지 등록" ON public.analysis_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analyses
      WHERE id = analysis_id AND user_id = auth.uid()
    )
  );

-- reports
CREATE POLICY "공개된 본인 리포트 조회" ON public.reports
  FOR SELECT USING (
    public.is_admin() OR (
      is_published = TRUE AND
      EXISTS (
        SELECT 1 FROM public.analyses
        WHERE id = analysis_id AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "관리자 리포트 전체 권한" ON public.reports
  FOR ALL USING (public.is_admin());

-- match_requests
CREATE POLICY "본인 매칭 신청 조회" ON public.match_requests
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "본인 매칭 신청 등록" ON public.match_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "관리자 매칭 수정" ON public.match_requests
  FOR UPDATE USING (public.is_admin());

-- products
CREATE POLICY "활성 상품 전체 조회" ON public.products
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "관리자 상품 전체 권한" ON public.products
  FOR ALL USING (public.is_admin());


-- =============================================
-- 6. 초기 상품 데이터
-- =============================================

INSERT INTO public.products (name, price, description, features, is_active, sort_order)
VALUES
  (
    '썸톡 간단 분석',
    9900,
    '처음 분석하시는 분께 딱 맞는 플랜',
    ARRAY['카톡 대화 분석', '호감도 측정', '3일 코칭 플랜', '전문가 검수'],
    TRUE,
    1
  ),
  (
    '썸톡 심층 분석',
    29000,
    '더 깊은 분석과 맞춤 전략이 필요할 때',
    ARRAY['기본 분석 전체 포함', '7일 코칭 플랜', '답장 예시 5개', '우선 처리'],
    TRUE,
    2
  ),
  (
    '7일 대화 코칭',
    99000,
    '7일간 밀착 코칭으로 관계를 바꿔보세요',
    ARRAY['심층 분석 전체 포함', '7일 1:1 코칭', '무제한 답장 예시', '최우선 처리', '코칭 완료 후 매칭 우선권'],
    TRUE,
    3
  )
ON CONFLICT DO NOTHING;


-- =============================================
-- 완료 확인 쿼리 (실행 후 결과 확인)
-- =============================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
