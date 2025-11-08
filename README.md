# inbridge.ai

브랜드와 인플루언서를 연결하는 AI 기반 플랫폼

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Database/Auth/Realtime**: Supabase
- **AI Engine**: OpenAI GPT-4o-mini
- **Payment**: Stripe (예정)
- **Animation**: Framer Motion
- **Chart**: Chart.js
- **Deployment**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
inbridge/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx           # 메인 페이지
│   ├── influencer/        # 인플루언서 상세 페이지
│   ├── mypage/            # 마이페이지
│   ├── chat/              # 실시간 채팅
│   ├── contract/          # 계약서 페이지
│   ├── payment/           # 결제 페이지
│   ├── campaign/          # 캠페인 관리
│   ├── review/            # 리뷰 페이지
│   ├── blog/              # 블로그
│   ├── contact/           # 문의 페이지
│   ├── auth/              # 인증 페이지
│   └── admin/             # 관리자 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # Shadcn UI 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/         # Supabase 클라이언트
│   ├── openai.ts         # OpenAI 설정
│   └── types/            # TypeScript 타입 정의
└── hooks/                 # React Hooks
```

## 주요 기능

### 1. AI 기반 인플루언서 추천
- 제품 정보를 입력하면 AI가 최적의 인플루언서를 추천합니다

### 2. 제안 및 협상
- 브랜드가 인플루언서에게 캠페인 제안을 보낼 수 있습니다
- 인플루언서는 제안을 승인/거절할 수 있습니다

### 3. 실시간 채팅
- Supabase Realtime을 활용한 실시간 채팅 기능

### 4. AI 계약서 생성
- OpenAI를 활용하여 계약서를 자동으로 생성합니다

### 5. 결제 시스템
- Stripe를 통한 안전한 결제 처리

### 6. 캠페인 관리 및 분석
- 캠페인 성과를 실시간으로 추적하고 분석합니다
- AI 리포트를 자동으로 생성합니다

### 7. 리뷰 시스템
- 캠페인 완료 후 리뷰를 작성할 수 있습니다

## Supabase 테이블 구조

주요 테이블:
- `users` - 사용자 정보
- `influencers` - 인플루언서 정보
- `brands` - 브랜드 정보
- `proposals` - 제안
- `chat_rooms` - 채팅방
- `chat_messages` - 채팅 메시지
- `contracts` - 계약서
- `payments` - 결제
- `campaign_history` - 캠페인 이력
- `reviews` - 리뷰
- `notifications` - 알림
- `blogs` - 블로그
- `contact_requests` - 문의

## 디자인 시스템

- **배경색**: #F9FAFB (밝은 그레이톤)
- **포인트 컬러**: #0066FF (Toss Blue)
- **보조 컬러**: #A855F7 (AI Accent)
- **텍스트**: #111827 / #6B7280
- **폰트**: Inter + Pretendard

## 배포

Vercel에 배포하는 것을 권장합니다:

```bash
npm run build
vercel deploy
```

## 라이선스

MIT

