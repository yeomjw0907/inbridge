"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { formatNumber, formatDate } from "@/lib/utils"
import { Building2, FileText, TrendingUp } from "lucide-react"

export default function BrandPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [brand, setBrand] = useState<any>(null)
  const [proposals, setProposals] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      setUser(user)

      // 브랜드 정보 가져오기
      const { data: brandData } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", user.id)
        .single()

      setBrand(brandData)

      // 보낸 제안 가져오기
      const { data: proposalsData } = await supabase
        .from("proposals")
        .select("*, influencers:influencer_id(*)")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false })

      setProposals(proposalsData || [])

      // 진행 캠페인 가져오기
      const { data: campaignsData } = await supabase
        .from("campaign_history")
        .select("*")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false })

      setCampaigns(campaignsData || [])
    }

    fetchData()
  }, [router, supabase])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">브랜드 대시보드</h1>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="proposals">제안 관리</TabsTrigger>
            <TabsTrigger value="campaigns">캠페인</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>보낸 제안</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{proposals.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>진행 중인 캠페인</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {campaigns.filter((c) => c.status === "ongoing").length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>완료된 캠페인</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {campaigns.filter((c) => c.status === "completed").length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="proposals">
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{proposal.campaign_name || "캠페인명 없음"}</CardTitle>
                        <CardDescription>
                          {proposal.influencers?.channel_name || "인플루언서"}
                        </CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          proposal.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : proposal.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {proposal.status === "accepted"
                          ? "승인됨"
                          : proposal.status === "rejected"
                          ? "거절됨"
                          : "대기중"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">예산</p>
                        <p className="text-lg font-semibold">
                          {proposal.budget?.toLocaleString() || 0}원
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">일정</p>
                        <p className="text-lg font-semibold">{proposal.schedule || "미정"}</p>
                      </div>
                    </div>
                    {proposal.status === "accepted" && (
                      <Button
                        onClick={() => {
                          router.push(`/chat/${proposal.id}`)
                        }}
                        className="w-full"
                      >
                        채팅하기
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              {proposals.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    보낸 제안이 없습니다
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{campaign.brand_name || "캠페인"}</CardTitle>
                        <CardDescription>
                          {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                        </CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          campaign.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "ongoing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {campaign.status === "completed"
                          ? "완료"
                          : campaign.status === "ongoing"
                          ? "진행중"
                          : "검토중"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">도달수</p>
                        <p className="text-lg font-semibold">
                          {formatNumber(campaign.reach || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">참여율</p>
                        <p className="text-lg font-semibold">
                          {campaign.engagement_rate || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">예산</p>
                        <p className="text-lg font-semibold">
                          {(campaign.budget || 0).toLocaleString()}원
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/campaign/${campaign.id}`)}
                    >
                      상세보기
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {campaigns.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    진행 중인 캠페인이 없습니다
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

