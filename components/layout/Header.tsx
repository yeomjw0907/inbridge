"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NotificationBadge } from "@/components/NotificationBadge"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.warn("Auth error:", error)
        // 에러가 발생해도 계속 진행
      }
    }

    initAuth()

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => {
        if (subscription) {
          subscription.unsubscribe()
        }
      }
    } catch (error) {
      console.warn("Auth state change error:", error)
      return () => {}
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/influencers")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">inbridge.ai</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/influencers"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/influencers" ? "text-primary" : "text-primary/80"
            }`}
          >
            인플루언서 찾기
          </Link>
          <Link
            href="/blog"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/blog" ? "text-primary" : "text-primary/80"
            }`}
          >
            블로그
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/contact" ? "text-primary" : "text-primary/80"
            }`}
          >
            문의
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <NotificationBadge />
              <Link href="/mypage">
                <Button variant="ghost" size="sm">
                  마이페이지
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signup">
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white [&:hover]:bg-primary [&:hover]:text-white">
                  로그인/회원가입
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
                  회원가입
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

