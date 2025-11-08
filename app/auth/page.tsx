"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Users, Building2 } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [role, setRole] = useState<"influencer" | "brand">("influencer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [channel, setChannel] = useState("")
  const [followers, setFollowers] = useState("")
  const [categories, setCategories] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "이메일과 비밀번호를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // 사용자 역할 확인
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (userData?.role === "influencer") {
        router.push("/mypage")
      } else {
        router.push("/brand")
      }
    } catch (error: any) {
      toast({
        title: "로그인 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "이메일과 비밀번호를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    if (role === "influencer" && (!name || !channel)) {
      toast({
        title: "필수 항목을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    if (role === "brand" && (!companyName || !contactPerson)) {
      toast({
        title: "필수 항목을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) throw new Error("사용자 생성 실패")

      // users 테이블에 사용자 정보 저장
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: email,
        role: role,
      })

      if (userError) throw userError

      // 역할별 추가 정보 저장
      if (role === "influencer") {
        const { error: influencerError } = await supabase.from("influencers").insert({
          user_id: authData.user.id,
          channel_name: channel,
          followers: parseInt(followers) || 0,
          categories: categories.split(",").map((c) => c.trim()),
        })

        if (influencerError) throw influencerError
      } else {
        const { error: brandError } = await supabase.from("brands").insert({
          user_id: authData.user.id,
          company_name: companyName,
          contact_person: contactPerson,
          website: website,
        })

        if (brandError) throw brandError
      }

      toast({
        title: "회원가입이 완료되었습니다 ✅",
        description: "로그인해주세요",
      })

      setIsLogin(true)
    } catch (error: any) {
      toast({
        title: "회원가입 실패",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={authMode === "login" ? "default" : "ghost"}
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 ${
                    authMode === "login"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "text-primary hover:bg-primary/5"
                  }`}
                >
                  로그인
                </Button>
                <Button
                  variant={authMode === "signup" ? "default" : "ghost"}
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 ${
                    authMode === "signup"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "text-primary hover:bg-primary/5"
                  }`}
                >
                  회원가입
                </Button>
              </div>
              <CardTitle className="text-3xl text-center text-gray-900">
                {authMode === "login" ? "로그인" : "회원가입"}
              </CardTitle>
              <CardDescription className="text-center text-primary/80">
                {authMode === "login"
                  ? "계정에 로그인하세요"
                  : "새 계정을 만들어 시작하세요"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authMode === "signup" && (
                <Tabs value={role} onValueChange={(v) => setRole(v as "influencer" | "brand")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="influencer">
                      <Users className="w-4 h-4 mr-2" />
                      인플루언서
                    </TabsTrigger>
                    <TabsTrigger value="brand">
                      <Building2 className="w-4 h-4 mr-2" />
                      브랜드
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {authMode === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="text-gray-900">이메일</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password" className="text-gray-900">비밀번호</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="비밀번호"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90" size="lg">
                    {loading ? "로그인 중..." : "로그인"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email" className="text-gray-900">이메일 *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-gray-900">비밀번호 *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="비밀번호"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {role === "influencer" ? (
                    <>
                      <div>
                        <Label htmlFor="name" className="text-gray-900">이름 *</Label>
                        <Input
                          id="name"
                          placeholder="홍길동"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="channel" className="text-gray-900">채널 *</Label>
                        <Input
                          id="channel"
                          placeholder="채널명"
                          value={channel}
                          onChange={(e) => setChannel(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="followers" className="text-gray-900">팔로워 수</Label>
                        <Input
                          id="followers"
                          type="number"
                          placeholder="예: 100000"
                          value={followers}
                          onChange={(e) => setFollowers(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="categories" className="text-gray-900">주요 카테고리 (쉼표로 구분)</Label>
                        <Input
                          id="categories"
                          placeholder="예: 뷰티, 맛집, 여행"
                          value={categories}
                          onChange={(e) => setCategories(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="company-name" className="text-gray-900">회사명 *</Label>
                        <Input
                          id="company-name"
                          placeholder="회사명"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-person" className="text-gray-900">담당자 *</Label>
                        <Input
                          id="contact-person"
                          placeholder="홍길동"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-gray-900">웹사이트</Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://example.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={loading} className="w-full bg-primary text-white hover:bg-primary/90" size="lg">
                    {loading ? "가입 중..." : "회원가입"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

