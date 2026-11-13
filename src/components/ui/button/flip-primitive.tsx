"use client"

import { FlipPrimitiveProvider } from "@/components/ui/button/flip-primitive-context"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react"

gsap.registerPlugin(useGSAP)

const FLIP_DURATION = 0.45
const FLIP_EASE = "power3.out"

export type FlipDirection = "top" | "bottom" | "left" | "right"

type FlipButtonOwnProps = {
  from?: FlipDirection
  tapScale?: number
  asChild?: boolean
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export type FlipButtonProps = Readonly<
  FlipButtonOwnProps &
    Omit<ComponentPropsWithoutRef<"button">, keyof FlipButtonOwnProps>
>

const rootClassName =
  "relative inline-grid cursor-pointer place-items-center appearance-none border-0 bg-transparent p-0 no-underline shadow-none outline-none ring-0 perspective-[1000px] focus-visible:outline-none"

const reducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

const faceOffset = (from: FlipDirection, face: "front" | "back") => {
  const positive = from === "top" || from === "left"
  if (face === "front") return positive ? 50 : -50
  return positive ? -50 : 50
}

const faceVars = (
  from: FlipDirection,
  face: "front" | "back",
  hovered: boolean
) => {
  const isVertical = from === "top" || from === "bottom"
  const visible = face === "front" ? !hovered : hovered
  const offset = visible ? 0 : faceOffset(from, face)
  const rotation = visible ? 0 : 90

  return {
    autoAlpha: visible ? 1 : 0,
    rotationX: isVertical ? rotation : 0,
    rotationY: isVertical ? 0 : rotation,
    yPercent: isVertical ? offset : 0,
    xPercent: isVertical ? 0 : offset,
  }
}

export const FlipButton = ({
  from = "top",
  tapScale = 0.95,
  asChild = false,
  className,
  style,
  children,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onBlur,
  onFocus,
  ...props
}: FlipButtonProps) => {
  const rootRef = useRef<HTMLElement>(null)
  const frontRef = useRef<HTMLElement>(null)
  const backRef = useRef<HTMLElement>(null)

  const { contextSafe } = useGSAP(
    () => {
      const front = frontRef.current
      const back = backRef.current
      if (!front || !back) return

      gsap.set(front, {
        transformOrigin: "center center",
        force3D: true,
        ...faceVars(from, "front", false),
      })
      gsap.set(back, {
        transformOrigin: "center center",
        force3D: true,
        ...faceVars(from, "back", false),
      })
    },
    { scope: rootRef, dependencies: [from] }
  )

  // contextSafe only wraps the handler; refs are read when it runs on hover, not during render.
  // eslint-disable-next-line react-hooks/refs
  const flip = contextSafe((hovered: boolean) => {
    const front = frontRef.current
    const back = backRef.current
    if (!front || !back) return

    const duration = reducedMotion() ? 0 : FLIP_DURATION

    gsap.to(front, {
      ...faceVars(from, "front", hovered),
      duration,
      ease: FLIP_EASE,
      overwrite: "auto",
    })
    gsap.to(back, {
      ...faceVars(from, "back", hovered),
      duration,
      ease: FLIP_EASE,
      overwrite: "auto",
    })
  })

  // eslint-disable-next-line react-hooks/refs
  const press = contextSafe((pressed: boolean) => {
    const root = rootRef.current
    if (!root) return

    gsap.to(root, {
      scale: pressed ? tapScale : 1,
      duration: reducedMotion() ? 0 : 0.16,
      ease: "power2.out",
      overwrite: "auto",
    })
  })

  const isDisabled = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false
    return (
      target.hasAttribute("disabled") ||
      target.getAttribute("aria-disabled") === "true"
    )
  }

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    onPointerEnter?.(event as PointerEvent<HTMLButtonElement>)
    if (isDisabled(event.currentTarget)) return
    flip(true)
  }

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    onPointerLeave?.(event as PointerEvent<HTMLButtonElement>)
    flip(false)
    press(false)
  }

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    onPointerDown?.(event as PointerEvent<HTMLButtonElement>)
    if (isDisabled(event.currentTarget)) return
    press(true)
  }

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    onPointerUp?.(event as PointerEvent<HTMLButtonElement>)
    press(false)
  }

  const handlePointerCancel = (event: PointerEvent<HTMLElement>) => {
    onPointerCancel?.(event as PointerEvent<HTMLButtonElement>)
    press(false)
  }

  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    onFocus?.(event as FocusEvent<HTMLButtonElement>)
    if (isDisabled(event.currentTarget)) return
    flip(true)
  }

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    onBlur?.(event as FocusEvent<HTMLButtonElement>)
    flip(false)
  }

  const rootProps = {
    "data-slot": "flip-button",
    className: cn(rootClassName, className),
    style,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
    onFocus: handleFocus,
    onBlur: handleBlur,
    ...props,
  }

  return (
    <FlipPrimitiveProvider value={{ frontRef, backRef }}>
      {asChild ? (
        <Slot ref={rootRef} {...rootProps}>
          {children}
        </Slot>
      ) : (
        <button
          ref={rootRef as RefObject<HTMLButtonElement>}
          type="button"
          {...rootProps}
        >
          {children}
        </button>
      )}
    </FlipPrimitiveProvider>
  )
}
