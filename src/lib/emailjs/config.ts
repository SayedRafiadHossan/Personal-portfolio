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

export function getEmailJsConfig(): EmailJsConfig {
  const result = emailJsEnvSchema.safeParse({
    NEXT_PUBLIC_EMAILJS_SERVICE_ID:
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID:
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
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
