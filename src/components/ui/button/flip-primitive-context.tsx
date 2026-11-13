"use client"

import { getStrictContext } from "@/lib/get-strict-context"
import type { RefObject } from "react"

type FlipPrimitiveContextType = {
  frontRef: RefObject<HTMLElement | null>
  backRef: RefObject<HTMLElement | null>
}

export const [FlipPrimitiveProvider, useFlipPrimitive] =
  getStrictContext<FlipPrimitiveContextType>("FlipButtonPrimitiveContext")
