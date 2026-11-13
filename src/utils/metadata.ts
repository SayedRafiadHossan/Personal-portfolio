import { profile } from "@/data/data"
import type { Metadata } from "next"

export const DEFAULT_URL = profile.siteUrl
export const DEFAULT_TITLE = `${profile.name} — ${profile.role}`
export const DEFAULT_DESCRIPTION =
  `Hi, I'm ${profile.name}, a frontend developer who crafts fast, thoughtful interfaces that people trust.`
export const DEFAULT_IMAGE_URL = "/images/og-img.png"
export const DEFAULT_ICON_URL = "/images/my-logo.svg"
export const DEFAULT_SITE_NAME = profile.name

const defaultMetadata: Metadata = {
  metadataBase: new URL(DEFAULT_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  applicationName: DEFAULT_SITE_NAME,
  authors: [{ name: DEFAULT_SITE_NAME, url: DEFAULT_URL }],
  creator: DEFAULT_SITE_NAME,
  icons: {
    icon: [{ url: DEFAULT_ICON_URL, type: "image/svg+xml" }],
    shortcut: DEFAULT_ICON_URL,
    apple: DEFAULT_ICON_URL,
  },
  openGraph: {
    type: "website",
    siteName: DEFAULT_SITE_NAME,
    url: DEFAULT_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_IMAGE_URL, width: 2000, height: 600 }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_IMAGE_URL],
  },
}

const generateMetadata = (
  title?: string,
  description?: string,
  canonicalUrl?: string,
  imageUrl?: string
): Metadata => {
  return {
    ...defaultMetadata,
    title: title ?? defaultMetadata.title,
    description: description ?? defaultMetadata.description,
    alternates: {
      canonical: canonicalUrl ?? DEFAULT_URL,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title: title ?? defaultMetadata.openGraph?.title,
      description: description ?? defaultMetadata.openGraph?.description,
      url: canonicalUrl ?? defaultMetadata.openGraph?.url,
      images: imageUrl
        ? [{ url: imageUrl, width: 2000, height: 600 }]
        : defaultMetadata.openGraph?.images,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: title ?? defaultMetadata.twitter?.title,
      description: description ?? defaultMetadata.twitter?.description,
      images: imageUrl ? [imageUrl] : defaultMetadata.twitter?.images,
    },
  }
}

export { defaultMetadata, generateMetadata }
