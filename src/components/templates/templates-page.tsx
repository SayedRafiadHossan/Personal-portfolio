"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import { useRef } from "react"

import { TransitionLink } from "@/components/animation/page-transition"
import { FeaturedWorksContactButton } from "@/components/home/featured-works-shared"
import { usePreloaderOpened } from "@/components/preloader/preloader"
import { templates, type Template } from "@/data/data"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const EASE = "expo.out"

/** /templates: every website template as a card, in the portfolio's style. */
export const TemplatesPage = () => {
  // Waits for the loader on a direct visit; already true when arriving from another page.
  const opened = usePreloaderOpened()
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || !opened) return

      const intro = root.querySelectorAll("[data-intro]")
      const cards = gsap.utils.toArray<HTMLElement>("[data-template-card]", root)

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([intro, cards], { autoAlpha: 1, y: 0 })
        return
      }

      // Header pieces come in one after another...
      gsap.fromTo(
        intro,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: EASE }
      )

      // ...and each row of cards rises in as it scrolls into view.
      ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { autoAlpha: 0, y: 48 },
            { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.12, ease: EASE }
          ),
      })
    },
    { scope: rootRef, dependencies: [opened] }
  )

  return (
    <section
      ref={rootRef}
      className="px-[clamp(1.25rem,3.5vw,2.5rem)] pt-28 pb-20 md:pt-36 md:pb-28"
    >
      <header className="mx-auto mb-14 max-w-6xl space-y-6 md:mb-20">
        <TransitionLink
          href="/#work"
          data-intro
          className="invisible inline-flex items-center gap-2 font-aspekta-500 text-tagline-3 text-background-1/60 transition-colors hover:text-background-1"
        >
          <span aria-hidden>←</span> Back to work
        </TransitionLink>
        <p
          data-intro
          className="invisible flex items-center gap-3 font-aspekta-500 text-tagline-3 tracking-[0.12em] text-background-1/50 uppercase"
        >
          <span aria-hidden className="h-px w-8 bg-current" />
          Built in Framer
        </p>
        <h1
          data-intro
          className="invisible font-aspekta-900 text-[clamp(3rem,10vw,7.5rem)] leading-[0.9] tracking-[-0.045em] text-background-1 uppercase"
        >
          Templates
          <sup className="ms-2 align-top font-aspekta-500 text-[0.25em] tracking-normal text-background-1/40">
            ({String(templates.length).padStart(2, "0")})
          </sup>
        </h1>
        <p
          data-intro
          className="invisible max-w-xl font-instrument-serif text-xl leading-snug text-background-1/60 md:text-2xl"
        >
          Premium Framer templates for studios, startups and service
          businesses.
        </p>
      </header>

      <ul className="mx-auto grid max-w-6xl gap-x-6 gap-y-14 md:grid-cols-2 md:gap-y-16">
        {templates.map((template, index) => (
          <TemplateCard key={template.title} template={template} index={index} />
        ))}
      </ul>

      <div className="mx-auto mt-20 flex max-w-6xl flex-col items-center gap-6 text-center md:mt-28">
        <p className="font-instrument-serif text-2xl text-background-1/70">
          Need a custom site built on one of these?
        </p>
        <FeaturedWorksContactButton />
      </div>
    </section>
  )
}

const TemplateCard = ({
  template,
  index,
}: {
  template: Template
  index: number
}) => (
  <li data-template-card className="invisible">
    <a
      href={template.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block space-y-5 focus-visible:outline-none"
    >
      <div className="relative aspect-[1200/630] overflow-hidden rounded-2xl bg-background-1 ring-1 ring-background-1/10 transition-shadow duration-500 group-hover:shadow-[0_24px_60px_-20px_rgb(0_0_0/0.45)] group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-background-1">
        <Image
          src={template.image}
          alt={`${template.title} template preview`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-2 rounded-full border border-background-2/15 bg-background-1/65 px-3 py-1.5 font-aspekta-500 text-tagline-4 text-background-2 backdrop-blur-md">
          <span
            aria-hidden
            className={
              template.platform === "Framer"
                ? "size-1.5 rounded-full bg-violet-400"
                : "size-1.5 rounded-full bg-sky-400"
            }
          />
          {template.platform}
        </span>
        <span
          aria-hidden
          className="absolute right-3 bottom-3 grid size-11 translate-y-2 place-items-center rounded-full bg-background-2 text-background-1 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
        >
          ↗
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-aspekta-600 text-aspekta-heading-8 tracking-[-0.045em] text-background-1">
            {template.title}
          </h2>
          <span className="font-aspekta-500 text-tagline-4 text-background-1/40 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <span className="inline-block rounded-full border border-background-1/12 px-2.5 py-1 text-tagline-4 text-background-1/75">
          {template.category}
        </span>
        <p className="max-w-md font-aspekta-400 text-tagline-1 text-background-1/70">
          {template.description}
        </p>
        <span className="inline-flex items-center gap-1.5 font-aspekta-550 text-tagline-2 text-background-1 underline decoration-background-1/25 underline-offset-[0.25em] transition-colors group-hover:decoration-background-1">
          View template <span aria-hidden>↗</span>
        </span>
      </div>
    </a>
  </li>
)
