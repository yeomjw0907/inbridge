import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not set. Using dummy client.')
    // 더미 클라이언트 반환 (에러 방지)
    return createBrowserClient('https://dummy.supabase.co', 'dummy-key')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

