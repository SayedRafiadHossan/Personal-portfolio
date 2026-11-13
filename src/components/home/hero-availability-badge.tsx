type HeroAvailabilityBadgeProps = Readonly<{
  ref?: React.Ref<HTMLParagraphElement>
}>

export const HeroAvailabilityBadge = ({ ref }: HeroAvailabilityBadgeProps) => (
  <p
    ref={ref}
    className="inline-flex items-center gap-2.5 rounded-full border border-background-1/10 bg-white py-1.5 pr-3.5 pl-3 font-aspekta-500 text-tagline-3 text-background-1/80"
  >
    <span aria-hidden className="relative flex size-1.5">
      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
      <span className="relative size-1.5 rounded-full bg-emerald-500" />
    </span>
    Available for new projects
  </p>
)
