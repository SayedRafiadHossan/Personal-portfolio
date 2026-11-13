"use client"

import { useFlipPrimitive } from "@/components/ui/button/flip-primitive-context"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react"

type FlipFaceOwnProps = {
  asChild?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export type FlipButtonFaceProps = Readonly<
  FlipFaceOwnProps &
    Omit<ComponentPropsWithoutRef<"span">, keyof FlipFaceOwnProps>
>

type FlipFaceProps = FlipButtonFaceProps &
  Readonly<{
    face: "front" | "back"
  }>

const faceClassName =
  "col-start-1 row-start-1 inline-flex w-full items-center justify-center will-change-transform"

export const FlipFace = ({
  face,
  asChild = false,
  className,
  style,
  children,
  ...props
}: FlipFaceProps) => {
  const { frontRef, backRef } = useFlipPrimitive()
  const faceRef = face === "front" ? frontRef : backRef
  const hiddenUntilHover = face === "back"

  const faceProps = {
    ref: faceRef,
    "data-slot": `flip-button-${face}`,
    className: cn(
      faceClassName,
      hiddenUntilHover ? "pointer-events-none opacity-0" : "opacity-100",
      className
    ),
    style,
    ...props,
  }

  const Face = asChild ? Slot : "span"

  return <Face {...faceProps}>{children}</Face>
}
