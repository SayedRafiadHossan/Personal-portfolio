import { TransitionLink } from "@/components/animation/page-transition"
import { HERO_SOCIALS } from "@/components/home/hero-desktop-action"
import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@/components/ui/button"

type HeroMobileActionProps = Readonly<{
  ref?: React.Ref<HTMLDivElement>
}>

export const HeroMobileAction = ({ ref }: HeroMobileActionProps) => {
  return (
    <div ref={ref} className="flex w-full flex-col items-center gap-6 md:hidden">
      <FlipButton from="top" asChild>
        <TransitionLink href="/contact" className="w-full max-w-sm">
          <FlipButtonFront variant="default" className="w-full">
            Start a project
          </FlipButtonFront>
          <FlipButtonBack variant="inverse" className="w-full">
            Start a project
          </FlipButtonBack>
        </TransitionLink>
      </FlipButton>

      <ul className="flex items-center justify-center gap-7">
        {HERO_SOCIALS.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-aspekta-500 text-tagline-3 text-background-1/75"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
