import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">inbridge.ai</h3>
            <p className="text-sm text-primary/80">
              AI platform connecting brands and influencers
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-primary/80">
              <li>
                <Link href="/" className="hover:text-primary">
                  Find Influencers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-primary/80">
              <li>
                <Link href="/about" className="hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
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

