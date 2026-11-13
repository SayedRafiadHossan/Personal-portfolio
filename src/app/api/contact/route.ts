import emailjs from "@emailjs/nodejs"
import { NextResponse } from "next/server"

import { getEmailJsConfig } from "@/lib/emailjs/config"
import { verifyRecaptchaToken } from "@/lib/recaptcha/verify"
import { contactApiSchema } from "@/lib/validations/contact-api-schema"

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const parsed = contactApiSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const { recaptchaToken, name, email, project } = parsed.data

  const recaptchaValid = await verifyRecaptchaToken(recaptchaToken)

  if (!recaptchaValid) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    const config = getEmailJsConfig()

    await emailjs.send(
      config.serviceId,
      config.templateId,
      { name, email, message: project },
      { publicKey: config.publicKey }
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Contact API error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
