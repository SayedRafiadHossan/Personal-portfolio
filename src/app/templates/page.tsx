import { TemplatesPage } from "@/components/templates/templates-page"
import { profile } from "@/data/data"
import { DEFAULT_URL, generateMetadata } from "@/utils/metadata"

export const metadata = generateMetadata(
  `Templates — ${profile.name}`,
  `Premium Framer and Next.js website templates by ${profile.name}, published on Pixels71.`,
  new URL("/templates", DEFAULT_URL).toString(),
  "/images/templates/framer-templates.jpg"
)

export default function Page() {
  return <TemplatesPage />
}
