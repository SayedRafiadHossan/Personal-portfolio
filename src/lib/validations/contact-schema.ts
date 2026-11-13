import { z } from "zod"

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  project: z.string().trim().min(1, "Tell us about your project"),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
