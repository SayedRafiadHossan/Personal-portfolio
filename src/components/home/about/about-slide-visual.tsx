"use client"

import { cn } from "@/lib/utils"

export const SlideVisual = ({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) => (
  <div className={cn("relative aspect-square overflow-hidden", className)}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 size-full object-cover"
      onError={(event) => {
        event.currentTarget.style.display = "none"
      }}
    />
  </div>
)
