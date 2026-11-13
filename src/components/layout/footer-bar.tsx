"use client"

import { FooterClock } from "@/components/layout/footer-clock"
import { navSocials, profile } from "@/data/data"
import { cn } from "@/lib/utils"
import { useLenis } from "lenis/react"
import { useEffect, useRef, useState } from "react"

const EMAIL =
  navSocials
    .find((item) => item.label === "Email")
    ?.href.replace("mailto:", "") ?? profile.email

const MAPS_HREF = `https://www.google.com/maps?q=${encodeURIComponent(`${profile.city}, ${profile.country}`)}`

export const FooterBar = () => {
  const lenis = useLenis()
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef(0)

  useEffect(() => {
    return () => window.clearTimeout(copiedTimer.current)
  }, [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      window.clearTimeout(copiedTimer.current)
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  const toTop = () => {
    const immediate = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (lenis) {
      lenis.scrollTo(0, { immediate, duration: immediate ? 0 : 1.1 })
      return
    }
    window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" })
  }

  return (
    <div className="relative px-5 py-10 md:px-12 md:py-14">
      <div className="grid grid-cols-1 items-end gap-y-6 [grid-template-areas:'slogan'_'clock'_'place'] md:grid-cols-2 md:gap-8 md:gap-y-0 md:[grid-template-areas:'slogan_place'_'clock_clock'] lg:grid-cols-3 lg:gap-6 lg:[grid-template-areas:'slogan_clock_place']">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center [grid-area:slogan] md:mx-0 md:items-start md:text-left">
          <p className="font-instrument-serif text-instrument-heading-6 text-background-2/70 italic md:text-instrument-heading-5">
            Crafting fast, thoughtful interfaces people trust.
          </p>
          <button
            type="button"
            onClick={() => void copyEmail()}
            aria-label={copied ? "Email copied" : `Copy email ${EMAIL}`}
            className="group w-fit origin-center cursor-pointer appearance-none border-0 bg-transparent p-0 text-center transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] outline-none focus-visible:text-background-2/70 active:scale-[0.97] md:origin-left md:text-left"
          >
            <span className="sr-only" aria-live="polite">
              {copied ? "Email copied to clipboard" : ""}
            </span>
            <span className="relative grid overflow-hidden font-aspekta-400 text-tagline-3 text-background-2/65">
              <span
                className={cn(
                  "col-start-1 row-start-1 transition-transform duration-500 ease-bouncy motion-reduce:transition-none",
                  copied
                    ? "tracking-[0.12em] uppercase"
                    : "tracking-[0.04em] motion-reduce:group-hover:translate-y-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:-translate-y-full"
                )}
              >
                {copied ? "Copied" : EMAIL}
              </span>
              <span
                aria-hidden
                className={cn(
                  "col-start-1 row-start-1 translate-y-full tracking-[0.12em] uppercase transition-transform duration-500 ease-bouncy motion-reduce:translate-y-full motion-reduce:transition-none",
                  !copied &&
                    "[@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-y-0"
                )}
              >
                Copy email
              </span>
            </span>
          </button>
        </div>

        <div className="mt-0 w-full min-w-0 [grid-area:clock] md:mt-8 lg:mt-0">
          <FooterClock />
        </div>

        <div className="flex flex-col items-center gap-3 text-center [grid-area:place] md:items-end md:justify-self-end md:text-right">
          <p className="font-aspekta-400 text-tagline-3 tracking-[0.12em] text-background-2/65 uppercase">
            Based in {profile.city}
          </p>
          <a
            href={MAPS_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${profile.city}, ${profile.country} on Google Maps`}
            className="font-aspekta-400 text-tagline-4 tracking-[0.12em] text-background-2/55 uppercase transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-70"
          >
            {profile.coordinates.replace(", ", " · ")}
          </a>
          <button
            type="button"
            onClick={toTop}
            className="w-fit origin-center cursor-pointer appearance-none border-0 bg-transparent p-0 font-aspekta-400 text-tagline-3 tracking-[0.12em] text-background-2/65 uppercase transition-[opacity,transform] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] outline-none active:scale-[0.97] md:ml-auto md:origin-right [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-70"
          >
            Back to top
          </button>
        </div>
      </div>
    </div>
  )
}
