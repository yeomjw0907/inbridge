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
        content: "당신은 인플루언서 마케팅 전문가입니다. 브랜드가 홍보하고 싶은 제품에 어울리는 인플루언서를 추천해주세요.",
      },
      {
        role: "user",
        content: `다음 제품에 어울리는 인플루언서를 추천해주세요: ${productDescription}`,
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
        content: "당신은 법률 전문가입니다. 인플루언서 마케팅 계약서를 작성해주세요.",
      },
      {
        role: "user",
        content: `브랜드: ${campaignDetails.brandName}, 인플루언서: ${campaignDetails.influencerName}, 예산: ${campaignDetails.budget}원, 기간: ${campaignDetails.duration}, 제공물: ${campaignDetails.deliverables.join(', ')}`,
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
        content: "당신은 마케팅 분석가입니다. 캠페인 성과를 한 문단으로 요약해주세요.",
      },
      {
        role: "user",
        content: `도달수: ${campaignData.reach}, 참여율: ${campaignData.engagement}%, 피드백: ${campaignData.feedback}`,
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
  
  const prompt = `이 인플루언서의 활동 데이터를 분석하여 한 문단으로 요약해주세요.

인플루언서명: ${influencerData.name}
팔로워 수: ${influencerData.followers.toLocaleString()}명
주요 카테고리: ${influencerData.category.join(', ')}
평균 참여율: ${influencerData.engagement_rate}%
성장률: ${influencerData.growth_rate || 'N/A'}%
활동 플랫폼: ${influencerData.platforms.join(', ')}
누적 거래 수: ${influencerData.total_deals || 0}건
평균 평점: ${influencerData.rating || 'N/A'}/5.0

이 데이터를 바탕으로 인플루언서의 강점, 타겟 오디언스, 협업 적합성 등을 간결하게 요약해주세요.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "당신은 인플루언서 마케팅 전문 분석가입니다. 인플루언서의 데이터를 분석하여 브랜드가 이해하기 쉽게 한 문단으로 요약해주세요.",
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

