"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import Image from "next/image"
import { useRef } from "react"

import {
  ensureTextRevealEase,
  TEXT_REVEAL_DURATION,
  TEXT_REVEAL_STAGGER,
  textRevealFrom,
  textRevealTo,
} from "@/components/animation/text-reveal"
import { HeroAvailabilityBadge } from "@/components/home/hero-availability-badge"
import { HeroDesktopAction } from "@/components/home/hero-desktop-action"
import { HeroLinkPreview } from "@/components/home/hero-link-preview"
import { HeroMobileAction } from "@/components/home/hero-mobile-action"
import { usePreloaderOpened } from "@/components/preloader/preloader"
import { profile } from "@/data/data"

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger)

/** How far the hero sinks (share of its height) while the next section slides over it. */
const PARALLAX_AMOUNT = 0.5
const FADE_START = 0.2
const FADE_END = 0.6

/** Max pointer drift in px for a layer of depth 1; negative depths move against the cursor. */
const DRIFT = { x: 18, y: 12 }
/** Max portrait tilt in degrees. */
const TILT = 12

/** Title weight at rest and at the cursor, on Aspekta's variable axis. */
const WEIGHT = { rest: 600, peak: 900 }
/** Cursor reach, as a share of the title's font size. */
const WEIGHT_REACH = 1.6

/** Start times (s) of the hero entrance, played one after another once the loader has opened. */
const REVEAL_AT = {
  badge: 0,
  firstLine: 0.2,
  secondLine: 0.5,
  portrait: 0.85,
  bio: 1.2,
  actions: 1.65,
}

const Hero = () => {
  const opened = usePreloaderOpened()

  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const titleFrontRef = useRef<HTMLSpanElement>(null)
  const titleEndRef = useRef<HTMLSpanElement>(null)
  const titleDeveloperRef = useRef<HTMLSpanElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const portraitRef = useRef<HTMLImageElement>(null)
  const bioRef = useRef<HTMLParagraphElement>(null)
  const availabilityRef = useRef<HTMLParagraphElement>(null)
  const desktopActionsRef = useRef<HTMLDivElement>(null)
  const mobileActionsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const titleEls = [
        titleFrontRef.current,
        titleEndRef.current,
        titleDeveloperRef.current,
      ].filter((el): el is HTMLSpanElement => el !== null)
      const image = imageRef.current
      const portrait = portraitRef.current
      const bio = bioRef.current
      const availability = availabilityRef.current
      const actionsRoot = window.matchMedia("(min-width: 768px)").matches
        ? desktopActionsRef.current
        : mobileActionsRef.current
      const actions = actionsRoot
        ? gsap.utils.toArray<HTMLElement>(actionsRoot.children)
        : []

      if (
        titleEls.length === 0 ||
        !availability ||
        !image ||
        !portrait ||
        !bio ||
        actions.length === 0
      )
        return

      // "Front" and "end" share the first line, "Developer" is the second
      const titleLine = (index: number) => (index < 2 ? 0 : 1)

      gsap.set(titleEls, textRevealFrom(titleLine))
      // The portrait is masked in from the bottom, like the title lines
      gsap.set(image, { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" })
      gsap.set(portrait, { scale: 1.25, transformOrigin: "50% 100%" })
      gsap.set(bio, { opacity: 0 })
      gsap.set(availability, { autoAlpha: 0, y: 12 })
      gsap.set(actions, { autoAlpha: 0, y: 16 })

      if (!opened) return

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(titleEls, textRevealTo)
        gsap.set(image, { clipPath: "inset(0% 0% 0% 0%)" })
        gsap.set(portrait, { scale: 1 })
        gsap.set(bio, { opacity: 1 })
        gsap.set(actions, { autoAlpha: 1, y: 0 })
        gsap.set(availability, { autoAlpha: 1, y: 0 })
        return
      }

      const textEase = ensureTextRevealEase()
      const bioLines = SplitText.create(bio, {
        type: "lines",
        mask: "lines",
        tag: "span",
        linesClass: "text-reveal-line",
        // Lines keep whole words, so screen readers read them as-is; the default
        // aria-label it would add is not allowed on <p>.
        aria: "none",
      }).lines
      gsap.set(bioLines, textRevealFrom())
      gsap.set(bio, { opacity: 1 })

      // Starts once the loader has opened the page, then reveals the hero top to
      // bottom, one piece after another (see REVEAL_AT).
      const firstLine = titleEls.filter((_, i) => titleLine(i) === 0)
      const secondLine = titleEls.filter((_, i) => titleLine(i) === 1)
      gsap
        .timeline({ defaults: { ease: textEase } })
        .to(
          availability,
          { autoAlpha: 1, y: 0, duration: 0.7 },
          REVEAL_AT.badge
        )
        .to(
          firstLine,
          { ...textRevealTo, duration: TEXT_REVEAL_DURATION * 1.1 },
          REVEAL_AT.firstLine
        )
        .to(
          secondLine,
          { ...textRevealTo, duration: TEXT_REVEAL_DURATION * 1.1 },
          REVEAL_AT.secondLine
        )
        .to(
          image,
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 },
          REVEAL_AT.portrait
        )
        .to(portrait, { scale: 1, duration: 1.2 }, REVEAL_AT.portrait)
        .to(
          bioLines,
          {
            ...textRevealTo,
            duration: TEXT_REVEAL_DURATION,
            stagger: TEXT_REVEAL_STAGGER,
          },
          REVEAL_AT.bio
        )
        .to(
          actions,
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 },
          REVEAL_AT.actions
        )
    },
    { dependencies: [opened], revertOnUpdate: true }
  )

  // Scrolling out: the hero sinks at half speed and fades while the next section covers it
  useGSAP(
    () => {
      const section = sectionRef.current
      const content = contentRef.current
      if (!section || !content) return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        onUpdate: ({ progress }) => {
          const fade = gsap.utils.clamp(
            0,
            1,
            (progress - FADE_START) / (FADE_END - FADE_START)
          )
          gsap.set(content, {
            y: progress * section.offsetHeight * PARALLAX_AMOUNT,
            opacity: 1 - fade,
            force3D: true,
          })
        },
        onLeaveBack: () =>
          gsap.set(content, { clearProps: "transform,opacity" }),
      })
    },
    { scope: sectionRef }
  )

  // Hook: the title letters swell toward the cursor on the variable weight axis,
  // and one wave runs through them after the reveal to hint that they respond.
  useGSAP(
    () => {
      const section = sectionRef.current
      const words = [
        titleFrontRef.current,
        titleEndRef.current,
        titleDeveloperRef.current,
      ].filter((el): el is HTMLSpanElement => el !== null)
      if (!opened || !section || words.length === 0) return
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      const chars = words.flatMap(
        (word) =>
          SplitText.create(word, { type: "chars", tag: "span", aria: "none" })
            .chars as HTMLElement[]
      )
      gsap.set(chars, { "--w": WEIGHT.rest })

      const wave = gsap.to(chars, {
        keyframes: [
          { "--w": WEIGHT.peak, duration: 0.35, ease: "power2.out" },
          { "--w": WEIGHT.rest, duration: 0.6, ease: "power2.inOut" },
        ],
        stagger: 0.035,
        // After the whole entrance has played: changing letter weights re-lays out the
        // big title every frame, which made the text and buttons stutter as they came in.
        delay: REVEAL_AT.actions + 1.1,
      })

      if (!window.matchMedia("(pointer: fine)").matches) return

      const setters = chars.map((char) =>
        gsap.quickTo(char, "--w", { duration: 0.5, ease: "power3.out" })
      )

      // Letter centres are measured once (page coordinates) and only re-measured after a
      // resize. Reading every letter's box on each pointer move forced a layout per event
      // while the weights were animating, which made the hero stutter.
      let centers: { x: number; y: number }[] = []
      let reach = 0
      const measure = () => {
        reach = parseFloat(getComputedStyle(words[0]).fontSize) * WEIGHT_REACH
        centers = chars.map((char) => {
          const box = char.getBoundingClientRect()
          return {
            x: box.left + box.width / 2 + window.scrollX,
            y: box.top + box.height / 2 + window.scrollY,
          }
        })
      }

      // At most one update per frame, however fast pointer events arrive.
      let frame = 0
      let px = 0
      let py = 0
      const update = () => {
        frame = 0
        if (!centers.length) measure()
        const x = px + window.scrollX
        const y = py + window.scrollY
        centers.forEach((c, i) => {
          const t = Math.max(0, 1 - Math.hypot(x - c.x, y - c.y) / reach)
          setters[i](WEIGHT.rest + (WEIGHT.peak - WEIGHT.rest) * t * t)
        })
      }

      const onMove = (e: PointerEvent) => {
        wave.progress(1)
        px = e.clientX
        py = e.clientY
        if (!frame) frame = requestAnimationFrame(update)
      }
      const onLeave = () => {
        cancelAnimationFrame(frame)
        frame = 0
        setters.forEach((set) => set(WEIGHT.rest))
      }
      const onResize = () => {
        centers = []
      }

      section.addEventListener("pointermove", onMove)
      section.addEventListener("pointerleave", onLeave)
      window.addEventListener("resize", onResize)
      return () => {
        cancelAnimationFrame(frame)
        section.removeEventListener("pointermove", onMove)
        section.removeEventListener("pointerleave", onLeave)
        window.removeEventListener("resize", onResize)
      }
    },
    { dependencies: [opened], scope: sectionRef, revertOnUpdate: true }
  )

  // Pointer depth: the portrait leans toward the cursor, the title drifts away
  useGSAP(
    () => {
      const section = sectionRef.current
      const portrait = section?.querySelector<HTMLElement>("[data-tilt]")
      const glare = section?.querySelector<HTMLElement>("[data-glare]")
      if (!section || !portrait || !glare) return
      if (
        !window.matchMedia("(pointer: fine)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return
      }

      const follow = { duration: 0.9, ease: "power3.out" }
      const layers = gsap.utils
        .toArray<HTMLElement>("[data-depth]", section)
        .map((el) => ({
          depth: Number(el.dataset.depth),
          x: gsap.quickTo(el, "x", follow),
          y: gsap.quickTo(el, "y", follow),
        }))
      gsap.set(portrait, { transformPerspective: 700 })
      const tiltX = gsap.quickTo(portrait, "rotationX", follow)
      const tiltY = gsap.quickTo(portrait, "rotationY", follow)

      const move = (nx: number, ny: number) => {
        layers.forEach((layer) => {
          layer.x(nx * DRIFT.x * layer.depth)
          layer.y(ny * DRIFT.y * layer.depth)
        })
        tiltY(nx * TILT)
        tiltX(-ny * TILT)
      }

      // Reused setters for the glare position: creating a new tween on every pointer
      // event piled up hundreds of tweens per second.
      // GSAP doesn't add units to CSS variables, so tween plain numbers and write the %.
      const glarePos = { x: 50, y: 50 }
      const paintGlare = () => {
        glare.style.setProperty("--gx", `${glarePos.x}%`)
        glare.style.setProperty("--gy", `${glarePos.y}%`)
      }
      const glareX = gsap.quickTo(glarePos, "x", { ...follow, onUpdate: paintGlare })
      const glareY = gsap.quickTo(glarePos, "y", { ...follow, onUpdate: paintGlare })
      let glareShown = false

      // Read layout once per frame at most, not once per pointer event.
      let frame = 0
      let px = 0
      let py = 0
      const update = () => {
        frame = 0
        const rect = section.getBoundingClientRect()
        const nx = ((px - rect.left) / rect.width - 0.5) * 2
        const ny = ((py - rect.top) / rect.height - 0.5) * 2
        move(gsap.utils.clamp(-1, 1, nx), gsap.utils.clamp(-1, 1, ny))

        // The glare sits where the cursor would hit the photo
        const box = portrait.getBoundingClientRect()
        glareX(((px - box.left) / box.width) * 100)
        glareY(((py - box.top) / box.height) * 100)
        if (!glareShown) {
          glareShown = true
          gsap.to(glare, { autoAlpha: 1, ...follow, overwrite: "auto" })
        }
      }

      const onMove = (e: PointerEvent) => {
        px = e.clientX
        py = e.clientY
        if (!frame) frame = requestAnimationFrame(update)
      }

      const onLeave = () => {
        cancelAnimationFrame(frame)
        frame = 0
        move(0, 0)
        glareShown = false
        gsap.to(glare, { autoAlpha: 0, ...follow, overwrite: "auto" })
      }

      section.addEventListener("pointermove", onMove)
      section.addEventListener("pointerleave", onLeave)
      return () => {
        cancelAnimationFrame(frame)
        section.removeEventListener("pointermove", onMove)
        section.removeEventListener("pointerleave", onLeave)
      }
    },
    { scope: sectionRef }
  )

  return (
    <section ref={sectionRef} id="hero" className="scroll-mt-24">
      <div
        ref={contentRef}
        className="relative pt-32 pb-10 will-change-transform md:pt-36 lg:pt-36"
      >
        <div className="main-container">
          <div className="flex flex-col items-center gap-9 md:gap-11">
            <HeroAvailabilityBadge ref={availabilityRef} />

            <h1
              aria-label="Frontend developer"
              className="text-center [font-family:var(--font-aspekta-variable)]! font-semibold text-[clamp(3.5rem,15vw,5.25rem)] leading-[0.92] tracking-[-0.055em] text-background-1 md:text-aspekta-heading-3 md:leading-[0.92] lg:text-aspekta-heading-2 lg:leading-[0.92] xl:text-[min(10.5rem,17vh)] xl:leading-[0.92] [&_span]:[font-variation-settings:'wght'_var(--w,600)]"
            >
              <span className="flex justify-center">
                <span
                  data-depth="-0.5"
                  className="inline-block overflow-hidden pb-[0.06em]"
                >
                  <span ref={titleFrontRef} className="inline-block">
                    Front
                  </span>
                </span>
                <span
                  data-depth="-0.5"
                  className="inline-block overflow-hidden pb-[0.06em]"
                >
                  <span ref={titleEndRef} className="inline-block">
                    end
                  </span>
                </span>
              </span>
              <span className="flex items-center justify-center gap-[0.14em]">
                <span
                  data-depth="-0.3"
                  className="inline-block overflow-hidden pb-[0.06em]"
                >
                  <span ref={titleDeveloperRef} className="inline-block">
                    developer
                  </span>
                </span>
                <span
                  data-depth="1"
                  data-tilt
                  className="relative inline-block size-[0.74em] shrink-0 translate-y-[0.02em]"
                >
                  <span
                    ref={imageRef}
                    className="relative block size-full overflow-hidden rounded-[0.14em] opacity-0"
                  >
                    <Image
                      ref={portraitRef}
                      src="/images/hero-portrait.jpg"
                      alt={`Portrait of ${profile.name}`}
                      width={224}
                      height={224}
                      priority
                      className="size-full object-cover"
                    />
                    <span
                      data-glare
                      aria-hidden
                      className="pointer-events-none invisible absolute inset-0 bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),rgb(255_255_255/0.35),transparent_55%)] opacity-0"
                    />
                  </span>
                </span>
              </span>
            </h1>

            <p
              ref={bioRef}
              data-text-reveal
              className="mx-auto max-w-[34rem] text-center font-aspekta-400 text-[1.125rem] leading-[1.55] tracking-[-0.01em] text-background-1/75 md:text-[1.3125rem]"
            >
              Hi, I&apos;m {profile.name}. I build fast, considered
              interfaces at{" "}
              <a
                href={profile.company.href}
                data-preview="company"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background-1 underline decoration-background-1/25 decoration-1 underline-offset-[0.22em] transition-colors hover:decoration-background-1"
              >
                {profile.company.name}
              </a>
              , and tools for other developers.
            </p>

            {/* Hover preview of the company site — shown once a screenshot is set in profile.company.preview */}
            {profile.company.preview && (
              <HeroLinkPreview
                selector='[data-preview="company"]'
                src={profile.company.preview}
                alt={`${profile.company.name} homepage`}
              />
            )}

            <HeroDesktopAction ref={desktopActionsRef} />
            <HeroMobileAction ref={mobileActionsRef} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
