"use client"

import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@/components/ui/button"
import { getEmailJsConfig } from "@/lib/emailjs/config"
import { cn } from "@/lib/utils"
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validations/contact-schema"
import emailjs from "@emailjs/browser"
import { useState, type SubmitEvent } from "react"
import { toast } from "sonner"
import type { ZodError } from "zod"

type FieldErrors = Partial<Record<keyof ContactFormValues, string>>

function getFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      typeof field === "string" &&
      field in contactFormSchema.shape &&
      !errors[field as keyof ContactFormValues]
    ) {
      errors[field as keyof ContactFormValues] = issue.message
    }
  }

  return errors
}

const SEND_ERROR_MESSAGE = "Failed to send. Please try again."
const SEND_UNAVAILABLE_MESSAGE =
  "Unable to send your message right now. Please try again later."

type FieldProps = Readonly<{
  name: keyof ContactFormValues
  label: string
  type?: string
  multiline?: boolean
  error?: string
  disabled: boolean
  onChange: () => void
}>

// Underline field with a label that sits inside the field until it is
// focused or filled, then floats above the value.
const Field = ({
  name,
  label,
  type = "text",
  multiline = false,
  error,
  disabled,
  onChange,
}: FieldProps) => {
  const errorId = `${name}-error`
  const control = cn(
    "peer block w-full resize-none border-0 border-b bg-transparent pt-7 pb-3 font-aspekta-400 text-tagline-1 text-current outline-none disabled:cursor-not-allowed disabled:opacity-60",
    error ? "border-red-400" : "border-current/20"
  )
  const shared = {
    id: name,
    name,
    placeholder: " ",
    disabled,
    onChange,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    className: control,
  }

  return (
    <div
      data-contact-item
      className={cn("invisible", multiline && "flex flex-1 flex-col")}
    >
      <div className={cn("relative", multiline && "flex flex-1 flex-col")}>
        {multiline ? (
          <textarea
            rows={4}
            {...shared}
            className={cn(shared.className, "min-h-32 flex-1")}
          />
        ) : (
          <input type={type} {...shared} />
        )}
        <label
          htmlFor={name}
          className={cn(
            "pointer-events-none absolute top-7 left-0 origin-top-left font-aspekta-400 text-tagline-1 text-current/55 transition-[translate,scale,color] duration-500 ease-page",
            "peer-focus:-translate-y-6 peer-focus:scale-[0.78] peer-focus:text-current",
            "peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-[0.78]"
          )}
        >
          {label}
        </label>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-700 ease-page peer-focus:scale-x-100"
        />
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 font-aspekta-400 text-tagline-3 text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const clearFieldError = (field: keyof ContactFormValues) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev

      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const values = {
      name: formData.get("name"),
      email: formData.get("email"),
      project: formData.get("project"),
    }

    const parsed = contactFormSchema.safeParse(values)

    if (!parsed.success) {
      setFieldErrors(getFieldErrors(parsed.error))
      return
    }

    setFieldErrors({})

    let config: ReturnType<typeof getEmailJsConfig>

    try {
      config = getEmailJsConfig()
    } catch (error) {
      console.error("EmailJS config error:", error)
      toast.error(SEND_UNAVAILABLE_MESSAGE)
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Sending your message...")

    try {
      await emailjs.send(
        config.serviceId,
        config.templateId,
        {
          name: parsed.data.name,
          email: parsed.data.email,
          message: parsed.data.project,
        },
        {
          publicKey: config.publicKey,
        }
      )

      toast.success("Message sent! I'll get back to you soon.", { id: toastId })
      form.reset()
    } catch (error) {
      console.error("EmailJS send error:", error)
      toast.error(SEND_ERROR_MESSAGE, { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-1 flex-col gap-6"
      noValidate
    >
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        <Field
          name="name"
          label="Name*"
          error={fieldErrors.name}
          disabled={isSubmitting}
          onChange={() => clearFieldError("name")}
        />
        <Field
          name="email"
          type="email"
          label="Email*"
          error={fieldErrors.email}
          disabled={isSubmitting}
          onChange={() => clearFieldError("email")}
        />
      </div>

      <Field
        name="project"
        label="Tell me about your project*"
        multiline
        error={fieldErrors.project}
        disabled={isSubmitting}
        onChange={() => clearFieldError("project")}
      />

      <div data-contact-item className="invisible mt-auto pt-4">
        <FlipButton
          from="top"
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          <FlipButtonFront className="w-full bg-background-2 text-background-1">
            Send message
          </FlipButtonFront>
          <FlipButtonBack className="w-full bg-[#2e2e2e] text-background-2">
            Send message
          </FlipButtonBack>
        </FlipButton>
      </div>
    </form>
  )
}
