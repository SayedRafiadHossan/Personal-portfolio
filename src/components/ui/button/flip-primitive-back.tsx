"use client"

import {
  FlipFace,
  type FlipButtonFaceProps,
} from "@/components/ui/button/flip-primitive-face"

export type FlipButtonBackProps = FlipButtonFaceProps

export const FlipButtonBack = (props: FlipButtonBackProps) => {
  return <FlipFace {...props} face="back" />
}
