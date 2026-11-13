"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"

import { aboutSlides } from "@/data/data"

import { TextReveal } from "@/components/animation"
import RevealAnimation from "@/components/animation/reveal-animation"
import { cn } from "@/lib/utils"

import { ExperienceTimeline } from "./about-experience-timeline"
import { slideNumber } from "./about-slide-number"
import { SlideVisual } from "./about-slide-visual"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const TOTAL_LABEL = String(aboutSlides.length).padStart(2, "0")

export const AboutMobile = () => {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(max-width: 767px)", () => {
        const rules = gsap.utils.toArray<HTMLElement>("[data-about-rule]")
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches

        if (reduced) {
          gsap.set(rules, { scaleX: 1 })
          return
        }

        rules.forEach((rule) => {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: rule.parentElement,
                start: "top 85%",
                end: "top 55%",
                scrub: true,
              },
            }
          )
        })
      })
    },
    { scope: rootRef }
  )

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden py-16 md:py-24 lg:hidden"
    >
      <div className="main-container">
        <div className="relative">
          <span
            className="absolute top-2 bottom-2 left-0 hidden w-px -translate-x-1/2 bg-background-1/10 md:block"
            aria-hidden
          />

          <div className="space-y-30 md:space-y-24">
            {aboutSlides.map((slide, index) => {
              const flipped = index % 2 === 1

              return (
                <div
                  key={slide.title}
                  className="relative pt-8 md:border-t-0 md:pt-0 md:pl-10"
                >
                  <span
                    data-about-rule
                    className="absolute top-0 right-0 left-0 h-px origin-left scale-x-0 bg-background-1/10 md:hidden"
                    aria-hidden
                  />
                  <TextReveal delay={index * 0.08 + 0.1}>
                    <span
                      className="pointer-events-none absolute top-0 right-0 z-0 -translate-y-1/2 font-aspekta-600 text-[clamp(5.5rem,28vw,9.5rem)] leading-none tracking-[-0.06em] text-background-1/[0.05] tabular-nums select-none md:-top-10 md:translate-y-0"
                      aria-hidden
                    >
                      {slideNumber(index)}
                    </span>
                  </TextReveal>
                  <span
                    className="absolute top-8 left-0 hidden size-2 -translate-x-1/2 rounded-full bg-background-1/40 md:block"
                    aria-hidden
                  />

                  <div
                    className={cn(
                      "relative z-10 grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-12"
                    )}
                  >
                    <RevealAnimation delay={index * 0.08 + 0.1}>
                      <div
                        className={cn(
                          "relative w-[min(72%,18rem)] md:col-span-5 md:w-full",
                          flipped ? "ml-0 md:order-2" : "ml-auto md:ml-0"
                        )}
                      >
                        <SlideVisual src={slide.image} alt={slide.imageAlt} />
                      </div>
                    </RevealAnimation>

                    <div className="md:col-span-7">
                      <TextReveal delay={index * 0.08 + 0.16}>
                        <p className="mb-3 font-aspekta-500 text-tagline-3 text-background-1/60 tabular-nums">
                          {slideNumber(index)}
                          <span className="text-background-1/20">
                            {" "}
                            / {TOTAL_LABEL}
                          </span>
                        </p>
                      </TextReveal>
                      <TextReveal delay={index * 0.08 + 0.16}>
                        <h3 className="max-w-[14ch] font-aspekta-600 text-aspekta-heading-7 tracking-[-0.05em] text-background-1 md:text-aspekta-heading-6">
                          {slide.title}
                        </h3>
                      </TextReveal>
                      <div className="mt-4 space-y-5 md:mt-5">
                        <TextReveal delay={index * 0.08 + 0.22}>
                          <p className="max-w-md font-aspekta-400 text-tagline-1 text-background-1/75">
                            {slide.description}
                          </p>
                        </TextReveal>
                        {slide.experience ? (
                          <ExperienceTimeline
                            items={slide.experience}
                            className="mx-0 w-full"
                          />
                        ) : null}
                        {slide.tags && slide.tags.length > 0 ? (
                          <RevealAnimation delay={index * 0.08 + 0.28}>
                            <ul className="flex flex-wrap gap-2">
                              {slide.tags.map((tag) => (
                                <li
                                  key={tag}
                                  className="rounded-full border border-background-1/10 bg-white px-3.5 py-1.5 font-aspekta-500 text-tagline-3 text-background-1/85"
                                >
                                  {tag}
                                </li>
                              ))}
                            </ul>
                          </RevealAnimation>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
