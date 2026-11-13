"use client"

import type { ButtonVariantProps } from "@/components/ui/button/button-variants"
import { getStrictContext } from "@/lib/get-strict-context"

type FlipButtonContextType = ButtonVariantProps

export const [FlipButtonProvider, useFlipButton] =
  getStrictContext<FlipButtonContextType>("FlipButtonContext")
