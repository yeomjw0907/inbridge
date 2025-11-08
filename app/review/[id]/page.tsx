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
        title: "Please rate all items",
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
          title: "Login required",
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
        title: "Review submitted ✅",
      })

      setTimeout(() => {
        router.push(`/campaign/${id}`)
      }, 2000)
    } catch (error: any) {
      toast({
        title: "An error occurred",
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
          <h1 className="text-3xl font-bold mb-8">Write Review</h1>

          <Card>
            <CardHeader>
              <CardTitle>{campaign?.brand_name || "Campaign"} Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Communication</Label>
                <StarRating value={communication} onChange={setCommunication} />
              </div>

              <div>
                <Label className="mb-2 block">Performance</Label>
                <StarRating value={performance} onChange={setPerformance} />
              </div>

              <div>
                <Label className="mb-2 block">Overall Satisfaction</Label>
                <StarRating value={overall} onChange={setOverall} />
              </div>

              <div>
                <Label htmlFor="comment" className="mb-2 block">
                  Comment
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Write your review"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                />
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
                {loading ? "Saving..." : "Submit Review"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

