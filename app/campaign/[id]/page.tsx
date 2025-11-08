"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { formatNumber, formatDate } from "@/lib/utils"
import { TrendingUp, Users, Star, ArrowLeft, FileImage } from "lucide-react"

export default function CampaignPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [campaign, setCampaign] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: campaignData } = await supabase
          .from("campaign_history")
          .select("*")
          .eq("id", id)
          .single()

        // 더미 데이터 (Supabase에 데이터가 없을 때)
        if (!campaignData) {
          const dummyCampaigns: any = {
            "1": {
              id: "1",
              brand_name: "패션 브랜드 A",
              start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: "completed",
              reach: 150000,
              engagement_rate: 4.2,
              budget: 5000000,
              is_private: false,
              content_urls: [
                { url: "https://example.com/content1.jpg", is_private: false },
                { url: "https://example.com/content2.jpg", is_private: false },
                { url: "https://example.com/content3.jpg", is_private: true },
              ],
              ai_report: "이번 캠페인은 예상보다 높은 참여율을 보였습니다. 타겟 오디언스의 반응이 매우 긍정적이며, 브랜드 인지도 향상에 기여했습니다.",
            },
            "2": {
              id: "2",
              brand_name: "뷰티 브랜드 B",
              start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: "ongoing",
              reach: 200000,
              engagement_rate: 5.1,
              budget: 8000000,
              is_private: false,
              content_urls: [
                { url: "https://example.com/content4.jpg", is_private: false },
                { url: "https://example.com/content5.jpg", is_private: false },
              ],
              ai_report: "현재 진행 중인 캠페인으로, 초기 성과가 기대치를 상회하고 있습니다.",
            },
            "3": {
              id: "3",
              brand_name: "라이프스타일 브랜드 C",
              start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
              status: "private",
              reach: 0,
              engagement_rate: 0,
              budget: 6000000,
              is_private: true,
              content_urls: [
                { url: "https://example.com/content6.jpg", is_private: true },
                { url: "https://example.com/content7.jpg", is_private: true },
              ],
              ai_report: null,
            },
          }
          setCampaign(dummyCampaigns[id] || null)
        } else {
          setCampaign(campaignData)
        }
      } catch (error) {
        console.error("Error fetching campaign:", error)
        // 에러 발생 시 더미 데이터 사용
        const dummyCampaigns: any = {
          "1": {
            id: "1",
            brand_name: "패션 브랜드 A",
            start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "completed",
            reach: 150000,
            engagement_rate: 4.2,
            budget: 5000000,
            is_private: false,
            content_urls: [
              { url: "https://example.com/content1.jpg", is_private: false },
              { url: "https://example.com/content2.jpg", is_private: false },
              { url: "https://example.com/content3.jpg", is_private: true },
            ],
            ai_report: "이번 캠페인은 예상보다 높은 참여율을 보였습니다. 타겟 오디언스의 반응이 매우 긍정적이며, 브랜드 인지도 향상에 기여했습니다.",
          },
          "2": {
            id: "2",
            brand_name: "뷰티 브랜드 B",
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "ongoing",
            reach: 200000,
            engagement_rate: 5.1,
            budget: 8000000,
            is_private: false,
            content_urls: [
              { url: "https://example.com/content4.jpg", is_private: false },
              { url: "https://example.com/content5.jpg", is_private: false },
            ],
            ai_report: "현재 진행 중인 캠페인으로, 초기 성과가 기대치를 상회하고 있습니다.",
          },
          "3": {
            id: "3",
            brand_name: "라이프스타일 브랜드 C",
            start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
            status: "private",
            reach: 0,
            engagement_rate: 0,
            budget: 6000000,
            is_private: true,
            content_urls: [
              { url: "https://example.com/content6.jpg", is_private: true },
              { url: "https://example.com/content7.jpg", is_private: true },
            ],
            ai_report: null,
          },
        }
        setCampaign(dummyCampaigns[id] || null)
      }
    }

    fetchData()
  }, [id, supabase])

  if (!campaign) {
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-primary hover:bg-primary/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전
            </Button>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{campaign.brand_name || "캠페인"}</h1>
              <p className="text-primary/80">
                {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <CardTitle>도달수</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatNumber(campaign.reach || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle>참여율</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{campaign.engagement_rate || 0}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <CardTitle>예산</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(campaign.budget || 0).toLocaleString()}원
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>성과 그래프</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                그래프 영역 (Chart.js 구현 필요)
              </div>
            </CardContent>
          </Card>

          {/* 제작된 콘텐츠 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>제작된 콘텐츠</CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.content_urls && campaign.content_urls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaign.content_urls.map((content: any, index: number) => {
                    const isPrivate = content.is_private || campaign.is_private
                    return (
                      <div
                        key={index}
                        className={`relative aspect-video bg-gray-100 rounded-lg border border-gray-200 overflow-hidden ${
                          isPrivate ? "blur-sm" : ""
                        }`}
                      >
                        {isPrivate && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="text-center">
                              <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm font-semibold text-gray-700">비공개</p>
                            </div>
                          </div>
                        )}
                        <div className="w-full h-full flex items-center justify-center">
                          <FileImage className="w-12 h-12 text-gray-300" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-primary/60">
                  제작된 콘텐츠가 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {campaign.ai_report && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>AI 리포트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-primary/80 whitespace-pre-wrap">{campaign.ai_report}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {campaign.status === "completed" && (
            <div className="flex justify-end">
              <Button onClick={() => router.push(`/review/${campaign.id}`)} size="lg">
                리뷰 작성하기
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

