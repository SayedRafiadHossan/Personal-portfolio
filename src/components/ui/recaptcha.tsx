"use client"

import dynamic from "next/dynamic"
import type { ReCAPTCHAProps } from "react-google-recaptcha"

const ReCAPTCHAInput = dynamic(() => import("react-google-recaptcha"), {
  ssr: false,
})

type ContactRecaptchaProps = Readonly<
  Pick<ReCAPTCHAProps, "onChange"> & {
    siteKey: string
  }
>

export function ContactRecaptcha({ siteKey, onChange }: ContactRecaptchaProps) {
  return <ReCAPTCHAInput sitekey={siteKey} onChange={onChange} />
}
