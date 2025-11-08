import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">inbridge.ai</h3>
            <p className="text-sm text-primary/80">
              브랜드와 인플루언서를 연결하는 AI 플랫폼
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-primary/80">
              <li>
                <Link href="/" className="hover:text-primary">
                  인플루언서 찾기
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary">
                  블로그
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">회사</h4>
            <ul className="space-y-2 text-sm text-primary/80">
              <li>
                <Link href="/about" className="hover:text-primary">
                  소개
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">연락처</h4>
            <p className="text-sm text-primary/80">
              Email: yeomjw0907@onecation.co.kr
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-neutral-200 text-center text-sm text-primary/80">
          <p>© 2025 inbridge.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

