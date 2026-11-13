import { z } from "zod"

import { contactFormSchema } from "@/lib/validations/contact-schema"

export const contactApiSchema = contactFormSchema.extend({
  recaptchaToken: z.string().min(1, "Please complete the reCAPTCHA"),
})

export type ContactApiValues = z.infer<typeof contactApiSchema>
