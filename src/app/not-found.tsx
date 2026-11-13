import { profile } from "@/data/data"
import { NotFoundView } from "@/components/not-found"
import { generateMetadata } from "@/utils/metadata"

export const metadata = {
  ...generateMetadata(
    `Page not found — ${profile.name}`,
    "This page doesn't exist. Head back home to keep exploring."
  ),
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return <NotFoundView />
}
