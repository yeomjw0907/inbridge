"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Star } from "lucide-react"

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [campaign, setCampaign] = useState<any>(null)
  const [communication, setCommunication] = useState(0)
  const [performance, setPerformance] = useState(0)
  const [overall, setOverall] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const { data: campaignData } = await supabase
        .from("campaign_history")
        .select("*")
        .eq("id", id)
        .single()

      setCampaign(campaignData)
    }

    fetchData()
  }, [id, supabase])

  const handleSubmit = async () => {
    if (!communication || !performance || !overall) {
      toast({
        title: "모든 항목을 평가해주세요",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "로그인이 필요합니다",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("reviews").insert({
        campaign_id: id,
        reviewer_id: user.id,
        communication_rating: communication,
        performance_rating: performance,
        overall_rating: overall,
        comment: comment,
      })

      if (error) throw error

      toast({
        title: "리뷰가 작성되었습니다 ✅",
      })

      setTimeout(() => {
        router.push(`/campaign/${id}`)
      }, 2000)
    } catch (error: any) {
      toast({
        title: "오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({
    value,
    onChange,
  }: {
    value: number
    onChange: (value: number) => void
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value ? "fill-primary text-primary" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">리뷰 작성</h1>

          <Card>
            <CardHeader>
              <CardTitle>{campaign?.brand_name || "캠페인"} 리뷰</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">커뮤니케이션</Label>
                <StarRating value={communication} onChange={setCommunication} />
              </div>

              <div>
                <Label className="mb-2 block">성과</Label>
                <StarRating value={performance} onChange={setPerformance} />
              </div>

              <div>
                <Label className="mb-2 block">전체 만족도</Label>
                <StarRating value={overall} onChange={setOverall} />
              </div>

              <div>
                <Label htmlFor="comment" className="mb-2 block">
                  코멘트
                </Label>
                <Textarea
                  id="comment"
                  placeholder="리뷰를 작성해주세요"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                />
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
                {loading ? "저장 중..." : "리뷰 작성하기"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

