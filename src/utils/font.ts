import { Instrument_Serif } from "next/font/google"
import localFont from "next/font/local"

export const fontInstrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
})

/**
 * Signature intro — outlines via opentype.js must load the same file as this loader.
 * Public path stays in sync with `src` below (`public/fonts/LastoriaBoldRegular.otf`).
 */
export const SIGNATURE_OTF_PUBLIC_URL =
  "/fonts/LastoriaBoldRegular.otf" as const

export const fontSignature = localFont({
  src: "../../public/fonts/LastoriaBoldRegular.otf",
  variable: "--font-signature",
  display: "swap",
  // opentype.js already fetches the file for the outlines; the CSS face is only
  // a fallback, so don't preload it a second time.
  preload: false,
})
