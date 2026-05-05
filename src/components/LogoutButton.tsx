'use client'

import { signOut } from '@/app/actions/auth'

export default function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
      >
        로그아웃
      </button>
    </form>
  )
}
