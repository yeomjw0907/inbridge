"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, CheckCircle } from "lucide-react"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [contract, setContract] = useState<any>(null)
  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const { data: contractData } = await supabase
        .from("contracts")
        .select("*, proposals:proposal_id(*)")
        .eq("id", id)
        .single()

      setContract(contractData)
      setProposal(contractData?.proposals)
    }

    fetchData()
  }, [id, supabase])

  const handlePayment = async () => {
    setLoading(true)
    try {
      // 실제로는 Stripe Checkout으로 리다이렉트해야 함
      // 여기서는 시뮬레이션

      const { error: paymentError } = await supabase.from("payments").insert({
        contract_id: id,
        amount: proposal?.budget || 0,
        status: "paid",
      })

      if (paymentError) throw paymentError

      // 캠페인 활성화
      const { error: campaignError } = await supabase.from("campaign_history").insert({
        brand_id: proposal?.brand_id,
        influencer_id: proposal?.influencer_id,
        proposal_id: proposal?.id,
        brand_name: proposal?.brands?.company_name,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        budget: proposal?.budget,
        status: "ongoing",
      })

      if (campaignError) throw campaignError

      toast({
        title: "결제가 완료되었습니다 💰",
        description: "캠페인이 시작되었습니다",
      })

      setTimeout(() => {
        router.push(`/campaign/${proposal?.id}`)
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">결제</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>결제 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">캠페인명</p>
                <p className="text-lg font-semibold">
                  {proposal?.campaign_name || "캠페인명 없음"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">결제 금액</p>
                <p className="text-3xl font-bold text-primary">
                  {(proposal?.budget || 0).toLocaleString()}원
                </p>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">캠페인 비용</span>
                    <span>{(proposal?.budget || 0).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수수료</span>
                    <span>0원</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>총 결제 금액</span>
                    <span>{(proposal?.budget || 0).toLocaleString()}원</span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "결제 처리 중..." : "결제하기"}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  실제 결제는 Stripe를 통해 처리됩니다
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

