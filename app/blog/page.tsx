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

      // Dummy data (when Supabase has no data)
      const dummyPosts = [
        {
          id: "1",
          title: "2024 Influencer Marketing Trends",
          summary: "Learn about the influencer marketing trends and strategies to watch this year.",
          content: "<p>Influencer marketing in 2024 is evolving around more personalized and authentic content. Beyond simple product promotion, genuine partnerships between brands and influencers are becoming increasingly important.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          title: "Planning Effective Influencer Campaigns",
          summary: "A step-by-step guide for planning successful influencer campaigns.",
          content: "<p>Thorough planning is essential for successfully running influencer campaigns. We'll explore goal setting, target audience analysis, and selecting the right influencers step by step.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          title: "How to Measure Influencer ROI",
          summary: "Learn how to accurately measure the return on investment for influencer marketing.",
          content: "<p>Measuring ROI for influencer marketing is not easy. We'll explore methods for comprehensive analysis of various metrics including reach, engagement rate, and conversion rate.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          title: "Platform-Specific Influencer Strategies",
          summary: "Learn about platform-specific influencer marketing strategies for Instagram, YouTube, TikTok, and more.",
          content: "<p>Each social media platform has unique characteristics and user behavior patterns. It's important to establish optimized influencer marketing strategies for each platform.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "5",
          title: "The Power of Micro-Influencers",
          summary: "In an era where engagement rate matters more than follower count, learn about the value of micro-influencers.",
          content: "<p>Micro-influencers show high engagement rates and trustworthiness despite having fewer followers. We'll explore the advantages of cost-effective micro-influencer marketing.</p>",
          author_id: "admin",
          created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "6",
          title: "Influencer Collaboration Contract Guide",
          summary: "A guide to contract items and precautions when collaborating with influencers.",
          content: "<p>When collaborating with influencers, it's important to clearly specify contract terms, intellectual property rights, and content usage permissions. Learn about important considerations when drafting contracts.</p>",
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
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-gray-600">
              Check out the latest information and insights on influencer marketing
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
                No posts yet
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

