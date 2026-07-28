import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

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
            <Link
              href="/chat"
              className="text-xs font-semibold text-gray-600 hover:text-rose-500 px-2 py-1"
            >
              💬 챗
            </Link>
            <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[120px]">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-[500px] mx-auto px-5 py-6">
        {children}
      </main>
    </div>
  )
}
