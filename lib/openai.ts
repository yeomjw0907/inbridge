import OpenAI from 'openai'

export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export async function generateInfluencerRecommendations(productDescription: string) {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file.')
  }
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an influencer marketing expert. Recommend influencers that match the product the brand wants to promote.",
      },
      {
        role: "user",
        content: `Please recommend influencers that match the following product: ${productDescription}`,
      },
    ],
    temperature: 0.7,
  })

  return completion.choices[0].message.content
}

export async function generateContract(campaignDetails: {
  brandName: string
  influencerName: string
  budget: number
  duration: string
  deliverables: string[]
}) {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file.')
  }
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a legal expert. Please draft an influencer marketing contract.",
      },
      {
        role: "user",
        content: `Brand: ${campaignDetails.brandName}, Influencer: ${campaignDetails.influencerName}, Budget: $${campaignDetails.budget}, Duration: ${campaignDetails.duration}, Deliverables: ${campaignDetails.deliverables.join(', ')}`,
      },
    ],
    temperature: 0.3,
  })

  return completion.choices[0].message.content
}

export async function generateCampaignReport(campaignData: {
  reach: number
  engagement: number
  feedback: string
}) {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file.')
  }
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a marketing analyst. Please summarize the campaign performance in one paragraph.",
      },
      {
        role: "user",
        content: `Reach: ${campaignData.reach}, Engagement Rate: ${campaignData.engagement}%, Feedback: ${campaignData.feedback}`,
      },
    ],
    temperature: 0.5,
  })

  return completion.choices[0].message.content
}

export async function generateInfluencerInsight(influencerData: {
  name: string
  followers: number
  category: string[]
  engagement_rate: number
  growth_rate?: number
  platforms: string[]
  total_deals?: number
  rating?: number
}) {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file.')
  }
  
  const prompt = `Please analyze this influencer's activity data and summarize it in one paragraph.

Influencer Name: ${influencerData.name}
Followers: ${influencerData.followers.toLocaleString()}
Main Categories: ${influencerData.category.join(', ')}
Average Engagement Rate: ${influencerData.engagement_rate}%
Growth Rate: ${influencerData.growth_rate || 'N/A'}%
Active Platforms: ${influencerData.platforms.join(', ')}
Total Deals: ${influencerData.total_deals || 0}
Average Rating: ${influencerData.rating || 'N/A'}/5.0

Based on this data, please provide a concise summary of the influencer's strengths, target audience, and collaboration suitability.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert influencer marketing analyst. Analyze the influencer's data and provide a one-paragraph summary that is easy for brands to understand.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  })

  return completion.choices[0].message.content
}

