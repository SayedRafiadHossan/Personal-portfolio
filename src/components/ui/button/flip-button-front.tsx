"use client"

import { useFlipButton } from "@/components/ui/button/flip-button-context"
import {
  buttonVariants,
  type ButtonVariantProps,
} from "@/components/ui/button/button-variants"
import {
  FlipButtonFront as FlipButtonFrontPrimitive,
  type FlipButtonFrontProps as FlipButtonFrontPrimitiveProps,
} from "@/components/ui/button/flip-primitive-front"
import { cn } from "@/lib/utils"

export type FlipButtonFrontProps = Readonly<
  FlipButtonFrontPrimitiveProps & ButtonVariantProps
>

export const FlipButtonFront = ({
  variant,
  size,
  className,
  ...props
}: FlipButtonFrontProps) => {
  const { variant: buttonVariant, size: buttonSize } = useFlipButton()

  return (
    <FlipButtonFrontPrimitive
      className={cn(
        buttonVariants({
          variant: variant ?? buttonVariant,
          size: size ?? buttonSize,
          className,
        })
      )}
      {...props}
    />
  )
}
