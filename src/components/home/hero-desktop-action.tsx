import { TransitionLink } from "@/components/animation/page-transition"
import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@/components/ui/button"
import { profile } from "@/data/data"

type HeroDesktopActionProps = Readonly<{
  ref?: React.Ref<HTMLDivElement>
}>

export const HERO_SOCIALS = [
  { label: "GitHub", href: profile.github.href },
  { label: "LinkedIn", href: profile.linkedin.href },
  { label: "X", href: profile.x },
] as const

const link =
  "font-aspekta-500 text-tagline-3 text-background-1/75 transition-colors duration-200 hover:text-background-1"

export const HeroDesktopAction = ({ ref }: HeroDesktopActionProps) => {
  return (
    <div
      ref={ref}
      className="hidden w-full grid-cols-3 items-center gap-4 pt-2 md:grid"
    >
      <p className="font-aspekta-500 text-tagline-3 text-background-1/75">
        {profile.city}, {profile.country}
      </p>

      <div className="flex items-center justify-center">
        <FlipButton from="top" asChild>
          <TransitionLink href="/contact">
            <FlipButtonFront variant="default">Start a project</FlipButtonFront>
            <FlipButtonBack variant="inverse">Start a project</FlipButtonBack>
          </TransitionLink>
        </FlipButton>
      </div>

      <ul className="flex items-center justify-end gap-6">
        {HERO_SOCIALS.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
