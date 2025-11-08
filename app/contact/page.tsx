"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, Globe } from "lucide-react"

export default function ContactPage() {
  const [budget, setBudget] = useState("")
  const [category, setCategory] = useState("")
  const [link, setLink] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!budget || !category || !contactPerson || !phone || !email || !message) {
      toast({
        title: "필수 항목을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from("contact_requests").insert({
        budget: parseInt(budget),
        category: category,
        link: link,
        contact_person: contactPerson,
        phone: phone,
        email: email,
        message: message,
      })

      if (error) throw error

      toast({
        title: "문의가 접수되었습니다 ✅",
        description: "빠른 시일 내에 답변드리겠습니다",
      })

      // 폼 초기화
      setBudget("")
      setCategory("")
      setLink("")
      setContactPerson("")
      setPhone("")
      setEmail("")
      setMessage("")
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
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">문의하기</h1>
            <p className="text-gray-600">
              궁금한 사항이 있으시면 언제든지 문의해주세요
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>문의 양식</CardTitle>
              <CardDescription>
                아래 양식을 작성해주시면 빠른 시일 내에 답변드리겠습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">캠페인 예산 *</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="예: 1000000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">구분 *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brand">브랜드</SelectItem>
                        <SelectItem value="influencer">인플루언서</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="link">링크</Label>
                  <Input
                    id="link"
                    type="url"
                    placeholder="https://example.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="contact-person">담당자 *</Label>
                  <Input
                    id="contact-person"
                    placeholder="홍길동"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">연락처 *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="010-1234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">문의내용 *</Label>
                  <Textarea
                    id="message"
                    placeholder="문의 내용을 입력해주세요"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? "전송 중..." : "문의하기"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold mb-1">이메일</p>
                <p className="text-sm text-gray-600">contact@inbridge.ai</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold mb-1">전화</p>
                <p className="text-sm text-gray-600">02-1234-5678</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold mb-1">웹사이트</p>
                <p className="text-sm text-gray-600">www.inbridge.ai</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

