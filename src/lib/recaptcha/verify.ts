import { z } from "zod"

const recaptchaSecretSchema = z.object({
  RECAPTCHA_SECRET_KEY: z.string().min(1),
})

export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  const result = recaptchaSecretSchema.safeParse({
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  })

  if (!result.success) {
    console.error("Missing RECAPTCHA_SECRET_KEY")
    return false
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: result.data.RECAPTCHA_SECRET_KEY,
      response: token,
    }),
  })

  if (!response.ok) return false

  const data = (await response.json()) as { success?: boolean }
  return data.success === true
}
