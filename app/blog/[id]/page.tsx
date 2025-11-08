"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

export default function BlogPostPage() {
  const params = useParams()
  const id = params.id as string
  const [post, setPost] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        let postData = null
        try {
          const { data, error } = await supabase
            .from("blogs")
            .select("*")
            .eq("id", id)
            .single()
          
          if (!error && data) {
            postData = data
          }
        } catch (supabaseError) {
          console.warn("Supabase query error:", supabaseError)
          // 에러가 발생해도 계속 진행 (더미 데이터 사용)
        }

        // 더미 데이터 (Supabase에 데이터가 없을 때)
        if (!postData) {
          const dummyPosts: any = {
            "1": {
              id: "1",
              title: "2024년 인플루언서 마케팅 트렌드",
              summary: "올해 주목해야 할 인플루언서 마케팅 트렌드와 전략을 알아봅니다.",
              content: "<p>2024년 인플루언서 마케팅은 더욱 개인화되고 진정성 있는 콘텐츠를 중심으로 발전하고 있습니다. 단순한 제품 홍보를 넘어 브랜드와 인플루언서 간의 진정한 파트너십이 중요해지고 있습니다.</p><p>최근 트렌드를 보면, 마이크로 인플루언서와 나노 인플루언서에 대한 관심이 높아지고 있습니다. 이들은 적은 팔로워 수에도 불구하고 높은 참여율과 신뢰도를 보여주며, 비용 대비 효과가 뛰어납니다.</p><p>또한, 단기적인 캠페인보다는 장기적인 파트너십을 구축하는 것이 중요해지고 있습니다. 브랜드와 인플루언서가 함께 성장하는 관계를 만들어가는 것이 핵심입니다.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            "2": {
              id: "2",
              title: "효과적인 인플루언서 캠페인 기획하기",
              summary: "성공적인 인플루언서 캠페인을 위한 기획 단계별 가이드입니다.",
              content: "<p>인플루언서 캠페인을 성공적으로 진행하기 위해서는 철저한 기획이 필수입니다. 목표 설정, 타겟 오디언스 분석, 적합한 인플루언서 선정까지 단계별로 알아봅니다.</p><p>먼저 캠페인의 목표를 명확히 설정해야 합니다. 브랜드 인지도 향상, 제품 판매 증대, 타겟 고객 확보 등 구체적인 목표를 정하는 것이 중요합니다.</p><p>다음으로 타겟 오디언스를 분석하고, 그들에게 어필할 수 있는 인플루언서를 선정해야 합니다. 인플루언서의 팔로워 구성, 참여율, 콘텐츠 톤앤매너 등을 종합적으로 고려해야 합니다.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
            "3": {
              id: "3",
              title: "인플루언서 ROI 측정 방법",
              summary: "인플루언서 마케팅의 투자 대비 효과를 정확히 측정하는 방법을 소개합니다.",
              content: "<p>인플루언서 마케팅의 ROI를 측정하는 것은 쉽지 않습니다. 도달수, 참여율, 전환율 등 다양한 지표를 종합적으로 분석하는 방법을 알아봅니다.</p><p>ROI 측정을 위해서는 먼저 캠페인 전후의 지표를 비교해야 합니다. 웹사이트 트래픽, 소셜미디어 팔로워 증가, 제품 판매량 등을 추적하는 것이 중요합니다.</p><p>또한, 인플루언서별로 고유한 추적 코드를 제공하여 각 인플루언서의 기여도를 정확히 측정할 수 있습니다. 이를 통해 효과적인 인플루언서를 식별하고 향후 캠페인에 활용할 수 있습니다.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            },
            "4": {
              id: "4",
              title: "소셜미디어 플랫폼별 인플루언서 전략",
              summary: "Instagram, YouTube, TikTok 등 플랫폼별 특화된 인플루언서 마케팅 전략을 다룹니다.",
              content: "<p>각 소셜미디어 플랫폼마다 고유한 특성과 사용자 행동 패턴이 있습니다. 플랫폼별로 최적화된 인플루언서 마케팅 전략을 수립하는 것이 중요합니다.</p><p>Instagram은 시각적 콘텐츠가 강점이며, 스토리와 릴스를 활용한 단기 캠페인에 적합합니다. YouTube는 긴 형식의 콘텐츠를 통해 제품을 깊이 있게 소개할 수 있습니다.</p><p>TikTok은 젊은 세대를 타겟으로 한 짧고 재미있는 콘텐츠가 효과적입니다. 각 플랫폼의 특성을 이해하고 그에 맞는 콘텐츠 전략을 수립해야 합니다.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            },
            "5": {
              id: "5",
              title: "마이크로 인플루언서의 힘",
              summary: "팔로워 수보다 참여율이 중요한 시대, 마이크로 인플루언서의 가치를 알아봅니다.",
              content: "<p>마이크로 인플루언서는 적은 팔로워 수에도 불구하고 높은 참여율과 신뢰도를 보여줍니다. 비용 대비 효과가 뛰어난 마이크로 인플루언서 마케팅의 장점을 살펴봅니다.</p><p>마이크로 인플루언서는 보통 1만 명에서 10만 명 사이의 팔로워를 가지고 있으며, 그들의 팔로워들과 더 밀접한 관계를 맺고 있습니다. 이로 인해 더 높은 참여율과 전환율을 보여줍니다.</p><p>또한, 마이크로 인플루언서와의 협업 비용이 상대적으로 낮아 여러 명의 인플루언서와 동시에 캠페인을 진행할 수 있습니다. 이를 통해 더 넓은 타겟 오디언스에 도달할 수 있습니다.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            },
            "6": {
              id: "6",
              title: "인플루언서와의 협업 계약 가이드",
              summary: "인플루언서와의 협업 시 체결해야 할 계약서 항목과 주의사항을 정리했습니다.",
              content: "<p>인플루언서와의 협업 계약 시 명확한 계약 조건과 지적재산권, 콘텐츠 사용 권한 등을 명시하는 것이 중요합니다. 계약서 작성 시 주의해야 할 사항들을 알아봅니다.</p><p>계약서에는 캠페인 기간, 콘텐츠 형식, 게시 일정, 보수 지급 조건 등이 명확히 명시되어야 합니다. 또한, 콘텐츠의 지적재산권과 재사용 권한에 대해서도 합의해야 합니다.</p><p>또한, FTC 가이드라인을 준수하여 스폰서십을 명시하는 것도 중요합니다. 투명한 협업을 통해 브랜드와 인플루언서 모두의 신뢰를 구축할 수 있습니다.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
            },
          }
          setPost(dummyPosts[id] || null)
        } else {
          setPost(postData)
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        // 에러 발생 시 더미 데이터 사용
        const dummyPosts: any = {
          "1": {
            id: "1",
            title: "2024년 인플루언서 마케팅 트렌드",
            summary: "올해 주목해야 할 인플루언서 마케팅 트렌드와 전략을 알아봅니다.",
            content: "<p>2024년 인플루언서 마케팅은 더욱 개인화되고 진정성 있는 콘텐츠를 중심으로 발전하고 있습니다.</p>",
            author_id: "admin",
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        }
        setPost(dummyPosts[id] || null)
      }
    }

    fetchPost()
  }, [id, supabase])

  if (!post) {
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
        <div className="max-w-4xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로
            </Button>
          </Link>

          <Card>
            <CardContent className="p-8">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <p className="text-gray-500 mb-8">{formatDate(post.created_at)}</p>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

