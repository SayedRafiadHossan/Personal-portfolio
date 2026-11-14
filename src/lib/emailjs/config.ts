import { z } from "zod"

const emailJsEnvSchema = z.object({
  NEXT_PUBLIC_EMAILJS_SERVICE_ID: z.string().min(1),
  NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: z.string().min(1),
  NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: z.string().min(1),
})

export type EmailJsConfig = {
  serviceId: string
  templateId: string
  publicKey: string
}

/**
 * The contact form's EmailJS IDs. EmailJS designs these to be public: they ship
 * in the browser bundle either way. Set the NEXT_PUBLIC_EMAILJS_* env vars to
 * override them. To stop other sites using them, add your domain to the
 * allowlist in EmailJS (Account → Security).
 */
const DEFAULTS = {
  serviceId: "service_in46g58",
  templateId: "template_ut4iqvs",
  publicKey: "yy7Z6iZ34BLUF7_Ys",
}

export function getEmailJsConfig(): EmailJsConfig {
  const result = emailJsEnvSchema.safeParse({
    NEXT_PUBLIC_EMAILJS_SERVICE_ID:
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || DEFAULTS.serviceId,
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID:
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || DEFAULTS.templateId,
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || DEFAULTS.publicKey,
  })

  if (!result.success) {
    throw new Error(
      "Missing EmailJS environment variables. Copy .env.example to .env.local and add your Service ID, Template ID, and Public Key."
    )
  }

  return {
    serviceId: result.data.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    templateId: result.data.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    publicKey: result.data.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  }
}
