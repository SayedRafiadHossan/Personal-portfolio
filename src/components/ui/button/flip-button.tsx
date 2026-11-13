"use client"

import { FlipButtonProvider } from "@/components/ui/button/flip-button-context"
import type { ButtonVariantProps } from "@/components/ui/button/button-variants"
import {
  FlipButton as FlipButtonPrimitive,
  type FlipButtonProps as FlipButtonPrimitiveProps,
} from "@/components/ui/button/flip-primitive"

export type FlipButtonProps = Readonly<
  FlipButtonPrimitiveProps & ButtonVariantProps
>

export const FlipButton = ({ variant, size, ...props }: FlipButtonProps) => {
  return (
    <FlipButtonProvider value={{ variant, size }}>
      <FlipButtonPrimitive {...props} />
    </FlipButtonProvider>
  )
}
