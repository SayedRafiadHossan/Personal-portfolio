import { TransitionLink } from "@/components/animation/page-transition"
import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@/components/ui/button"

export const FeaturedWorksContactButton = () => {
  return (
    <div className="flex w-full items-center justify-center md:w-auto">
      <FlipButton from="top" asChild>
        <TransitionLink href="/contact" className="w-[85%] md:w-auto">
          <FlipButtonFront variant="default">Lets Talk</FlipButtonFront>
          <FlipButtonBack variant="inverse">Lets Talk</FlipButtonBack>
        </TransitionLink>
      </FlipButton>
    </div>
  )
}
