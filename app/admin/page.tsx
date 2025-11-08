"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { Users, Building2, FileText, MessageSquare, Mail } from "lucide-react"

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [influencers, setInfluencers] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [blogs, setBlogs] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await supabase.from("users").select("*")
      setUsers(usersData || [])

      const { data: influencersData } = await supabase
        .from("influencers")
        .select("*")
      setInfluencers(influencersData || [])

      const { data: campaignsData } = await supabase
        .from("campaign_history")
        .select("*")
        .order("created_at", { ascending: false })
      setCampaigns(campaignsData || [])

      const { data: contactsData } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false })
      setContacts(contactsData || [])

      const { data: blogsData } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false })
      setBlogs(blogsData || [])
    }

    fetchData()
  }, [supabase])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Page</h1>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="influencers">
                <Users className="w-4 h-4 mr-2" />
                Influencer Management
              </TabsTrigger>
              <TabsTrigger value="campaigns">
                <FileText className="w-4 h-4 mr-2" />
                Campaign Management
              </TabsTrigger>
              <TabsTrigger value="contacts">
                <Mail className="w-4 h-4 mr-2" />
                Inquiries
              </TabsTrigger>
              <TabsTrigger value="blogs">
                <FileText className="w-4 h-4 mr-2" />
                Blog Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Role</th>
                          <th className="text-left p-2">Join Date</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b">
                            <td className="p-2">{user.id.substring(0, 8)}...</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.role}</td>
                            <td className="p-2">{formatDate(user.created_at)}</td>
                            <td className="p-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="influencers">
              <Card>
                <CardHeader>
                  <CardTitle>Influencer Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Channel Name</th>
                          <th className="text-left p-2">Followers</th>
                          <th className="text-left p-2">Engagement Rate</th>
                          <th className="text-left p-2">Categories</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {influencers.map((influencer) => (
                          <tr key={influencer.id} className="border-b">
                            <td className="p-2">{influencer.channel_name}</td>
                            <td className="p-2">{influencer.followers?.toLocaleString()}</td>
                            <td className="p-2">{influencer.engagement_rate}%</td>
                            <td className="p-2">
                              {influencer.categories?.join(", ") || "-"}
                            </td>
                            <td className="p-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <Card key={campaign.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{campaign.brand_name}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                campaign.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : campaign.status === "ongoing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {campaign.status === "completed"
                                ? "Completed"
                                : campaign.status === "ongoing"
                                ? "Ongoing"
                                : "Pending"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts">
              <Card>
                <CardHeader>
                  <CardTitle>Inquiry Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <Card key={contact.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{contact.contact_person}</p>
                              <p className="text-sm text-gray-600">{contact.email}</p>
                              <p className="text-sm text-gray-600 mt-1">{contact.message}</p>
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatDate(contact.created_at)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blogs">
              <Card>
                <CardHeader>
                  <CardTitle>Blog Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blogs.map((blog) => (
                      <Card key={blog.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{blog.title}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(blog.created_at)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

