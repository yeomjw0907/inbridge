"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateInfluencerRecommendations } from "@/lib/openai"
import { createClient } from "@/lib/supabase/client"
import { formatNumber } from "@/lib/utils"
import { motion } from "framer-motion"
import { Search, Users, TrendingUp, Star, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [productInput, setProductInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [influencers, setInfluencers] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // 키워드 추출 함수
  const extractKeywords = (text: string): { categories: string[]; platforms: string[] } => {
    const categoryKeywords: { [key: string]: string[] } = {
      뷰티: ["뷰티", "화장품", "메이크업", "스킨케어", "코스메틱", "립스틱", "파운데이션", "아이섀도", "마스카라", "블러셔", "하이라이터", "컨실러", "프라이머", "세럼", "토너", "에센스", "크림", "로션", "선크림", "미용", "화장", "뷰티제품", "뷰티아이템"],
      패션: ["패션", "의류", "옷", "스타일", "코디", "옷차림", "패션아이템", "의상", "상의", "하의", "원피스", "치마", "바지", "셔츠", "티셔츠", "재킷", "코트", "신발", "구두", "운동화", "가방", "핸드백", "액세서리", "시계", "귀걸이", "목걸이", "반지"],
      맛집: ["맛집", "음식", "식당", "레스토랑", "카페", "맛", "요리", "식사", "식품", "음료", "음료수", "커피", "차", "술", "와인", "맥주", "소주", "전통주", "디저트", "케이크", "빵", "베이커리", "제과", "제빵"],
      여행: ["여행", "관광", "휴가", "여행지", "여행상품", "여행패키지", "호텔", "리조트", "펜션", "게스트하우스", "숙박", "항공", "비행기", "기차", "버스", "렌터카", "여권", "비자", "해외여행", "국내여행"],
      기술: ["기술", "테크", "전자제품", "가전", "스마트폰", "폰", "휴대폰", "아이폰", "갤럭시", "태블릿", "노트북", "컴퓨터", "pc", "데스크톱", "모니터", "키보드", "마우스", "이어폰", "헤드폰", "스피커", "카메라", "드론", "스마트워치", "웨어러블", "가전제품", "냉장고", "세탁기", "청소기", "에어컨", "히터", "전기밥솥", "믹서", "커피머신"],
      건강: ["건강", "피트니스", "운동", "다이어트", "헬스", "요가", "필라테스", "러닝", "조깅", "걷기", "등산", "수영", "자전거", "보디빌딩", "크로스핏", "보충제", "단백질", "비타민", "영양제", "건강식품", "유기농", "무농약"],
      인테리어: ["인테리어", "홈", "집", "데코", "가구", "침대", "소파", "의자", "책상", "책장", "수납", "장식", "조명", "램프", "전등", "커튼", "블라인드", "카펫", "러그", "벽지", "바닥재", "타일", "욕실", "주방", "리모델링", "신축", "이사"],
      라이프스타일: ["라이프스타일", "일상", "생활", "생활용품", "생활잡화", "욕실용품", "주방용품", "청소용품", "세제", "세탁세제", "섬유유연제", "화장지", "물티슈", "휴지", "수건", "타월"],
    }

    const platformKeywords: { [key: string]: string[] } = {
      youtube: ["유튜브", "유튜버", "youtube", "yt", "유튜브채널", "유튜브크리에이터", "유튜브인플루언서"],
      instagram: ["인스타그램", "인스타", "instagram", "ig", "인스타그램인플루언서", "인스타크리에이터", "인플루언서"],
      tiktok: ["틱톡", "tiktok", "틱톡커", "틱톡크리에이터", "틱톡인플루언서"],
      facebook: ["페이스북", "facebook", "fb", "페이스북페이지", "페이스북인플루언서"],
    }

    const textLower = text.toLowerCase()
    const categories: string[] = []
    const platforms: string[] = []

    // 카테고리 추출
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      if (keywords.some((keyword) => textLower.includes(keyword.toLowerCase()))) {
        if (!categories.includes(category)) {
          categories.push(category)
        }
      }
    })

    // 플랫폼 추출
    Object.entries(platformKeywords).forEach(([platform, keywords]) => {
      if (keywords.some((keyword) => textLower.includes(keyword.toLowerCase()))) {
        if (!platforms.includes(platform)) {
          platforms.push(platform)
        }
      }
    })

    return { categories, platforms }
  }

  const handleSearch = async () => {
    if (!productInput.trim()) {
      toast({
        title: "검색어를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // 키워드 추출
      const { categories, platforms } = extractKeywords(productInput)

      // AI 추천 받기 (API 키가 없으면 스킵)
      try {
        await generateInfluencerRecommendations(productInput)
      } catch (aiError: any) {
        console.warn("AI recommendation skipped:", aiError.message)
      }
      
      // Supabase에서 인플루언서 데이터 가져오기
      let data = null
      try {
        const { data: supabaseData, error } = await supabase
          .from("influencers")
          .select("*")
          .limit(12)
          .order("followers", { ascending: false })
        
        if (!error) {
          data = supabaseData
        }
      } catch (supabaseError) {
        console.warn("Supabase query error:", supabaseError)
        // 에러가 발생해도 계속 진행 (더미 데이터 사용)
      }

      // 더미 데이터와 병합 (Supabase에 데이터가 없을 때)
      const dummyData = [
        {
          id: "1",
          channel_name: "뷰티크리에이터",
          followers: 250000,
          engagement_rate: 4.5,
          rating: 4.8,
          categories: ["뷰티", "라이프스타일"],
          platforms: ["instagram", "youtube"],
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          channel_name: "맛집탐방러",
          followers: 180000,
          engagement_rate: 5.2,
          rating: 4.9,
          categories: ["맛집", "여행"],
          platforms: ["instagram", "tiktok"],
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          channel_name: "패션스타일리스트",
          followers: 320000,
          engagement_rate: 3.8,
          rating: 4.7,
          categories: ["패션", "라이프스타일"],
          platforms: ["instagram", "youtube"],
          created_at: new Date().toISOString(),
        },
        {
          id: "4",
          channel_name: "여행블로거",
          followers: 150000,
          engagement_rate: 6.1,
          rating: 4.9,
          categories: ["여행", "맛집"],
          platforms: ["instagram", "youtube", "tiktok"],
          created_at: new Date().toISOString(),
        },
        {
          id: "5",
          channel_name: "테크리뷰어",
          followers: 420000,
          engagement_rate: 3.2,
          rating: 4.6,
          categories: ["기술", "리뷰"],
          platforms: ["youtube"],
          created_at: new Date().toISOString(),
        },
        {
          id: "6",
          channel_name: "피트니스코치",
          followers: 280000,
          engagement_rate: 4.8,
          rating: 4.8,
          categories: ["건강", "라이프스타일"],
          platforms: ["instagram", "youtube"],
          created_at: new Date().toISOString(),
        },
        {
          id: "7",
          channel_name: "홈데코인플루언서",
          followers: 190000,
          engagement_rate: 5.5,
          rating: 4.9,
          categories: ["인테리어", "라이프스타일"],
          platforms: ["instagram"],
          created_at: new Date().toISOString(),
        },
        {
          id: "8",
          channel_name: "뷰티튜터",
          followers: 350000,
          engagement_rate: 4.2,
          rating: 4.7,
          categories: ["뷰티", "튜토리얼"],
          platforms: ["youtube", "instagram"],
          created_at: new Date().toISOString(),
        },
      ]

      // 필터링된 더미 데이터
      let filteredData = dummyData
      if (categories.length > 0 || platforms.length > 0) {
        filteredData = dummyData.filter((inf) => {
          const hasCategory =
            categories.length === 0 ||
            categories.some((cat) => inf.categories?.includes(cat))
          const hasPlatform =
            platforms.length === 0 ||
            platforms.some((plat) => inf.platforms?.includes(plat))
          return hasCategory && hasPlatform
        })
      }

      const finalData = (data && data.length > 0 ? data : filteredData).slice(0, 12)
      setInfluencers(finalData)

      // 검색 결과를 표시하기 위해 스크롤
      setTimeout(() => {
        const resultsSection = document.getElementById("search-results")
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    } catch (error) {
      console.error("Error fetching influencers:", error)
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-medium text-gray-900">인플루언서를 검색하고 있습니다...</p>
            <p className="text-sm text-primary/80">잠시만 기다려주세요</p>
          </motion.div>
        </div>
      )}
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h1 className="text-5xl font-bold text-gray-900">
              내 브랜드에 딱 맞는
              <br />
              <span className="text-primary">인플루언서를 찾아드립니다</span>
            </h1>
            <p className="text-xl text-primary/80">
            브랜드와 어울리는 인플루언서를 쉽고 빠르게 연결해드립니다
            </p>

            {/* 프롬프트 입력 영역 */}
            <div className="max-w-2xl mx-auto mt-8 space-y-4">
              <div className="flex gap-3 items-center bg-white rounded-2xl px-4 py-3 border border-primary/30">
                <input
                  type="text"
                  placeholder="예: 화장품 신제품 출시로 유튜버 섭외 필요함"
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 h-auto text-base bg-white border-0 text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10 flex-shrink-0"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
              
              {/* 프롬프트 제안 목록 */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "뷰티 제품",
                  "패션 브랜드",
                  "맛집 홍보",
                  "여행 상품",
                  "기술 제품",
                  "라이프스타일",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setProductInput(prompt)}
                    className="px-4 py-2 text-sm text-primary/80 bg-white border border-gray-200 rounded-full hover:bg-primary/5 hover:border-primary transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* 검색 결과 섹션 */}
        {influencers.length > 0 && (
          <section id="search-results" className="container mx-auto px-6 py-16">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  추천 인플루언서
                </h2>
                <p className="text-primary/80">
                  검색 결과 {influencers.length}명의 인플루언서를 찾았습니다
                </p>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {influencers.map((influencer, index) => (
                  <motion.div
                    key={influencer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-all duration-200 h-full flex flex-col border-gray-200 bg-white rounded-2xl overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Users className="w-7 h-7 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold truncate mb-1 text-gray-900">
                              {influencer.channel_name || "채널명"}
                            </CardTitle>
                            <CardDescription className="text-sm text-primary/70 truncate">
                              {formatNumber(influencer.followers || 0)} 팔로워
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col pt-0">
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-primary/60" />
                            <span className="text-primary/80">참여율 {influencer.engagement_rate || 0}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 text-primary/60" />
                            <span className="text-primary/80">평점 {influencer.rating || 0}</span>
                          </div>
                        </div>
                        {influencer.categories && influencer.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {influencer.categories.slice(0, 2).map((category: string) => (
                              <span
                                key={category}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-4 border-t border-gray-100">
                          <Link href={`/influencer/${influencer.id}`} className="flex-1">
                            <Button variant="ghost" className="w-full text-primary hover:bg-primary/5 hover:text-primary">
                              상세보기
                            </Button>
                          </Link>
                          <Button className="flex-1 bg-primary hover:bg-primary/90 text-white">Contact</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="container mx-auto px-6 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              inbridge.ai의 특징
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Sparkles className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>AI 기반 추천</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary/80">
                    제품 정보를 입력하면 AI가 최적의 인플루언서를 추천합니다
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>원스톱 플랫폼</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary/80">
                    제안부터 채팅, 계약, 결제까지 모든 과정을 한 곳에서 처리합니다
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>성과 분석</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary/80">
                    캠페인 성과를 실시간으로 분석하고 AI 리포트를 제공합니다
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
