import { profile } from "@/data/data"
import { FooterBar } from "@/components/layout/footer-bar"
import { FooterNameCanvas } from "@/components/layout/footer-name-canvas"

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-background-1 text-background-2">
      <FooterBar />

      <FooterNameCanvas>
        <p className="font-aspekta-400 text-tagline-2 text-background-2/40">
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
      </FooterNameCanvas>
    </footer>
  )
}
