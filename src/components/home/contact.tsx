"use client"

import { profile } from "@/data/data"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"

import { ContactChannels } from "@/components/home/contact-channels"
import { ContactForm } from "@/components/home/contact-form"
import { usePreloaderReady } from "@/components/preloader/preloader"
import { StarIcon } from "@/components/shared/icons"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const MARQUEE_WORD = "Contact"
// Two identical halves so translating the track by -50% loops seamlessly.
const MARQUEE_COPIES = 4

const MarqueeWords = () =>
  Array.from({ length: MARQUEE_COPIES }, (_, i) => (
    <span key={i} className="pe-[0.35em]">
      {MARQUEE_WORD}
    </span>
  ))

type ContactProps = Readonly<{
  /** "page" renders the standalone /contact layout with its own h1. */
  variant?: "section" | "page"
}>

const Contact = ({ variant = "section" }: ContactProps) => {
  const isPage = variant === "page"
  const ready = usePreloaderReady()
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || !ready) return

      const panels = root.querySelectorAll("[data-contact-panel]")
      const items = root.querySelectorAll("[data-contact-item]")

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(items, { autoAlpha: 1 })
        return
      }

      gsap
        .timeline({
          delay: 0.3,
          scrollTrigger: { trigger: root, start: "top 75%", once: true },
        })
        .fromTo(
          panels,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            stagger: 0.12,
            ease: "expo.inOut",
            clearProps: "clipPath",
          },
          0
        )
        .fromTo(
          items,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: "power3.out",
          },
          0.45
        )
    },
    { scope: rootRef, dependencies: [ready] }
  )

  return (
    <section
      ref={rootRef}
      id={isPage ? undefined : "contact"}
      className={cn(
        "relative px-[clamp(1.25rem,3.5vw,2.5rem)] lg:flex lg:flex-col",
        isPage ? "pt-24 pb-6 md:pt-28 md:pb-10 lg:min-h-svh" : "py-16 lg:py-24"
      )}
    >
      {isPage ? <h1 className="sr-only">Contact</h1> : null}

      <div className="grid gap-4 lg:flex-1 lg:grid-cols-[clamp(6.5rem,10vw,10rem)_minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-6">
        {/* marquee strip: horizontal below lg, vertical (bottom to top) on lg+ */}
        <div
          aria-hidden
          data-contact-panel
          className="overflow-hidden rounded-2xl bg-background-1 py-3 text-background-2 lg:hidden"
        >
          <div className="flex w-max font-aspekta-550 text-[clamp(4rem,20vw,8rem)] leading-[0.95] tracking-[-0.04em] motion-safe:animate-marquee-x">
            <MarqueeWords />
          </div>
        </div>
        <div
          aria-hidden
          data-contact-panel
          className="relative hidden overflow-hidden rounded-2xl bg-background-1 text-background-2 lg:block"
        >
          <div className="absolute inset-0 rotate-180 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 font-aspekta-550 text-[clamp(5.5rem,8.5vw,8.5rem)] leading-[0.9] tracking-[-0.04em] whitespace-nowrap [writing-mode:vertical-rl] motion-safe:animate-marquee-y">
              <MarqueeWords />
            </div>
          </div>
        </div>

        {/* intro + channels */}
        <div className="flex flex-col justify-between gap-12 py-6 lg:px-4 lg:py-2 xl:px-8">
          <div className="space-y-6 text-center lg:text-left">
            <p
              data-contact-item
              className="invisible flex items-center justify-center gap-3 font-aspekta-500 text-tagline-3 tracking-[0.12em] whitespace-nowrap text-background-1/50 uppercase lg:justify-start"
            >
              <span aria-hidden className="h-px w-6 bg-current lg:w-8" />
              Based in {profile.city}, {profile.country}
              <span aria-hidden className="h-px w-6 bg-current lg:hidden" />
            </p>
            <h2
              data-contact-item
              className="invisible font-aspekta-900 text-[clamp(2.25rem,7vw,3.5rem)] leading-[0.95] tracking-[-0.04em] whitespace-nowrap text-background-1 uppercase lg:text-[clamp(2.25rem,4.1vw,4.5rem)]"
            >
              <span className="block">Got a project</span>
              <span className="block">in mind?</span>
            </h2>
            <p
              data-contact-item
              className="invisible mx-auto max-w-[36rem] font-instrument-serif text-xl leading-snug text-background-1/60 lg:mx-0"
            >
              Looking for a dedicated developer for your next project? Reach out
              to me today to discuss your technical needs.
            </p>
          </div>

          <ContactChannels />
        </div>

        {/* form card */}
        <div
          data-contact-panel
          className="flex flex-col gap-8 rounded-2xl bg-background-1 p-6 text-background-2 md:p-8 xl:p-10"
        >
          <div
            data-contact-item
            className="invisible flex items-start justify-between gap-6 border-b border-background-2/10 pb-6"
          >
            <div className="space-y-1">
              <p className="font-aspekta-700 text-aspekta-heading-9 uppercase">
                Send a message
              </p>
              <p className="font-instrument-serif text-xl text-background-2/50">
                Fields marked * are required.
              </p>
            </div>
            <StarIcon className="size-9 shrink-0 motion-safe:animate-[spin_15s_linear_infinite]" />
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}

export default Contact
