"use client"

import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRef } from "react"

gsap.registerPlugin(useGSAP)

type As = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"

type KineticTextProps = Readonly<{
  text: string
  as?: As
  className?: string
  style?: React.CSSProperties
}>

const REST_WEIGHT = 300
const DURATION = 0.4
const EASE = "power3.out"
const PAD_ACTIVE = "0.0833em"
const PAD_REST = "0em"
const STROKE_REST = "0.0208em"
const STROKE_ACTIVE = "0.0417em"

const weightForDistance = (dist: number) => {
  if (dist === 0) return 900
  if (dist === 1) return 600
  if (dist === 2) return 400
  return REST_WEIGHT
}

export const KineticText = ({
  text,
  as: Tag = "p",
  className,
  style,
}: KineticTextProps) => {
  const rootRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current
      if (!root || !contextSafe) return

      const letters = gsap.utils.toArray<HTMLElement>(
        "[data-kinetic-letter]",
        root
      )

      gsap.set(letters, {
        fontWeight: REST_WEIGHT,
        paddingLeft: PAD_REST,
        paddingRight: PAD_REST,
        webkitTextStrokeColor: "transparent",
        webkitTextStrokeWidth: STROKE_REST,
      })

      const mm = gsap.matchMedia()
      mm.add(
        {
          canHover: "(hover: hover) and (pointer: fine)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const canHover = Boolean(ctx.conditions?.canHover)
          const reduceMotion = Boolean(ctx.conditions?.reduceMotion)
          if (!canHover || reduceMotion) return

          const apply = (active: number | null) => {
            letters.forEach((letter, i) => {
              const dist =
                active === null
                  ? Number.POSITIVE_INFINITY
                  : Math.abs(i - active)

              gsap.to(letter, {
                fontWeight: weightForDistance(dist),
                paddingLeft: dist <= 1 ? PAD_ACTIVE : PAD_REST,
                paddingRight: dist <= 1 ? PAD_ACTIVE : PAD_REST,
                webkitTextStrokeColor:
                  dist === 0 ? "currentColor" : "transparent",
                webkitTextStrokeWidth: dist === 0 ? STROKE_ACTIVE : STROKE_REST,
                duration: DURATION,
                ease: EASE,
                overwrite: "auto",
              })
            })
          }

          const onLetterEnter = contextSafe((event: Event) => {
            const index = Number(
              (event.currentTarget as HTMLElement).dataset.kineticIndex
            )
            if (Number.isNaN(index)) return
            apply(index)
          })

          const onRootLeave = contextSafe(() => apply(null))

          letters.forEach((letter) => {
            letter.addEventListener("mouseenter", onLetterEnter)
          })
          root.addEventListener("mouseleave", onRootLeave)

          return () => {
            letters.forEach((letter) => {
              letter.removeEventListener("mouseenter", onLetterEnter)
            })
            root.removeEventListener("mouseleave", onRootLeave)
          }
        }
      )

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <Tag
      className={cn(
        "flex flex-nowrap font-aspekta-variable font-light",
        className
      )}
      style={style}
    >
      <span ref={rootRef} aria-hidden className="flex flex-nowrap">
        {text.split("").map((letter, i) => (
          <span
            key={`${letter}-${i}`}
            data-kinetic-letter
            data-kinetic-index={i}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </Tag>
  )
}
