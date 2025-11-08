"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { motion } from "framer-motion"
import { FileText } from "lucide-react"

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false })

      // 더미 데이터 (Supabase에 데이터가 없을 때)
      const dummyPosts = [
        {
          id: "1",
          title: "2024년 인플루언서 마케팅 트렌드",
          summary: "올해 주목해야 할 인플루언서 마케팅 트렌드와 전략을 알아봅니다.",
          content: "<p>2024년 인플루언서 마케팅은 더욱 개인화되고 진정성 있는 콘텐츠를 중심으로 발전하고 있습니다. 단순한 제품 홍보를 넘어 브랜드와 인플루언서 간의 진정한 파트너십이 중요해지고 있습니다.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          title: "효과적인 인플루언서 캠페인 기획하기",
          summary: "성공적인 인플루언서 캠페인을 위한 기획 단계별 가이드입니다.",
          content: "<p>인플루언서 캠페인을 성공적으로 진행하기 위해서는 철저한 기획이 필수입니다. 목표 설정, 타겟 오디언스 분석, 적합한 인플루언서 선정까지 단계별로 알아봅니다.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          title: "인플루언서 ROI 측정 방법",
          summary: "인플루언서 마케팅의 투자 대비 효과를 정확히 측정하는 방법을 소개합니다.",
          content: "<p>인플루언서 마케팅의 ROI를 측정하는 것은 쉽지 않습니다. 도달수, 참여율, 전환율 등 다양한 지표를 종합적으로 분석하는 방법을 알아봅니다.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          title: "소셜미디어 플랫폼별 인플루언서 전략",
          summary: "Instagram, YouTube, TikTok 등 플랫폼별 특화된 인플루언서 마케팅 전략을 다룹니다.",
          content: "<p>각 소셜미디어 플랫폼마다 고유한 특성과 사용자 행동 패턴이 있습니다. 플랫폼별로 최적화된 인플루언서 마케팅 전략을 수립하는 것이 중요합니다.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "5",
          title: "마이크로 인플루언서의 힘",
          summary: "팔로워 수보다 참여율이 중요한 시대, 마이크로 인플루언서의 가치를 알아봅니다.",
          content: "<p>마이크로 인플루언서는 적은 팔로워 수에도 불구하고 높은 참여율과 신뢰도를 보여줍니다. 비용 대비 효과가 뛰어난 마이크로 인플루언서 마케팅의 장점을 살펴봅니다.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "6",
          title: "인플루언서와의 협업 계약 가이드",
          summary: "인플루언서와의 협업 시 체결해야 할 계약서 항목과 주의사항을 정리했습니다.",
          content: "<p>인플루언서와의 협업 계약 시 명확한 계약 조건과 지적재산권, 콘텐츠 사용 권한 등을 명시하는 것이 중요합니다. 계약서 작성 시 주의해야 할 사항들을 알아봅니다.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      setPosts(data && data.length > 0 ? data : dummyPosts)
    }

    fetchPosts()
  }, [supabase])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">블로그</h1>
            <p className="text-gray-600">
              인플루언서 마케팅에 대한 최신 정보와 인사이트를 확인하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {post.summary || post.content?.substring(0, 100)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        {formatDate(post.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {posts.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center text-gray-500">
                아직 게시글이 없습니다
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

