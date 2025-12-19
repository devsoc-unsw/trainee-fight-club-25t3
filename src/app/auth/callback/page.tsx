'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect(() => {
    const handleAuth = async () => {
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }
      // Clean up the URL and redirect
      window.history.replaceState({}, document.title, window.location.pathname)
      router.replace('/dashboard')
    }

    handleAuth()
  }, [code, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
      <div className="text-white">Signing you in...</div>
    </div>
  )
}