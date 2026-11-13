"use client"

// Adapted from Tween UI's Cube Roll Item block (MIT):
// https://tween-ui.vercel.app/block/cube-roll-item

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
} from "react"

import { usePreloaderReady } from "@/components/preloader/preloader"
import { contactChannels, type ContactChannel } from "@/data/data"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** The roll follows the pointer — skip it on touch, where there is no hover. */
const canHover = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches

/** Keyboard focus rolls the row; a mouse click that happens to focus it does not. */
const isFocusVisible = (el: HTMLElement) => {
  try {
    return el.matches(":focus-visible")
  } catch {
    return true
  }
}

/** Settles a touch past the face, like a drum clicking into its detent. */
const ROLL_EASE = "back.out(1.6)"

/**
 * Each row is a four-sided drum turning on its X axis. Front and back carry the
 * resting face, top and bottom the filled one — so every quarter turn lands on
 * the opposite state, and the drum can keep rolling the way the pointer moves.
 * `--depth` matches the row height, which makes the drum a true square prism.
 */
const FACE_TRANSFORM = {
  front: "[transform:translateZ(calc(var(--depth)/2))]",
  back: "[transform:rotateX(180deg)_translateZ(calc(var(--depth)/2))]",
  top: "[transform:rotateX(90deg)_translateZ(calc(var(--depth)/2))]",
  bottom: "[transform:rotateX(-90deg)_translateZ(calc(var(--depth)/2))]",
} as const

type Side = keyof typeof FACE_TRANSFORM

const SIDES: Side[] = ["front", "back", "top", "bottom"]

const ArrowIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-6">
    <path
      d={filled ? "M4 12h15M13 6l6 6-6 6" : "M7 17 17 7M8 7h9v9"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

type FaceProps = Readonly<{
  side: Side
  channel: ContactChannel
  number: string
  copied: boolean
}>

function Face({ side, channel, number, copied }: FaceProps) {
  const filled = side === "top" || side === "bottom"

  return (
    <div
      data-roll-face={side}
      aria-hidden={side === "front" ? undefined : true}
      className={cn(
        "absolute inset-0 backface-hidden",
        FACE_TRANSFORM[side],
        filled
          ? "bg-background-1 text-background-2"
          : "bg-background-2 text-background-1"
      )}
    >
      <div className="grid h-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-4 px-3 md:grid-cols-[3rem_minmax(0,1fr)_auto] md:px-4">
        {/* Plain concatenation: tailwind-merge would drop the custom size class. */}
        <span
          className={`font-instrument-serif text-instrument-heading-6 italic ${
            filled ? "text-background-2/50" : "text-background-1/40"
          }`}
        >
          {number}
        </span>
        <span className="min-w-0">
          <span className="block font-aspekta-700 text-aspekta-heading-9 uppercase lg:text-aspekta-heading-8">
            {channel.label}
          </span>
          <span className="mt-1 block truncate font-aspekta-400 text-tagline-2 opacity-60">
            {channel.value}
          </span>
        </span>
        {channel.copy ? (
          <span className="font-aspekta-600 text-tagline-3 tracking-[0.12em] uppercase">
            {copied ? "Copied ✓" : "Copy"}
          </span>
        ) : (
          <ArrowIcon filled={filled} />
        )}
      </div>
    </div>
  )
}

export const ContactChannels = () => {
  const ready = usePreloaderReady()
  const rootRef = useRef<HTMLDivElement>(null)
  /** Accumulated drum angle per row, in quarter turns of ±90°. */
  const anglesRef = useRef<number[]>(contactChannels.map(() => 0))
  const activeRef = useRef<boolean[]>(contactChannels.map(() => false))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [copied])

  useGSAP(
    () => {
      if (!ready || prefersReducedMotion()) return

      // Park every drum half a turn over with its back face blanked, so each
      // row starts as an empty slab, then flip them in when the list scrolls in.
      const backContent = '[data-roll-face="back"] > *'
      gsap.set("[data-roll-rule]", { scaleX: 0 })
      gsap.set("[data-roll-drum]", { rotationX: 180 })
      gsap.set(backContent, { opacity: 0 })

      gsap
        .timeline({
          delay: 0.5,
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 85%",
            once: true,
          },
          onComplete: () => {
            gsap.set(backContent, { opacity: 1 })
          },
        })
        .to(
          "[data-roll-rule]",
          { scaleX: 1, duration: 0.9, ease: "expo.inOut", stagger: 0.15 },
          0
        )
        .to(
          "[data-roll-drum]",
          { rotationX: 0, duration: 0.9, ease: "power4.inOut", stagger: 0.15 },
          0.15
        )
    },
    { scope: rootRef, dependencies: [ready] }
  )

  /** Turn a row a quarter — downward when `down`, upward otherwise. */
  const turn = (
    target: HTMLElement,
    index: number,
    active: boolean,
    down: boolean
  ) => {
    if (activeRef.current[index] === active) return
    activeRef.current[index] = active

    const drum = target.querySelector("[data-roll-drum]")
    if (!drum) return
    // Hovered before the intro finished: the back face may still be blank.
    gsap.set(target.querySelectorAll('[data-roll-face="back"] > *'), {
      opacity: 1,
    })

    if (prefersReducedMotion()) {
      anglesRef.current[index] = active ? -90 : 0
      gsap.set(drum, { rotationX: anglesRef.current[index] })
      return
    }

    anglesRef.current[index] += down ? -90 : 90
    // `auto` only takes rotationX from this drum's intro flip, so hovering
    // mid-reveal leaves the other rows' flips running.
    gsap.to(drum, {
      rotationX: anglesRef.current[index],
      duration: active ? 0.6 : 0.7,
      ease: ROLL_EASE,
      overwrite: "auto",
    })
  }

  /** Did the pointer cross the top half of the row? */
  const fromTop = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return event.clientY < rect.top + rect.height / 2
  }

  const rollProps = (index: number) => ({
    className:
      "block size-full cursor-pointer text-left outline-none perspective-[1200px]",
    // Enter from the top and the drum rolls down; leave through the bottom
    // and it keeps rolling down rather than reversing.
    onMouseEnter: (event: MouseEvent<HTMLElement>) =>
      canHover() && turn(event.currentTarget, index, true, fromTop(event)),
    onMouseLeave: (event: MouseEvent<HTMLElement>) =>
      canHover() && turn(event.currentTarget, index, false, !fromTop(event)),
    onFocus: (event: FocusEvent<HTMLElement>) =>
      isFocusVisible(event.currentTarget) &&
      turn(event.currentTarget, index, true, true),
    onBlur: (event: FocusEvent<HTMLElement>) =>
      turn(event.currentTarget, index, false, true),
  })

  const copyEmail = async (channel: ContactChannel) => {
    try {
      await navigator.clipboard.writeText(channel.value)
      setCopied(true)
    } catch {
      window.location.assign(channel.href)
    }
  }

  return (
    <div ref={rootRef}>
      {/* No gap between rows, so the filled face covers the whole row edge to edge. */}
      <ul className="flex flex-col">
        {contactChannels.map((channel, index) => {
          const number = String(index + 1).padStart(2, "0")
          const drum = (
            <div className="relative size-full [transform:translateZ(calc(var(--depth)/-2))] transform-3d">
              {/* Under reduced motion the drum only snaps, so skip the layer promotion. */}
              <div
                data-roll-drum
                className="absolute inset-0 will-change-transform transform-3d motion-reduce:will-change-auto"
              >
                {SIDES.map((side) => (
                  <Face
                    key={side}
                    side={side}
                    channel={channel}
                    number={number}
                    copied={copied}
                  />
                ))}
              </div>
            </div>
          )

          return (
            <li
              key={channel.label}
              className="relative h-[5.25rem] overflow-y-clip [--depth:5.25rem] md:h-24 md:[--depth:6rem] lg:h-32 lg:[--depth:8rem]"
            >
              <span
                data-roll-rule
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px origin-left bg-background-1/15"
              />
              {channel.copy ? (
                <button
                  type="button"
                  aria-label={`Copy email address ${channel.value}`}
                  onClick={() => copyEmail(channel)}
                  {...rollProps(index)}
                >
                  {drum}
                </button>
              ) : (
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...rollProps(index)}
                >
                  {drum}
                </a>
              )}
            </li>
          )
        })}
      </ul>
      {/* Closing rule under the last row. */}
      <span
        data-roll-rule
        aria-hidden
        className="block h-px origin-left bg-background-1/15"
      />
      <span className="sr-only" aria-live="polite">
        {copied ? "Email copied" : ""}
      </span>
    </div>
  )
}
