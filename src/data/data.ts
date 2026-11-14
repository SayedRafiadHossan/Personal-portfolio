import type { ProjectKind } from "@/components/ui/project-badge"

/* ------------------------------------------------------------------
   YOUR DETAILS — every component reads from here.
   Values marked "placeholder" still need your real info.
------------------------------------------------------------------- */
export const profile = {
  name: "Sayed Rafiad Hossan",
  /** Short name used in the preloader signature and small labels. */
  shortName: "Rafiad",
  /** Name drawn large in the footer. */
  displayName: "Rafiad Hossan",
  role: "Frontend Developer",
  city: "Dhaka",
  country: "Bangladesh",
  coordinates: "23.8103° N, 90.4125° E",
  timezone: "Asia/Dhaka",
  email: "rafiadhossen@gmail.com",
  /**
   * Where you work now: linked in the hero intro, with `preview` shown on hover,
   * and used as the current job in the About section.
   */
  company: {
    name: "StaticMania",
    href: "https://staticmania.com/",
    preview: "/images/staticmania-preview.jpg",
  } as {
    name: string
    href: string
    preview?: string
  },
  /** placeholder — your deployed site URL */
  siteUrl: "https://yourdomain.com/",
  github: {
    handle: "github.com/SayedRafiadHossan",
    href: "https://github.com/SayedRafiadHossan",
  },
  linkedin: {
    handle: "in/rafiadhossan",
    href: "https://www.linkedin.com/in/rafiadhossan",
  },
  x: "https://x.com/RafiadHossan10",
  /** placeholder */
  facebook: "https://www.facebook.com/",
}

export type ExperienceItem = {
  label: string
  title: string
  href?: string
  description: string
  points?: string[]
  current?: boolean
}

export type AboutSlide = {
  title: string
  description: string
  tags?: string[]
  experience?: ExperienceItem[]
  image: string
  imageAlt: string
}

export const aboutSlides: AboutSlide[] = [
  {
    title: "Who I am",
    description:
      "I'm a frontend developer. I build websites where design and motion work together: clean layouts, smooth interactions, and pages that guide visitors to take action. Open to Frontend Developer and Framer Developer roles (remote, hybrid or on-site) and freelance projects.",
    image: "/images/about-me.svg",
    imageAlt: "Who I am",
  },
  {
    title: "Experience",
    description:
      "Marketing websites, Framer templates and WordPress sites, from layout to launch.",
    experience: [
      {
        label: "Present",
        title: profile.company.name,
        href: profile.company.href,
        description: profile.role,
        current: true,
        // Kept short: the slide has to fit a 768px-tall laptop screen.
        points: [
          "Marketing websites and Framer templates for SaaS, AI, fintech, e-commerce and architecture brands.",
          "WordPress sites for clients.",
        ],
      },
      {
        label: "Present",
        title: "Pixels71",
        href: "https://pixels71.com/",
        description: "Framer template creator",
        current: true,
        points: [
          "Framer templates with motion built in. Optivio, Orveli and QEVRØN trended on the Framer Marketplace.",
        ],
      },
    ],
    image: "/images/experience.svg",
    imageAlt: "Experience",
  },
  {
    title: "Skills",
    description:
      "The tools I use to take a design from first layout to a smooth, responsive page.",
    tags: ["Framer", "WordPress", "React", "JavaScript", "HTML", "CSS"],
    image: "/images/frontend.svg",
    imageAlt: "Skills",
  },
  {
    title: "What I care about",
    description: "The principles behind every page I build.",
    tags: [
      "Layouts built around how visitors make decisions",
      "Motion that feels smooth, not distracting",
      "Pages that look sharp on every device",
    ],
    image: "/images/learning.svg",
    imageAlt: "What I care about",
  },
]

export type NavLink = {
  label: string
  href: string
}

export const navLinks: NavLink[] = [
  { label: "Hero", href: "/#hero" },
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/contact" },
]

export type ContactChannel = {
  label: string
  value: string
  href: string
  /** Copy `value` to the clipboard instead of following `href`. */
  copy?: boolean
}

export const contactChannels: ContactChannel[] = [
  {
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    copy: true,
  },
  {
    label: "GitHub",
    value: profile.github.handle,
    href: profile.github.href,
  },
  {
    label: "LinkedIn",
    value: profile.linkedin.handle,
    href: profile.linkedin.href,
  },
]

export type NavSocial = {
  label: "Facebook" | "X" | "LinkedIn" | "GitHub" | "Email"
  href: string
}

export const navSocials: NavSocial[] = [
  { label: "Facebook", href: profile.facebook },
  { label: "X", href: profile.x },
  { label: "LinkedIn", href: profile.linkedin.href },
  { label: "GitHub", href: profile.github.href },
  { label: "Email", href: `mailto:${profile.email}` },
]

export type FeaturedWork = {
  title: string
  description: string
  href: string
  image: string
  imageAlt: string
  imagePosition?: string
  kind: ProjectKind
  /** One line on what I did on the project. */
  role: string
  stack: string[]
  /** GitHub "owner/name", for the star count on open-source work. */
  repo?: string
}

/** Placeholders — replace with your own projects and screenshots in /public/images. */
export const featuredWorks: FeaturedWork[] = [
  {
    title: "NextSaaS",
    description:
      "A WordPress theme for SaaS, software and startup websites, sold on ThemeForest.",
    href: "https://preview.themeforest.net/item/nextsaas-saas-software-startup-wordpress-theme/full_screen_preview/61429174",
    image: "/images/nextsaas.jpg",
    imageAlt: "NextSaaS",
    kind: "team",
    role: "Built with the team at StaticMania.",
    stack: ["WordPress", "PHP", "JavaScript"],
  },
  {
    title: "Solyd",
    description:
      "An HTML template for solar energy and greentech businesses, sold on ThemeForest.",
    href: "https://preview.themeforest.net/item/solyd-solar-energy-greentech-html-template/full_screen_preview/64409190",
    image: "/images/solyd.jpg",
    imageAlt: "Solyd",
    kind: "team",
    role: "Built with the team at StaticMania.",
    stack: ["HTML", "CSS", "JavaScript"],
  },
  {
    title: "Framer Templates",
    description:
      "A collection of premium website templates for studios, startups and service businesses, sold on Pixels71.",
    // Opens the in-site page listing every template (see `templates` below).
    href: "/templates",
    image: "/images/templates/framer-templates.jpg",
    imageAlt: "Framer Templates",
    kind: "collection",
    role: "Built the templates, published on Pixels71.",
    stack: ["Framer", "CMS", "Interactions"],
  },
  {
    title: "Eventera",
    description:
      "A WordPress theme for conferences, summits and events, sold on ThemeForest.",
    href: "https://preview.themeforest.net/item/eventera-conference-wordpress-theme/full_screen_preview/63340460",
    image: "/images/eventera.jpg",
    imageAlt: "Eventera",
    kind: "team",
    role: "Built with the team at StaticMania.",
    stack: ["WordPress", "PHP", "JavaScript"],
  },
  {
    title: "Rivor",
    description:
      "A multipurpose creative WordPress theme for agencies, studios and portfolios, sold on ThemeForest.",
    href: "https://preview.themeforest.net/item/rivor-multipurpose-creative-wordpress-theme/full_screen_preview/59373721",
    image: "/images/rivor.jpg",
    imageAlt: "Rivor",
    kind: "team",
    role: "Built with the team at StaticMania.",
    stack: ["WordPress", "PHP", "JavaScript"],
  },
]

export type Template = {
  title: string
  /** Short category, shown as a tag. */
  category: string
  description: string
  href: string
  image: string
  /** What it's built with. */
  platform: "Framer" | "Next.js"
}

/** Website templates shown on the /templates page. */
export const templates: Template[] = [
  {
    title: "QEVRØN",
    category: "Architecture & interiors",
    description:
      "A refined template for architecture studios and interior designers to showcase their work.",
    href: "https://www.pixels71.com/templates/qevr-n-architecture-interiors",
    image: "/images/templates/qevron.jpg",
    platform: "Framer",
  },
  {
    title: "Carbonyx",
    category: "Climate data SaaS",
    description:
      "For climate-tech and carbon-accounting platforms: emissions, energy and climate-risk data presented as one live dashboard.",
    href: "https://carbonyx.framer.website/",
    image: "/images/templates/carbonyx.jpg",
    platform: "Framer",
  },
  {
    title: "Countly",
    category: "Finance & accounting",
    description: "A corporate site for finance and accounting firms.",
    href: "https://www.pixels71.com/templates/countly-finance-accounting-template",
    image: "/images/templates/countly.jpg",
    platform: "Framer",
  },
  {
    title: "Optivio",
    category: "SEO & analytics",
    description:
      "A six-page marketing site for an SEO or analytics product, with a clinical, diagnostic tone, a filterable CMS blog and custom interactive sections.",
    href: "https://www.pixels71.com/templates/optivio",
    image: "/images/templates/optivio.jpg",
    platform: "Framer",
  },
  {
    title: "PRISMA",
    category: "Designer portfolio",
    description: "A portfolio for brand designers.",
    href: "https://www.pixels71.com/templates/prisma",
    image: "/images/templates/prisma.jpg",
    platform: "Framer",
  },
  {
    title: "Cavero",
    category: "Real estate",
    description:
      "For agencies, brokers and property teams: ivory and charcoal with copper accents, CMS listings, working filters, team profiles and a journal.",
    href: "https://www.pixels71.com/templates/cavero-real-estate-agency-framer-template",
    image: "/images/templates/cavero.jpg",
    platform: "Framer",
  },
  {
    title: "FintechNova",
    category: "Fintech SaaS",
    description:
      "For fintech startups, finance SaaS platforms and payment companies, with clean layouts for features, pricing and integrations.",
    href: "https://www.pixels71.com/templates/fintechnova-fintech-finance-saas",
    image: "/images/templates/fintechnova.jpg",
    platform: "Framer",
  },
  {
    title: "Ignivo",
    category: "AI automation",
    description:
      "For AI automation tools, autonomous agents and SaaS startups.",
    href: "https://www.pixels71.com/templates/ignivo-ai-automation-saas",
    image: "/images/templates/ignivo.jpg",
    platform: "Framer",
  },
  {
    title: "Eventra Studio",
    category: "Weddings & events",
    description: "A timeless website for wedding planners and venues.",
    href: "https://www.pixels71.com/templates/eventra-studio",
    image: "/images/templates/eventra.jpg",
    platform: "Framer",
  },
]
