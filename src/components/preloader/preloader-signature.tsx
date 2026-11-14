"use client"

import { profile } from "@/data/data"
import { useEffect, useState } from "react"

import { Signature } from "@/components/signature/signature"

type PreloaderSignatureProps = Readonly<{
  onComplete?: () => void
  onProgress?: (progress: number) => void
}>

const SHARED = {
  color: "#ffffff",
  duration: 1,
} as const

// Phones split the name over two lines: everything but the surname, then the surname.
const nameParts = profile.name.split(" ")
const FIRST_LINE = nameParts.slice(0, -1).join(" ")
const LAST_LINE = `${nameParts[nameParts.length - 1]}.`

export const PreloaderSignature = ({
  onComplete,
  onProgress,
}: PreloaderSignatureProps) => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  if (isMobile === null) return null

  if (isMobile) {
    return (
      <div className="flex flex-col items-center">
        <Signature
          {...SHARED}
          className="max-w-[86vw]"
          fontSize={28}
          text={FIRST_LINE}
        />
        <Signature
          {...SHARED}
          className="max-w-[86vw]"
          delay={1}
          fontSize={28}
          text={LAST_LINE}
          onComplete={onComplete}
          onProgress={onProgress}
        />
      </div>
    )
  }

  return (
    <Signature
      {...SHARED}
      className="max-w-[88vw] origin-center scale-90 md:scale-100"
      fontSize={38}
      text={`${profile.name}.`}
      onComplete={onComplete}
      onProgress={onProgress}
    />
  )
}
