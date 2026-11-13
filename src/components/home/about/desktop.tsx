"use client"

import RevealAnimation from "@/components/animation/reveal-animation"
import { aboutSlides } from "@/data/data"
import { cn } from "@/lib/utils"
import { useRef } from "react"

import { TextReveal } from "@/components/animation"
import { ExperienceTimeline } from "./about-experience-timeline"
import { slideNumber } from "./about-slide-number"
import { AboutVisualFrame } from "./about-visual-frame"
import { AboutDial } from "./dial"
import { MorphingAvatar, type MorphingAvatarHandle } from "./morphing-avatar"
import { TOTAL_LABEL } from "./scroll"
import { useAbout } from "./use-about"

// Shared box for the frame and every slide visual, so they stay aligned.
const visualBox =
  "absolute inset-0 xl:inset-auto xl:top-1/2 xl:left-1/2 xl:aspect-square xl:w-[min(70%,34vw)] xl:max-w-130 xl:-translate-x-1/2 xl:-translate-y-1/2 2xl:w-[min(60%,34vw)]"

export const AboutDesktop = () => {
  const avatarRef = useRef<MorphingAvatarHandle>(null)
  const {
    rootRef,
    wheelRef,
    tickWheelRef,
    outerRingRef,
    innerRingRef,
    progressRef,
    progressSpinRef,
    needleRef,
    indexRef,
    liveRef,
    setSlideRef,
  } = useAbout("(min-width: 1024px)", {
    onSlideChange: (index, immediate) =>
      avatarRef.current?.morphTo(index, immediate),
  })

  return (
    <div
      ref={rootRef}
      className="relative hidden h-dvh overflow-hidden lg:block"
    >
      <div ref={liveRef} className="sr-only" aria-live="polite" />

      <RevealAnimation delay={0.1} blur={false}>
        <div className="pointer-events-none absolute top-1/2 left-0 z-10 size-[min(90vh,75vw)] translate-x-[-58%] -translate-y-1/2">
          <AboutDial
            wheelRef={wheelRef}
            setSlideRef={setSlideRef}
            faceClassName="text-instrument-heading-4 lg:text-instrument-heading-3"
            outerRef={(el) => {
              outerRingRef.current = el
            }}
            innerRef={(el) => {
              innerRingRef.current = el
            }}
            progressRef={(el) => {
              progressRef.current = el
            }}
            progressSpinRef={(el) => {
              progressSpinRef.current = el
            }}
            tickWheelRef={(el) => {
              tickWheelRef.current = el
            }}
            needleRef={(el) => {
              needleRef.current = el
            }}
          />
        </div>
      </RevealAnimation>

      <RevealAnimation delay={0.2} blur={false}>
        <div className="flex h-full flex-col items-center justify-center gap-6 pr-8 pl-[30%] xl:flex-row xl:gap-0 xl:pr-0 xl:pl-0">
          <div className="hidden shrink-0 xl:block xl:w-[36%] 2xl:w-[32%]" />

          <div className="relative order-2 w-full min-w-0 xl:order-0 xl:flex-1">
            <div className="mx-auto w-full max-w-xl text-center xl:text-left">
              <div className="mb-8 flex items-baseline justify-between gap-6 xl:mb-10">
                <TextReveal delay={0.3}>
                  <p className="font-aspekta-500 text-tagline-3 text-background-1/60">
                    About
                  </p>
                </TextReveal>
                {/* Not TextReveal: SplitText would replace the indexRef span. */}
                <RevealAnimation delay={0.4} offset={12}>
                  <p className="flex items-baseline gap-1.5 font-aspekta-500 text-background-1/45">
                    <span className="overflow-hidden leading-none">
                      <span
                        ref={indexRef}
                        className="inline-block text-tagline-2 text-background-1 tabular-nums"
                      >
                        {slideNumber(0)}
                      </span>
                    </span>
                    <span className="font-aspekta text-tagline-3">
                      / {TOTAL_LABEL}
                    </span>
                  </p>
                </RevealAnimation>
              </div>

              <div className="relative grid w-full">
                {aboutSlides.map((slide, index) => (
                  <div
                    key={slide.title}
                    ref={(el) => setSlideRef(index, "content", el)}
                    className={cn(
                      "relative col-start-1 row-start-1 w-full space-y-5 will-change-transform xl:space-y-8",
                      index === 0 ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <div className="space-y-3 xl:space-y-5">
                      <h2 className="overflow-hidden pb-[0.06em] font-aspekta-600 text-aspekta-heading-7 tracking-[-0.05em] text-background-1 xl:text-aspekta-heading-5">
                        <span data-about-title className="block">
                          {slide.title}
                        </span>
                      </h2>
                      {slide.experience ? (
                        <div data-about-body>
                          <ExperienceTimeline
                            items={slide.experience}
                            reveal={false}
                            nowDotRef={(el) => setSlideRef(index, "nowDot", el)}
                          />
                        </div>
                      ) : (
                        <p
                          data-about-body
                          className="mx-auto max-w-md font-aspekta-400 text-[1.1875rem] leading-[1.55] tracking-[-0.01em] text-background-1/75 xl:mx-0"
                        >
                          {slide.description}
                        </p>
                      )}
                    </div>
                    {slide.tags && slide.tags.length > 0 ? (
                      <ul className="flex flex-wrap justify-center gap-2 xl:justify-start">
                        {slide.tags.map((tag) => (
                          <li
                            key={tag}
                            data-about-tag
                            className="rounded-full border border-background-1/10 bg-white px-3.5 py-1.5 font-aspekta-500 text-tagline-3 text-background-1/85"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative order-1 aspect-square w-72 shrink-0 xl:order-0 xl:aspect-auto xl:h-full xl:w-[35%]">
            <div className={cn(visualBox, "hidden xl:block")}>
              <AboutVisualFrame />
            </div>
            <div className={visualBox}>
              <MorphingAvatar ref={avatarRef} />
            </div>
            {aboutSlides.map((slide, index) => (
              <div key={slide.title} className={visualBox}>
                <div
                  ref={(el) => setSlideRef(index, "image", el)}
                  className={cn(
                    "relative size-full will-change-transform",
                    index === 0 ? "opacity-100" : "opacity-0"
                  )}
                >
                  <p className="absolute top-full right-0 left-0 mt-6 hidden items-baseline justify-between gap-4 font-aspekta text-tagline-4 tracking-[0.16em] text-background-1/40 uppercase xl:flex">
                    <span>Fig. {slideNumber(index)}</span>
                    <span className="h-px flex-1 self-center bg-background-1/15" />
                    <span>{slide.title}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealAnimation>
    </div>
  )
}
