"use client"

import {
  FlipFace,
  type FlipButtonFaceProps,
} from "@/components/ui/button/flip-primitive-face"

export type FlipButtonFrontProps = FlipButtonFaceProps

export const FlipButtonFront = (props: FlipButtonFrontProps) => {
  return <FlipFace {...props} face="front" />
}
