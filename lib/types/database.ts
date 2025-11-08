export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: "influencer" | "brand" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: "influencer" | "brand" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: "influencer" | "brand" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
      influencers: {
        Row: {
          id: string
          user_id: string
          channel_name: string
          followers: number
          engagement_rate: number
          categories: string[]
          platforms: string[]
          content_urls: string[]
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          channel_name: string
          followers?: number
          engagement_rate?: number
          categories?: string[]
          platforms?: string[]
          content_urls?: string[]
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          channel_name?: string
          followers?: number
          engagement_rate?: number
          categories?: string[]
          platforms?: string[]
          content_urls?: string[]
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          user_id: string
          company_name: string
          contact_person: string
          website: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          contact_person: string
          website?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          contact_person?: string
          website?: string
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          brand_id: string
          influencer_id: string
          campaign_name: string
          budget: number
          schedule: string
          message: string
          status: "pending" | "accepted" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          influencer_id: string
          campaign_name: string
          budget: number
          schedule: string
          message?: string
          status?: "pending" | "accepted" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          influencer_id?: string
          campaign_name?: string
          budget?: number
          schedule?: string
          message?: string
          status?: "pending" | "accepted" | "rejected"
          created_at?: string
          updated_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          brand_id: string
          influencer_id: string
          proposal_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          influencer_id: string
          proposal_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          influencer_id?: string
          proposal_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          message?: string
          created_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          proposal_id: string
          content: string
          signed_by_brand: boolean
          signed_by_influencer: boolean
          status: "pending" | "signed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          content: string
          signed_by_brand?: boolean
          signed_by_influencer?: boolean
          status?: "pending" | "signed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          content?: string
          signed_by_brand?: boolean
          signed_by_influencer?: boolean
          status?: "pending" | "signed"
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          contract_id: string
          amount: number
          status: "pending" | "paid" | "failed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          amount: number
          status?: "pending" | "paid" | "failed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contract_id?: string
          amount?: number
          status?: "pending" | "paid" | "failed"
          created_at?: string
          updated_at?: string
        }
      }
      campaign_history: {
        Row: {
          id: string
          brand_id: string
          influencer_id: string
          proposal_id: string
          brand_name: string
          start_date: string
          end_date: string
          budget: number
          reach: number
          engagement_rate: number
          status: "pending" | "ongoing" | "completed"
          ai_report: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          influencer_id: string
          proposal_id: string
          brand_name: string
          start_date: string
          end_date: string
          budget: number
          reach?: number
          engagement_rate?: number
          status?: "pending" | "ongoing" | "completed"
          ai_report?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          influencer_id?: string
          proposal_id?: string
          brand_name?: string
          start_date?: string
          end_date?: string
          budget?: number
          reach?: number
          engagement_rate?: number
          status?: "pending" | "ongoing" | "completed"
          ai_report?: string
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          campaign_id: string
          reviewer_id: string
          communication_rating: number
          performance_rating: number
          overall_rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          reviewer_id: string
          communication_rating: number
          performance_rating: number
          overall_rating: number
          comment?: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          reviewer_id?: string
          communication_rating?: number
          performance_rating?: number
          overall_rating?: number
          comment?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      blogs: {
        Row: {
          id: string
          title: string
          summary: string
          content: string
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary: string
          content: string
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string
          content?: string
          author_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      contact_requests: {
        Row: {
          id: string
          budget: number
          category: string
          link: string
          contact_person: string
          phone: string
          email: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          budget: number
          category: string
          link?: string
          contact_person: string
          phone: string
          email: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          budget?: number
          category?: string
          link?: string
          contact_person?: string
          phone?: string
          email?: string
          message?: string
          created_at?: string
        }
      }
    }
  }
}

