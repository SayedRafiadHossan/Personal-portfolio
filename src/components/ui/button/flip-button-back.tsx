"use client"

import { useFlipButton } from "@/components/ui/button/flip-button-context"
import {
  buttonVariants,
  type ButtonVariantProps,
} from "@/components/ui/button/button-variants"
import {
  FlipButtonBack as FlipButtonBackPrimitive,
  type FlipButtonBackProps as FlipButtonBackPrimitiveProps,
} from "@/components/ui/button/flip-primitive-back"
import { cn } from "@/lib/utils"

export type FlipButtonBackProps = Readonly<
  FlipButtonBackPrimitiveProps & ButtonVariantProps
>

export const FlipButtonBack = ({
  variant,
  size,
  className,
  ...props
}: FlipButtonBackProps) => {
  const { variant: buttonVariant, size: buttonSize } = useFlipButton()

  return (
    <FlipButtonBackPrimitive
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
