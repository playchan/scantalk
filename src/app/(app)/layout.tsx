import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

// v2 화면 구조 (docs/09 3번): 하단 탭 — 홈 / 챗 / 나의 AI
const TABS = [
  { href: '/dashboard', icon: '🏠', label: '홈' },
  { href: '/chat', icon: '💬', label: '챗' },
  { href: '/my-ai', icon: '🤖', label: '나의 AI' },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-[500px] mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-rose-500">
            스캔톡
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[120px]">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-[500px] mx-auto px-5 py-6 pb-24">
        {children}
      </main>

      {/* 하단 탭 바 — 챗 / 나의 AI 가 서비스의 중심 (docs/09) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-10">
        <div className="max-w-[500px] mx-auto grid grid-cols-3">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 py-2.5 text-gray-500 hover:text-rose-500 transition-colors"
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
