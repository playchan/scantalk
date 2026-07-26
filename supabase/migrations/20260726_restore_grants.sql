-- 권한(GRANT) 복구 — Supabase 기본 상태로 되돌림
-- 증상: 유효한 키로도 모든 테이블에서 "permission denied" (service_role 포함)
-- 원인: public 스키마 테이블에 대한 anon/authenticated/service_role의 GRANT가 회수된 상태
-- 안전성: RLS 정책은 그대로 유지됨 — 행 단위 보안은 변하지 않고,
--         events처럼 정책 없는 테이블은 GRANT가 있어도 anon/authenticated가 여전히 차단됨.

grant usage on schema public to anon, authenticated, service_role;

grant all privileges on all tables in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

-- 앞으로 만들 테이블에도 동일하게 적용
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
