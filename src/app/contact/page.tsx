import { profile } from "@/data/data"
import Contact from "@/components/home/contact"
import { DEFAULT_URL, generateMetadata } from "@/utils/metadata"

export const metadata = generateMetadata(
  `Contact — ${profile.name}`,
  `Got a project in mind? Send a message or reach ${profile.name} by email, GitHub or LinkedIn.`,
  new URL("/contact", DEFAULT_URL).toString()
)

export default function ContactPage() {
  return <Contact variant="page" />
}
