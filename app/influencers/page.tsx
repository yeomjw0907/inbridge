"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { createClient } from "@/lib/supabase/client"
import { formatNumber } from "@/lib/utils"
import { motion } from "framer-motion"
import { Users, TrendingUp, Star, Search, Filter } from "lucide-react"
import Link from "next/link"

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<any[]>([])
  const [filteredInfluencers, setFilteredInfluencers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [followerRange, setFollowerRange] = useState([0, 10000000])
  const [sortBy, setSortBy] = useState("popular")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // URL 파라미터에서 검색어와 필터 가져오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const q = params.get("q")
      const categories = params.get("categories")
      const platforms = params.get("platforms")

      if (q) setSearchQuery(q)
      if (categories) setSelectedCategories(categories.split(","))
      if (platforms) setSelectedPlatforms(platforms.split(","))
    }
  }, [])

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        let data = null
        try {
          const { data: supabaseData, error } = await supabase
            .from("influencers")
            .select("*")
            .order("followers", { ascending: false })
          
          if (!error && supabaseData) {
            data = supabaseData
          }
        } catch (supabaseError) {
          console.warn("Supabase query error:", supabaseError)
          // 에러가 발생해도 계속 진행 (더미 데이터 사용)
        }

        // 더미 데이터 (Supabase에 데이터가 없을 때)
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

        setInfluencers(data && data.length > 0 ? data : dummyData)
        setFilteredInfluencers(data && data.length > 0 ? data : dummyData)
      } catch (error) {
        console.error("Error fetching influencers:", error)
        // 에러 발생 시 더미 데이터 사용
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
        ]
        setInfluencers(dummyData)
        setFilteredInfluencers(dummyData)
      } finally {
        setLoading(false)
      }
    }

    fetchInfluencers()
  }, [supabase])

  useEffect(() => {
    let filtered = [...influencers]

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(
        (inf) =>
          inf.channel_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inf.categories?.some((cat: string) =>
            cat.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    }

    // 카테고리 필터 (복수 선택)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((inf) =>
        inf.categories?.some((cat: string) => selectedCategories.includes(cat))
      )
    }

    // 플랫폼 필터 (복수 선택)
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter((inf) =>
        inf.platforms?.some((plat: string) => selectedPlatforms.includes(plat))
      )
    }

    // 팔로워 수 필터
    filtered = filtered.filter(
      (inf) =>
        (inf.followers || 0) >= followerRange[0] &&
        (inf.followers || 0) <= followerRange[1]
    )

    // 정렬
    if (sortBy === "popular") {
      filtered.sort((a, b) => (b.followers || 0) - (a.followers || 0))
    } else if (sortBy === "recent") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      )
    } else if (sortBy === "engagement") {
      filtered.sort(
        (a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0)
      )
    }

    setFilteredInfluencers(filtered)
  }, [influencers, searchQuery, selectedCategories, selectedPlatforms, followerRange, sortBy])

  const maxFollowers = Math.max(
    ...influencers.map((inf) => inf.followers || 0),
    1000000
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">인플루언서 찾기</h1>

          {/* 검색 및 필터 섹션 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                필터
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 검색 */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="채널명 또는 카테고리로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="정렬" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">인기순</SelectItem>
                    <SelectItem value="recent">최신순</SelectItem>
                    <SelectItem value="engagement">참여율순</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 필터 옵션 */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">카테고리</label>
                  <div className="flex flex-wrap gap-2">
                    {["뷰티", "맛집", "여행", "패션", "라이프스타일", "기술", "건강", "인테리어"].map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedCategories.includes(cat)) {
                            setSelectedCategories(selectedCategories.filter((c) => c !== cat))
                          } else {
                            setSelectedCategories([...selectedCategories, cat])
                          }
                        }}
                        className={
                          selectedCategories.includes(cat)
                            ? "bg-primary text-white border-primary hover:bg-primary/90"
                            : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                        }
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">플랫폼</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "instagram", label: "Instagram" },
                      { value: "youtube", label: "YouTube" },
                      { value: "tiktok", label: "TikTok" },
                    ].map((plat) => (
                      <Button
                        key={plat.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedPlatforms.includes(plat.value)) {
                            setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat.value))
                          } else {
                            setSelectedPlatforms([...selectedPlatforms, plat.value])
                          }
                        }}
                        className={
                          selectedPlatforms.includes(plat.value)
                            ? "bg-primary text-white border-primary hover:bg-primary/90"
                            : "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                        }
                      >
                        {plat.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    팔로워 수: {formatNumber(followerRange[0])} - {formatNumber(followerRange[1])}
                  </label>
                  <Slider
                    value={followerRange}
                    onValueChange={setFollowerRange}
                    max={maxFollowers}
                    min={0}
                    step={10000}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결과 */}
          {loading ? (
            <div className="text-center py-12 text-primary/60">로딩 중...</div>
          ) : filteredInfluencers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-primary/60">
                검색 결과가 없습니다
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 text-sm text-primary/80">
                총 {filteredInfluencers.length}명의 인플루언서를 찾았습니다
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInfluencers.map((influencer, index) => (
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
                        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

