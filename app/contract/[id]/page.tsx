"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { generateContract } from "@/lib/openai"
import { useToast } from "@/hooks/use-toast"
import { FileText, CheckCircle } from "lucide-react"

export default function ContractPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [contract, setContract] = useState<any>(null)
  const [proposal, setProposal] = useState<any>(null)
  const [contractContent, setContractContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [signedByBrand, setSignedByBrand] = useState(false)
  const [signedByInfluencer, setSignedByInfluencer] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const { data: proposalData } = await supabase
        .from("proposals")
        .select("*, brands:brand_id(*), influencers:influencer_id(*)")
        .eq("id", id)
        .single()

      setProposal(proposalData)

      const { data: contractData } = await supabase
        .from("contracts")
        .select("*")
        .eq("proposal_id", id)
        .single()

      if (contractData) {
        setContract(contractData)
        setContractContent(contractData.content || "")
        setSignedByBrand(contractData.signed_by_brand)
        setSignedByInfluencer(contractData.signed_by_influencer)
      } else if (proposalData) {
        // 계약서 생성
        setLoading(true)
        try {
          const content = await generateContract({
            brandName: proposalData.brands?.company_name || "브랜드",
            influencerName: proposalData.influencers?.channel_name || "인플루언서",
            budget: proposalData.budget,
            duration: proposalData.schedule,
            deliverables: [],
          })

          setContractContent(content || "")

          const { data: newContract } = await supabase
            .from("contracts")
            .insert({
              proposal_id: id,
              content: content,
              status: "pending",
            })
            .select()
            .single()

          setContract(newContract)
        } catch (error) {
          console.error("Error generating contract:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [id, supabase])

  const handleSign = async () => {
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

    const isBrand = user.id === proposal?.brand_id
    const updateData = isBrand
      ? { signed_by_brand: true }
      : { signed_by_influencer: true }

    const { error } = await supabase
      .from("contracts")
      .update(updateData)
      .eq("id", contract.id)

    if (error) {
      toast({
        title: "오류가 발생했습니다",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    if (isBrand) {
      setSignedByBrand(true)
    } else {
      setSignedByInfluencer(true)
    }

    // 둘 다 서명했으면 상태 업데이트
    if ((isBrand && signedByInfluencer) || (!isBrand && signedByBrand)) {
      await supabase
        .from("contracts")
        .update({ status: "signed" })
        .eq("id", contract.id)

      toast({
        title: "계약서가 완료되었습니다 ✅",
        description: "결제 페이지로 이동합니다",
      })

      setTimeout(() => {
        router.push(`/payment/${contract.id}`)
      }, 2000)
    } else {
      toast({
        title: "서명이 완료되었습니다",
        description: "상대방의 서명을 기다려주세요",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>계약서 생성 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">계약서</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>계약서 내용</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none mb-6">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-6 rounded-lg">
                  {contractContent || "계약서 내용을 생성하는 중..."}
                </pre>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">브랜드 서명</p>
                    <p className="text-sm text-gray-600">
                      {proposal?.brands?.company_name || "브랜드"}
                    </p>
                  </div>
                  {signedByBrand ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Button onClick={handleSign}>서명하기</Button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">인플루언서 서명</p>
                    <p className="text-sm text-gray-600">
                      {proposal?.influencers?.channel_name || "인플루언서"}
                    </p>
                  </div>
                  {signedByInfluencer ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Button onClick={handleSign}>서명하기</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

