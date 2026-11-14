import { PageTransitionProvider } from "@/components/animation/page-transition"
import SmoothScrollProvider from "@/components/animation/smooth-scroll"
import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { PerfProbe } from "@/components/perf-probe"
import { Preloader } from "@/components/preloader/preloader"
import { cn } from "@/lib/utils"
import { fontInstrumentSerif, SIGNATURE_OTF_PUBLIC_URL } from "@/utils/font"
import { generateMetadata } from "@/utils/metadata"
import { preload } from "react-dom"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata = generateMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Start downloading the signature font with the page, so the intro can draw it
  // without waiting. Matches the signature's fetch() so the browser reuses it.
  preload(SIGNATURE_OTF_PUBLIC_URL, { as: "fetch", crossOrigin: "anonymous" })

  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={cn(
          "antialiased",
          fontInstrumentSerif.variable
        )}
      >
        <SmoothScrollProvider>
          <PageTransitionProvider>
            <Preloader>
              <Navbar>
                <main className="bg-background-2">{children}</main>
                <Footer />
              </Navbar>
            </Preloader>
          </PageTransitionProvider>
        </SmoothScrollProvider>
        <Toaster richColors position="top-right" />
        {/* TEMPORARY: slow-frame diagnostics, see components/perf-probe.tsx */}
        <PerfProbe />
      </body>
    </html>
  )
}
