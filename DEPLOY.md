# 배포 가이드

## Vercel에 배포하기

### 방법 1: Vercel CLI 사용 (권장)

1. **Vercel 로그인**
```bash
npx vercel login
```

2. **프로젝트 배포**
```bash
npx vercel
```

3. **프로덕션 배포**
```bash
npx vercel --prod
```

### 방법 2: Vercel 웹사이트 사용 (더 쉬움)

1. **GitHub에 코드 푸시**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Vercel 웹사이트에서 배포**
   - [vercel.com](https://vercel.com)에 접속
   - GitHub 계정으로 로그인
   - "Add New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **환경 변수 설정**
   Vercel 대시보드에서 다음 환경 변수를 설정하세요:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **배포 완료**
   - Vercel이 자동으로 빌드하고 배포합니다
   - 배포 완료 후 URL이 제공됩니다

## 환경 변수 체크리스트

배포 전에 다음 환경 변수가 설정되어 있는지 확인하세요:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `OPENAI_API_KEY` (선택사항, AI 기능 사용 시)

## 배포 후 확인 사항

1. ✅ 홈페이지가 정상적으로 로드되는지 확인
2. ✅ 회원가입/로그인 기능 테스트
3. ✅ 반응형 디자인이 모바일에서 정상 작동하는지 확인
4. ✅ 이미지 로딩이 정상적으로 작동하는지 확인

## 문제 해결

### 빌드 오류 발생 시
```bash
# 로컬에서 빌드 테스트
npm run build

# 문제가 있으면 수정 후 다시 배포
```

### 환경 변수 오류 시
- Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인
- 변수 이름에 오타가 없는지 확인
- 재배포 후에도 문제가 지속되면 Vercel 로그 확인

