import RevealAnimation from "@/components/animation/reveal-animation"
import { type ExperienceItem } from "@/data/data"
import { cn } from "@/lib/utils"

const pointNumber = (index: number) => String(index + 1).padStart(2, "0")

export const ExperienceTimeline = ({
  items,
  className,
  nowDotRef,
  reveal = true,
}: {
  items: ExperienceItem[]
  className?: string
  nowDotRef?: (el: HTMLSpanElement | null) => void
  reveal?: boolean
}) => {
  const list = (
    <ol className={cn("w-full space-y-8 text-left", className)}>
      {items.map((item) => (
        <li key={`${item.label}-${item.title}`}>
          <div className="mb-4 flex items-center gap-3">
            <p
              className={cn(
                "shrink-0 font-instrument-serif text-tagline-3 italic",
                item.current ? "text-background-1" : "text-background-1/40"
              )}
            >
              <span ref={item.current ? nowDotRef : undefined}>
                {item.current ? "Working from" : "Previously"}
              </span>
            </p>
            <span
              className="h-px min-w-4 flex-1 bg-background-1/12"
              aria-hidden
            />
            <p className="shrink-0 font-aspekta-500 text-tagline-4 text-background-1/60">
              {item.label}
            </p>
          </div>

          <h3 className="font-aspekta-600 text-aspekta-heading-9 tracking-[-0.035em] text-background-1">
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 transition-opacity duration-200 ease-out hover:opacity-60"
              >
                {item.title}
                <span
                  aria-hidden
                  className="translate-y-px text-tagline-3 text-background-1/35 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </a>
            ) : (
              item.title
            )}
          </h3>
          <p className="mt-1 font-aspekta-400 text-tagline-2 text-background-1/70">
            {item.description}
          </p>

          {item.points && item.points.length > 0 ? (
            <ol className="mt-5 divide-y divide-background-1/10 border-t border-background-1/10">
              {item.points.map((point, index) => (
                <li
                  key={point}
                  className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 py-2.5"
                >
                  <span className="font-aspekta-500 text-tagline-3 text-background-1/45 tabular-nums">
                    {pointNumber(index)}
                  </span>
                  <span className="font-aspekta-400 text-tagline-3 leading-[1.6] text-background-1/75">
                    {point}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </li>
      ))}
    </ol>
  )

  if (!reveal) return list

  return <RevealAnimation delay={0.4}>{list}</RevealAnimation>
}
