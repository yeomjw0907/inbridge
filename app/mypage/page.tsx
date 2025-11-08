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
import { Users, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react"

export default function MyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [influencer, setInfluencer] = useState<any>(null)
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

      // 인플루언서 정보 가져오기
      const { data: influencerData } = await supabase
        .from("influencers")
        .select("*")
        .eq("user_id", user.id)
        .single()

      setInfluencer(influencerData)

      // 제안 수신함 가져오기
      const { data: proposalsData } = await supabase
        .from("proposals")
        .select("*, brands:brand_id(*)")
        .eq("influencer_id", influencerData?.id)
        .order("created_at", { ascending: false })

      setProposals(proposalsData || [])

      // 진행 캠페인 가져오기
      const { data: campaignsData } = await supabase
        .from("campaign_history")
        .select("*")
        .eq("influencer_id", influencerData?.id)
        .order("created_at", { ascending: false })

      setCampaigns(campaignsData || [])
    }

    fetchData()
  }, [router, supabase])

  const handleProposalAction = async (proposalId: string, action: "accept" | "reject") => {
    const { error } = await supabase
      .from("proposals")
      .update({ status: action === "accept" ? "accepted" : "rejected" })
      .eq("id", proposalId)

    if (error) {
      console.error("Error updating proposal:", error)
      return
    }

    // 제안 승인 시 채팅방 생성
    if (action === "accept") {
      const { data: proposal } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", proposalId)
        .single()

      if (proposal) {
        const { error: chatError } = await supabase.from("chat_rooms").insert({
          brand_id: proposal.brand_id,
          influencer_id: proposal.influencer_id,
          proposal_id: proposalId,
        })

        if (chatError) {
          console.error("Error creating chat room:", chatError)
        }
      }
    }

    // 데이터 다시 불러오기
    const { data: proposalsData } = await supabase
      .from("proposals")
      .select("*, brands:brand_id(*)")
      .eq("influencer_id", influencer?.id)
      .order("created_at", { ascending: false })

    setProposals(proposalsData || [])
  }

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
        <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">프로필 관리</TabsTrigger>
            <TabsTrigger value="proposals">제안 수신함</TabsTrigger>
            <TabsTrigger value="campaigns">진행 캠페인</TabsTrigger>
            <TabsTrigger value="insights">인사이트</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>프로필 관리</CardTitle>
                <CardDescription>SNS 연결 상태 및 프로필 정보를 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                {influencer ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">채널명</p>
                      <p className="text-lg font-semibold">
                        {influencer.channel_name || "미설정"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">팔로워 수</p>
                      <p className="text-lg font-semibold">
                        {formatNumber(influencer.followers || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">주요 카테고리</p>
                      <div className="flex flex-wrap gap-2">
                        {influencer.categories?.map((category: string) => (
                          <span
                            key={category}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {category}
                          </span>
                        )) || <p className="text-gray-500">카테고리가 없습니다</p>}
                      </div>
                    </div>
                    <Button>프로필 수정</Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-4">인플루언서 프로필이 없습니다</p>
                    <Button>프로필 생성하기</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals">
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {proposal.campaign_name || "캠페인명 없음"}
                        </CardTitle>
                        <CardDescription>
                          브랜드: {proposal.brands?.company_name || "알 수 없음"}
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
                    {proposal.message && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{proposal.message}</p>
                      </div>
                    )}
                    {proposal.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleProposalAction(proposal.id, "accept")}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          승인하기
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleProposalAction(proposal.id, "reject")}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          거절하기
                        </Button>
                      </div>
                    )}
                    {proposal.status === "accepted" && (
                      <Button
                        onClick={() => {
                          // 채팅방으로 이동
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
                    받은 제안이 없습니다
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
                        <CardTitle>{campaign.brand_name || "브랜드명"}</CardTitle>
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
                          {campaign.budget?.toLocaleString() || 0}원
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

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>팔로워 수</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Users className="w-12 h-12 text-primary" />
                    <div>
                      <p className="text-3xl font-bold">
                        {formatNumber(influencer?.followers || 0)}
                      </p>
                      <p className="text-sm text-gray-600">전체 팔로워</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>평균 참여율</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <TrendingUp className="w-12 h-12 text-primary" />
                    <div>
                      <p className="text-3xl font-bold">
                        {influencer?.engagement_rate || 0}%
                      </p>
                      <p className="text-sm text-gray-600">평균 참여율</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

