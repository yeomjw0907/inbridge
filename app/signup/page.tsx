"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Users, Building2, Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [role, setRole] = useState<"influencer" | "brand">("influencer")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // 인플루언서 폼 상태
  const [infName, setInfName] = useState("")
  const [infEmail, setInfEmail] = useState("")
  const [infPassword, setInfPassword] = useState("")
  const [infProfileImage, setInfProfileImage] = useState<File | null>(null)
  const [infLocation, setInfLocation] = useState("")
  const [infPlatforms, setInfPlatforms] = useState<string[]>([])
  const [infChannelUrl, setInfChannelUrl] = useState("")
  const [infFollowers, setInfFollowers] = useState("")
  const [infCategory, setInfCategory] = useState<string[]>([])
  const [infCollabType, setInfCollabType] = useState<string[]>([])
  const [infPricePerPost, setInfPricePerPost] = useState("")
  const [infBio, setInfBio] = useState("")

  // 브랜드 폼 상태
  const [brandManagerName, setBrandManagerName] = useState("")
  const [brandEmail, setBrandEmail] = useState("")
  const [brandPassword, setBrandPassword] = useState("")
  const [brandCompanyName, setBrandCompanyName] = useState("")
  const [brandWebsite, setBrandWebsite] = useState("")
  const [brandPhone, setBrandPhone] = useState("")
  const [brandIndustry, setBrandIndustry] = useState("")
  const [brandCampaignGoal, setBrandCampaignGoal] = useState<string[]>([])
  const [brandBudgetRange, setBrandBudgetRange] = useState("")
  const [brandPreferredPlatforms, setBrandPreferredPlatforms] = useState<string[]>([])

  const handlePlatformToggle = (platform: string, isInfluencer: boolean) => {
    if (isInfluencer) {
      setInfPlatforms((prev) =>
        prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
      )
    } else {
      setBrandPreferredPlatforms((prev) =>
        prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
      )
    }
  }

  const handleCategoryToggle = (category: string) => {
    setInfCategory((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const handleCollabTypeToggle = (type: string) => {
    setInfCollabType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleCampaignGoalToggle = (goal: string) => {
    setBrandCampaignGoal((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file)

      if (uploadError) {
        console.warn("Image upload error:", uploadError)
        return null
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.warn("Image upload error:", error)
      return null
    }
  }

  const signupInfluencer = async (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 필드 검증
    if (!infName || !infEmail || !infPassword || !infChannelUrl || !infFollowers) {
      toast({
        title: "필수 항목을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    if (infPlatforms.length === 0) {
      toast({
        title: "주요 플랫폼을 선택해주세요",
        variant: "destructive",
      })
      return
    }

    if (infCategory.length === 0) {
      toast({
        title: "주요 카테고리를 선택해주세요",
        variant: "destructive",
      })
      return
    }

    if (infCollabType.length === 0) {
      toast({
        title: "선호 협업 형태를 선택해주세요",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // 1. Supabase Auth에 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: infEmail,
        password: infPassword,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("사용자 생성 실패")

      // 2. 프로필 이미지 업로드
      let profileImageUrl: string | null = null
      if (infProfileImage) {
        profileImageUrl = await uploadProfileImage(infProfileImage)
      }

      // 3. profiles 테이블에 데이터 저장 (없으면 users + influencers 테이블 사용)
      try {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          role: "influencer",
          name: infName,
          email: infEmail,
          profile_image: profileImageUrl,
          location: infLocation || null,
          platforms: infPlatforms,
          channel_url: infChannelUrl,
          followers: parseInt(infFollowers) || 0,
          category: infCategory,
          collab_type: infCollabType,
          price_per_post: infPricePerPost ? parseFloat(infPricePerPost) : null,
          bio: infBio || null,
        })

        if (profileError) throw profileError
      } catch (profileError: any) {
        // profiles 테이블이 없으면 기존 테이블 구조 사용
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: infEmail,
          role: "influencer",
        })

        if (userError) throw userError

        const { error: influencerError } = await supabase.from("influencers").insert({
          user_id: authData.user.id,
          channel_name: infName,
          followers: parseInt(infFollowers) || 0,
          categories: infCategory,
          platforms: infPlatforms,
        })

        if (influencerError) throw influencerError
      }

      toast({
        title: "회원가입이 완료되었습니다 ✅",
        description: "인플루언서 대시보드로 이동합니다",
      })

      // 4. 리다이렉트
      router.push("/mypage")
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

  const signupBrand = async (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 필드 검증
    if (!brandManagerName || !brandEmail || !brandPassword || !brandCompanyName || !brandPhone || !brandIndustry) {
      toast({
        title: "필수 항목을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // 1. Supabase Auth에 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: brandEmail,
        password: brandPassword,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("사용자 생성 실패")

      // 2. profiles 테이블에 데이터 저장 (없으면 users + brands 테이블 사용)
      try {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          role: "brand",
          name: brandManagerName,
          email: brandEmail,
          company_name: brandCompanyName,
          website: brandWebsite || null,
          phone: brandPhone,
          industry: brandIndustry,
          campaign_goal: brandCampaignGoal.length > 0 ? brandCampaignGoal : null,
          budget_range: brandBudgetRange || null,
          preferred_platforms: brandPreferredPlatforms.length > 0 ? brandPreferredPlatforms : null,
        })

        if (profileError) throw profileError
      } catch (profileError: any) {
        // profiles 테이블이 없으면 기존 테이블 구조 사용
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: brandEmail,
          role: "brand",
        })

        if (userError) throw userError

        const { error: brandError } = await supabase.from("brands").insert({
          user_id: authData.user.id,
          company_name: brandCompanyName,
          contact_person: brandManagerName,
          website: brandWebsite || null,
        })

        if (brandError) throw brandError
      }

      toast({
        title: "회원가입이 완료되었습니다 ✅",
        description: "브랜드 대시보드로 이동합니다",
      })

      // 3. 리다이렉트
      router.push("/brand")
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
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <Card className="bg-white rounded-2xl shadow-sm border-gray-200">
            <CardHeader className="space-y-4">
              <div className="flex gap-2 border-b border-gray-200 pb-4">
                <button
                  onClick={() => setRole("influencer")}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    role === "influencer"
                      ? "text-primary border-b-2 border-primary font-bold"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  인플루언서
                </button>
                <button
                  onClick={() => setRole("brand")}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    role === "brand"
                      ? "text-primary border-b-2 border-primary font-bold"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-2" />
                  브랜드
                </button>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                {role === "influencer" ? "인플루언서 회원가입" : "브랜드 회원가입"}
              </CardTitle>
              <CardDescription className="text-center text-primary/80">
                {role === "influencer"
                  ? "새 계정을 만들어 시작하세요"
                  : "브랜드 계정을 만들어 시작하세요"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {role === "influencer" ? (
                <form onSubmit={signupInfluencer} className="space-y-4">
                  {/* 이름 */}
                  <div>
                    <Label htmlFor="inf-name" className="text-gray-900">
                      이름 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="inf-name"
                      placeholder="활동명 또는 실명"
                      value={infName}
                      onChange={(e) => setInfName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* 이메일 */}
                  <div>
                    <Label htmlFor="inf-email" className="text-gray-900">
                      이메일 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="inf-email"
                      type="email"
                      placeholder="example@email.com"
                      value={infEmail}
                      onChange={(e) => setInfEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* 비밀번호 */}
                  <div>
                    <Label htmlFor="inf-password" className="text-gray-900">
                      비밀번호 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="inf-password"
                      type="password"
                      placeholder="********"
                      value={infPassword}
                      onChange={(e) => setInfPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* 프로필 이미지 */}
                  <div>
                    <Label htmlFor="inf-image" className="text-gray-900">프로필 이미지</Label>
                    <Input
                      id="inf-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setInfProfileImage(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>

                  {/* 활동 지역 */}
                  <div>
                    <Label htmlFor="inf-location" className="text-gray-900">활동 지역</Label>
                    <Select value={infLocation} onValueChange={setInfLocation}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="서울 / 부산 / 해외 등" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="서울">서울</SelectItem>
                        <SelectItem value="부산">부산</SelectItem>
                        <SelectItem value="인천">인천</SelectItem>
                        <SelectItem value="대구">대구</SelectItem>
                        <SelectItem value="대전">대전</SelectItem>
                        <SelectItem value="광주">광주</SelectItem>
                        <SelectItem value="울산">울산</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                        <SelectItem value="해외">해외</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 주요 플랫폼 */}
                  <div>
                    <Label className="text-gray-900">
                      주요 플랫폼 <span className="text-primary">*</span>
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Instagram", "YouTube", "TikTok"].map((platform) => (
                        <Button
                          key={platform}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlatformToggle(platform.toLowerCase(), true)}
                          className={
                            infPlatforms.includes(platform.toLowerCase())
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                          }
                        >
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 채널 URL */}
                  <div>
                    <Label htmlFor="inf-channel-url" className="text-gray-900">
                      채널 URL <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="inf-channel-url"
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={infChannelUrl}
                      onChange={(e) => setInfChannelUrl(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* 팔로워 수 */}
                  <div>
                    <Label htmlFor="inf-followers" className="text-gray-900">
                      팔로워 수 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="inf-followers"
                      type="number"
                      placeholder="예: 12500"
                      value={infFollowers}
                      onChange={(e) => setInfFollowers(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* 주요 카테고리 */}
                  <div>
                    <Label className="text-gray-900">
                      주요 카테고리 <span className="text-primary">*</span>
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["뷰티", "패션", "헬스", "푸드", "여행", "IT"].map((category) => (
                        <Button
                          key={category}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCategoryToggle(category)}
                          className={
                            infCategory.includes(category)
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                          }
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 선호 협업 형태 */}
                  <div>
                    <Label className="text-gray-900">
                      선호 협업 형태 <span className="text-primary">*</span>
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["리뷰", "체험단", "유료 광고", "공동 캠페인"].map((type) => (
                        <Button
                          key={type}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCollabTypeToggle(type)}
                          className={
                            infCollabType.includes(type)
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                          }
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 1회 포스팅 단가 */}
                  <div>
                    <Label htmlFor="inf-price" className="text-gray-900">1회 포스팅 단가</Label>
                    <Input
                      id="inf-price"
                      type="number"
                      placeholder="예: 200000"
                      value={infPricePerPost}
                      onChange={(e) => setInfPricePerPost(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* 간단 소개 */}
                  <div>
                    <Label htmlFor="inf-bio" className="text-gray-900">간단 소개</Label>
                    <Textarea
                      id="inf-bio"
                      placeholder="나를 소개해주세요"
                      value={infBio}
                      onChange={(e) => setInfBio(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0066FF] hover:bg-[#0055DD] text-white rounded-xl font-medium mt-6 sticky bottom-4 md:static"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        가입 중...
                      </>
                    ) : (
                      "가입하기"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={signupBrand} className="space-y-4">
                  {/* 담당자 이름 */}
                  <div>
                    <Label htmlFor="brand-manager-name" className="text-gray-900">
                      담당자 이름 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="brand-manager-name"
                      placeholder="홍길동"
                      value={brandManagerName}
                      onChange={(e) => setBrandManagerName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* 이메일 */}
                  <div>
                    <Label htmlFor="brand-email" className="text-gray-900">
                      이메일 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="brand-email"
                      type="email"
                      placeholder="example@brand.com"
                      value={brandEmail}
                      onChange={(e) => setBrandEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* 비밀번호 */}
                  <div>
                    <Label htmlFor="brand-password" className="text-gray-900">
                      비밀번호 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="brand-password"
                      type="password"
                      placeholder="********"
                      value={brandPassword}
                      onChange={(e) => setBrandPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* 회사명 */}
                  <div>
                    <Label htmlFor="brand-company-name" className="text-gray-900">
                      회사명 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="brand-company-name"
                      placeholder="인브릿지 주식회사"
                      value={brandCompanyName}
                      onChange={(e) => setBrandCompanyName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* 웹사이트 */}
                  <div>
                    <Label htmlFor="brand-website" className="text-gray-900">웹사이트</Label>
                    <Input
                      id="brand-website"
                      type="url"
                      placeholder="https://brand.com"
                      value={brandWebsite}
                      onChange={(e) => setBrandWebsite(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* 연락처 */}
                  <div>
                    <Label htmlFor="brand-phone" className="text-gray-900">
                      연락처 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="brand-phone"
                      placeholder="010-0000-0000"
                      value={brandPhone}
                      onChange={(e) => setBrandPhone(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* 업종 카테고리 */}
                  <div>
                    <Label htmlFor="brand-industry" className="text-gray-900">
                      업종 카테고리 <span className="text-primary">*</span>
                    </Label>
                    <Select value={brandIndustry} onValueChange={setBrandIndustry}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="뷰티 / 패션 / IT / 식품 / 헬스 / 기타" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="뷰티">뷰티</SelectItem>
                        <SelectItem value="패션">패션</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="식품">식품</SelectItem>
                        <SelectItem value="헬스">헬스</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 캠페인 목표 */}
                  <div>
                    <Label className="text-gray-900">캠페인 목표</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["브랜드 인지도", "판매", "신규 유입"].map((goal) => (
                        <Button
                          key={goal}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCampaignGoalToggle(goal)}
                          className={
                            brandCampaignGoal.includes(goal)
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                          }
                        >
                          {goal}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 홍보 예산 범위 */}
                  <div>
                    <Label htmlFor="brand-budget" className="text-gray-900">홍보 예산 범위</Label>
                    <Select value={brandBudgetRange} onValueChange={setBrandBudgetRange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="50만 이하 / 50–200만 / 200만 이상" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50만 이하">50만 이하</SelectItem>
                        <SelectItem value="50–200만">50–200만</SelectItem>
                        <SelectItem value="200만 이상">200만 이상</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 선호 플랫폼 */}
                  <div>
                    <Label className="text-gray-900">선호 플랫폼</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Instagram", "YouTube", "TikTok"].map((platform) => (
                        <Button
                          key={platform}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlatformToggle(platform.toLowerCase(), false)}
                          className={
                            brandPreferredPlatforms.includes(platform.toLowerCase())
                              ? "bg-primary text-white border-primary hover:bg-primary/90"
                              : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                          }
                        >
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0066FF] hover:bg-[#0055DD] text-white rounded-xl font-medium mt-6 sticky bottom-4 md:static"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        가입 중...
                      </>
                    ) : (
                      "가입하기"
                    )}
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

