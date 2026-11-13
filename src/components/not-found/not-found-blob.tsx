"use client"

import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRef } from "react"

gsap.registerPlugin(useGSAP)

const BLOB_PATH =
  "M91.82 0.31C93.12 3.3 94.14 6.48 94.83 9.67C95.53 12.86 95.91 16.18 95.97 19.44C96.03 22.7 95.76 26.03 95.19 29.25C94.61 32.46 93.7 35.67 92.51 38.71C91.32 41.74 89.8 44.72 88.05 47.46C86.29 50.21 84.22 52.82 81.96 55.17C79.71 57.52 77.17 59.68 74.5 61.54C71.83 63.4 68.92 65.02 65.94 66.32C62.96 67.61 59.79 68.64 56.62 69.32C53.44 70.01 49.53 69.26 46.88 70.44C44.23 71.62 42.92 74.56 40.72 76.4C38.53 78.24 36.17 79.97 33.71 81.49C31.26 83.02 28.65 84.39 25.98 85.55C23.31 86.71 20.51 87.69 17.69 88.45C14.87 89.2 11.95 89.76 9.04 90.09C6.14 90.43 3.17 90.55 0.24 90.45C-2.68 90.35 -5.63 90.03 -8.5 89.51C-11.37 88.98 -14.23 88.24 -16.98 87.3C-19.73 86.37 -22.43 85.21 -25 83.9C-27.56 82.58 -30.02 81.02 -32.37 79.41C-34.72 77.8 -36.35 75.13 -39.1 74.26C-41.86 73.39 -45.65 74.52 -48.9 74.2C-52.14 73.87 -55.43 73.24 -58.59 72.33C-61.74 71.41 -64.87 70.18 -67.82 68.69C-70.77 67.2 -73.63 65.41 -76.27 63.39C-78.9 61.38 -81.39 59.08 -83.61 56.6C-85.83 54.13 -87.86 51.4 -89.59 48.55C-91.32 45.71 -92.82 42.65 -93.99 39.53C-95.17 36.41 -96.07 33.12 -96.65 29.84C-97.24 26.56 -97.52 23.17 -97.49 19.84C-97.46 16.51 -97.11 13.13 -96.47 9.88C-95.83 6.62 -94.88 3.38 -93.66 0.31C-92.44 -2.76 -90.92 -5.76 -89.17 -8.54C-87.43 -11.32 -85.39 -13.97 -83.19 -16.37C-80.99 -18.76 -77.91 -20.72 -75.97 -22.92C-74.03 -25.12 -72.41 -27.08 -71.56 -29.57C-70.71 -32.07 -71.34 -35.14 -70.87 -37.88C-70.4 -40.62 -69.69 -43.37 -68.74 -46C-67.8 -48.63 -66.61 -51.23 -65.22 -53.67C-63.83 -56.1 -62.2 -58.46 -60.4 -60.62C-58.6 -62.78 -56.58 -64.81 -54.43 -66.62C-52.28 -68.43 -49.93 -70.07 -47.5 -71.47C-45.07 -72.87 -42.47 -74.08 -39.84 -75.02C-37.2 -75.97 -34.45 -76.7 -31.7 -77.17C-28.95 -77.63 -26.12 -77.86 -23.35 -77.84C-20.58 -77.82 -17.78 -77.55 -15.07 -77.06C-12.37 -76.56 -9.68 -75.81 -7.13 -74.87C-4.57 -73.93 -2.08 -72.74 0.24 -71.4C2.57 -70.06 4.69 -67.98 6.82 -66.81C8.95 -65.63 10.76 -64.34 13.04 -64.33C15.32 -64.32 17.94 -66.16 20.49 -66.74C23.03 -67.31 25.69 -67.67 28.32 -67.78C30.95 -67.89 33.64 -67.77 36.26 -67.39C38.88 -67.02 41.53 -66.4 44.05 -65.56C46.57 -64.71 49.06 -63.61 51.4 -62.32C53.73 -61.02 55.99 -59.48 58.05 -57.77C60.11 -56.06 62.06 -54.13 63.77 -52.07C65.49 -50.02 67.05 -47.76 68.37 -45.42C69.68 -43.08 70.8 -40.58 71.66 -38.05C72.53 -35.51 73.17 -32.85 73.57 -30.2C73.96 -27.56 72.83 -24.58 74.01 -22.17C75.2 -19.77 78.51 -18.08 80.68 -15.76C82.85 -13.45 85.18 -10.96 87.04 -8.28C88.89 -5.6 90.52 -2.68 91.82 0.31Z"

const LEFT_EYE_PATH =
  "M-10.5 -9.5A10.5 10.5 0 0 1 0 -20L0 -20A10.5 10.5 0 0 1 10.5 -9.5L10.5 9.5A10.5 10.5 0 0 1 0 20L0 20A10.5 10.5 0 0 1 -10.5 9.5Z"

const RIGHT_EYE_PATH =
  "M-11 0A7.5 7.5 0 0 1 -3.5 -7.5L3.5 -7.5A7.5 7.5 0 0 1 11 0L11 0A7.5 7.5 0 0 1 3.5 7.5L-3.5 7.5A7.5 7.5 0 0 1 -11 0Z"

type NotFoundBlobProps = Readonly<{
  className?: string
}>

export const NotFoundBlob = ({ className }: NotFoundBlobProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const characterRef = useRef<SVGGElement>(null)
  const leftEyeRef = useRef<SVGGElement>(null)
  const rightEyeRef = useRef<SVGGElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const svg = svgRef.current
      const character = characterRef.current
      const leftEye = leftEyeRef.current
      const rightEye = rightEyeRef.current
      if (!svg || !character || !leftEye || !rightEye || !contextSafe) return

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return
      }

      gsap.set(character, { transformOrigin: "50% 50%" })
      gsap.set(leftEye, { transformOrigin: "50% 50%" })
      gsap.set(rightEye, { transformOrigin: "50% 50%" })

      const breathe = () => {
        const time = gsap.ticker.time
        gsap.set(character, {
          scaleX: 1 + Math.sin(time * 0.85) * 0.045,
          scaleY: 1 + Math.cos(time * 0.62) * 0.04,
          rotation: Math.sin(time * 0.35) * 2.4,
        })
      }

      gsap.ticker.add(breathe)

      const leftX = gsap.quickTo(leftEye, "x", {
        duration: 0.4,
        ease: "power3.out",
      })
      const leftY = gsap.quickTo(leftEye, "y", {
        duration: 0.4,
        ease: "power3.out",
      })
      const rightX = gsap.quickTo(rightEye, "x", {
        duration: 0.4,
        ease: "power3.out",
      })
      const rightY = gsap.quickTo(rightEye, "y", {
        duration: 0.4,
        ease: "power3.out",
      })

      const lookAt = contextSafe((clientX: number, clientY: number) => {
        const bounds = svg.getBoundingClientRect()
        const dx = (clientX - (bounds.left + bounds.width / 2)) / bounds.width
        const dy = (clientY - (bounds.top + bounds.height / 2)) / bounds.height
        const x = gsap.utils.clamp(-7, 7, dx * 12)
        const y = gsap.utils.clamp(-6, 6, dy * 10)
        leftX(x)
        leftY(y)
        rightX(x * 0.85)
        rightY(y * 0.85)
      })

      const onPointerMove = (event: PointerEvent) => {
        lookAt(event.clientX, event.clientY)
      }

      window.addEventListener("pointermove", onPointerMove, { passive: true })

      const blink = contextSafe(() => {
        gsap.to([leftEye, rightEye], {
          scaleY: 0.12,
          duration: 0.08,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
          overwrite: "auto",
        })
      })

      const scheduleBlink = contextSafe(() => {
        blink()
        gsap.delayedCall(2.6 + Math.random() * 2.2, scheduleBlink)
      })

      const blinkCall = gsap.delayedCall(2.4, scheduleBlink)

      return () => {
        gsap.ticker.remove(breathe)
        window.removeEventListener("pointermove", onPointerMove)
        blinkCall.kill()
      }
    },
    { scope: svgRef }
  )

  return (
    <svg
      ref={svgRef}
      viewBox="-125 -125 250 250"
      role="img"
      aria-label="Animated blob"
      className={cn(
        "mx-auto size-[min(30rem,46vw)] overflow-visible",
        className
      )}
    >
      <g ref={characterRef}>
        <path d={BLOB_PATH} fill="#0a0a0c" />
        <g ref={leftEyeRef}>
          <path
            d={LEFT_EYE_PATH}
            transform="matrix(0.99,-0.11,0.1,0.99,-13.39,10.92)"
            fill="#fff"
          />
        </g>
        <g ref={rightEyeRef}>
          <path
            d={RIGHT_EYE_PATH}
            transform="matrix(0.86,-0.04,0.1,0.99,28.62,7.95)"
            fill="#fff"
          />
        </g>
      </g>
    </svg>
  )
}
