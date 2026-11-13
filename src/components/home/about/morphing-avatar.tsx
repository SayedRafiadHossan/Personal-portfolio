"use client"

import gsap from "gsap"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import { useImperativeHandle, useRef, type Ref } from "react"

import { avatarShapes } from "./avatar-shapes"

gsap.registerPlugin(MorphSVGPlugin)

export type MorphingAvatarHandle = {
  /** Morph to the avatar for `index`. The first call also reveals it. */
  morphTo: (index: number, immediate: boolean) => void
}

const MORPH_EASE = "expo.inOut"

const eyeClass =
  "fill-background-2 [transform-box:fill-box] [transform-origin:center] motion-safe:animate-blink"

/** One avatar whose body and eyes morph between the about slides' shapes. */
export const MorphingAvatar = ({ ref }: { ref: Ref<MorphingAvatarHandle> }) => {
  const rootRef = useRef<SVGSVGElement>(null)
  const bodyRef = useRef<SVGPathElement>(null)
  const eyeRefs = useRef<(SVGPathElement | null)[]>([])
  const currentRef = useRef(-1)

  useImperativeHandle(
    ref,
    () => ({
      morphTo: (index, immediate) => {
        const shape = avatarShapes[index]
        const root = rootRef.current
        const body = bodyRef.current
        if (!shape || !root || !body || index === currentRef.current) return

        const first = currentRef.current === -1
        currentRef.current = index
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
        const duration = immediate || reduceMotion ? 0 : 1

        if (first) {
          gsap.fromTo(
            root,
            { autoAlpha: 0, scale: 0.9, y: 24 },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: duration ? 0.8 : 0,
              ease: "power3.out",
              transformOrigin: "50% 50%",
            }
          )
        }

        gsap.to(body, {
          morphSVG: { shape: shape.body, type: "rotational" },
          duration,
          ease: MORPH_EASE,
          overwrite: "auto",
        })
        shape.eyes.forEach((eye, i) => {
          const el = eyeRefs.current[i]
          if (!el) return
          gsap.to(el, {
            morphSVG: eye,
            duration,
            ease: MORPH_EASE,
            overwrite: "auto",
          })
        })

        // Squash on the way through, then settle with a little wobble.
        if (!first && duration) {
          gsap
            .timeline({ defaults: { overwrite: "auto" } })
            .to(root, {
              scaleX: 1.06,
              scaleY: 0.94,
              rotation: index % 2 ? 4 : -4,
              duration: 0.45,
              ease: "power2.out",
              transformOrigin: "50% 60%",
            })
            .to(root, {
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              duration: 0.9,
              ease: "elastic.out(1, 0.45)",
            })
        }
      },
    }),
    []
  )

  const initial = avatarShapes[0]

  return (
    <svg
      ref={rootRef}
      viewBox="-125 -125 250 250"
      className="absolute inset-0 size-full opacity-0"
      aria-hidden
    >
      <path ref={bodyRef} d={initial.body} className="fill-[#0a0a0c]" />
      {initial.eyes.map((eye, i) => (
        <path
          key={i}
          ref={(el) => {
            eyeRefs.current[i] = el
          }}
          d={eye}
          className={eyeClass}
        />
      ))}
    </svg>
  )
}
