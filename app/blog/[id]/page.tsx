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
          // Continue even if error occurs (use dummy data)
        }

        // Dummy data (when Supabase has no data)
        if (!postData) {
          const dummyPosts: any = {
            "1": {
              id: "1",
              title: "2024 Influencer Marketing Trends",
              summary: "Learn about the influencer marketing trends and strategies to watch this year.",
              content: "<p>Influencer marketing in 2024 is evolving around more personalized and authentic content. Beyond simple product promotion, genuine partnerships between brands and influencers are becoming increasingly important.</p><p>Recent trends show growing interest in micro-influencers and nano-influencers. Despite having fewer followers, they show high engagement rates and trustworthiness, offering excellent cost-effectiveness.</p><p>Additionally, building long-term partnerships is becoming more important than short-term campaigns. The key is creating relationships where brands and influencers grow together.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            "2": {
              id: "2",
              title: "Planning Effective Influencer Campaigns",
              summary: "A step-by-step guide for planning successful influencer campaigns.",
              content: "<p>Thorough planning is essential for successfully running influencer campaigns. We'll explore goal setting, target audience analysis, and selecting the right influencers step by step.</p><p>First, you need to clearly set campaign goals. It's important to define specific goals such as increasing brand awareness, boosting product sales, and acquiring target customers.</p><p>Next, analyze the target audience and select influencers who can appeal to them. You need to comprehensively consider the influencer's follower composition, engagement rate, content tone and manner, etc.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
            "3": {
              id: "3",
              title: "How to Measure Influencer ROI",
              summary: "Learn how to accurately measure the return on investment for influencer marketing.",
              content: "<p>Measuring ROI for influencer marketing is not easy. We'll explore methods for comprehensive analysis of various metrics including reach, engagement rate, and conversion rate.</p><p>To measure ROI, you first need to compare metrics before and after the campaign. It's important to track website traffic, social media follower growth, product sales, etc.</p><p>Additionally, providing unique tracking codes for each influencer allows you to accurately measure each influencer's contribution. This helps identify effective influencers and utilize them in future campaigns.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            },
            "4": {
              id: "4",
              title: "Platform-Specific Influencer Strategies",
              summary: "Learn about platform-specific influencer marketing strategies for Instagram, YouTube, TikTok, and more.",
              content: "<p>Each social media platform has unique characteristics and user behavior patterns. It's important to establish optimized influencer marketing strategies for each platform.</p><p>Instagram excels at visual content and is suitable for short-term campaigns using Stories and Reels. YouTube allows in-depth product introductions through long-form content.</p><p>TikTok is effective for short, entertaining content targeting younger generations. You need to understand each platform's characteristics and establish content strategies accordingly.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            },
            "5": {
              id: "5",
              title: "The Power of Micro-Influencers",
              summary: "In an era where engagement rate matters more than follower count, learn about the value of micro-influencers.",
              content: "<p>Micro-influencers show high engagement rates and trustworthiness despite having fewer followers. We'll explore the advantages of cost-effective micro-influencer marketing.</p><p>Micro-influencers typically have between 10,000 and 100,000 followers and maintain closer relationships with their followers. This results in higher engagement rates and conversion rates.</p><p>Additionally, collaboration costs with micro-influencers are relatively low, allowing you to run campaigns with multiple influencers simultaneously. This enables reaching a wider target audience.</p>",
              author_id: "admin",
              created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            },
            "6": {
              id: "6",
              title: "Influencer Collaboration Contract Guide",
              summary: "A guide to contract items and precautions when collaborating with influencers.",
              content: "<p>When collaborating with influencers, it's important to clearly specify contract terms, intellectual property rights, and content usage permissions. Learn about important considerations when drafting contracts.</p><p>The contract should clearly specify campaign duration, content format, posting schedule, compensation payment terms, etc. You also need to agree on intellectual property rights and content reuse permissions.</p><p>Additionally, it's important to comply with FTC guidelines and disclose sponsorships. Transparent collaboration builds trust for both brands and influencers.</p>",
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
        // Use dummy data on error
        const dummyPosts: any = {
          "1": {
            id: "1",
            title: "2024 Influencer Marketing Trends",
            summary: "Learn about the influencer marketing trends and strategies to watch this year.",
            content: "<p>Influencer marketing in 2024 is evolving around more personalized and authentic content.</p>",
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
        <p>Loading...</p>
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
              Back to List
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

