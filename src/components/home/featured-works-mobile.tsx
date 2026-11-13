"use client"

import Image from "next/image"

import { useSmartLinkProps } from "@/components/animation/page-transition"
import { ProjectBadge } from "@/components/ui/project-badge"
import { featuredWorks, profile } from "@/data/data"

import { TextReveal } from "@/components/animation/text-reveal"
import RevealAnimation from "../animation/reveal-animation"

type FeaturedWorksMobileProps = Readonly<{
  /** GitHub stars keyed by repo. */
  stars: Record<string, number>
}>

export const FeaturedWorksMobile = ({ stars }: FeaturedWorksMobileProps) => {
  const linkProps = useSmartLinkProps()
  return (
    <section className="py-20 md:hidden">
      <div className="main-container">
        <div className="space-y-12">
          <div className="space-y-10 text-center">
            <div className="space-y-5">
              <TextReveal delay={0.1}>
                <h2 className="overflow-hidden pb-[0.06em] font-aspekta-600 text-aspekta-heading-6 tracking-[-0.05em] text-background-1">
                  Selected work
                </h2>
              </TextReveal>
              <TextReveal delay={0.2}>
                <p className="mx-auto max-w-[30rem] overflow-hidden font-aspekta-400 text-tagline-1 text-background-1/75">
                  Open-source libraries and production templates, built solo and with the team at {profile.company.name}.
                </p>
              </TextReveal>
            </div>
            {/* <RevealAnimation delay={0.3}>
            <div className="flex w-full items-center justify-center">
              <FlipButton from="top" asChild>
                <a href="#contact" className="w-[85%]">
                  <FlipButtonFront variant="default">Lets Talk</FlipButtonFront>
                  <FlipButtonBack variant="inverse">Lets Talk</FlipButtonBack>
                </a>
              </FlipButton>
            </div>
          </RevealAnimation> */}
          </div>

          {featuredWorks.map((work, index) => (
            <RevealAnimation delay={0.1 + index * 0.1} key={work.title}>
              <div className="space-y-6">
                <a
                  {...linkProps(work.href)}
                  tabIndex={-1}
                  aria-hidden
                  className="relative block aspect-670/460 overflow-hidden rounded-2xl ring-1 ring-background-1/10"
                >
                  <Image
                    src={work.image}
                    alt={work.imageAlt}
                    fill
                    sizes="100vw"
                    className="size-full object-cover"
                    style={{ objectPosition: work.imagePosition }}
                  />
                  <ProjectBadge
                    kind={work.kind}
                    stars={work.repo ? stars[work.repo] : undefined}
                    className="absolute top-3 left-3"
                  />
                </a>
                <div className="space-y-3">
                  <h3 className="font-aspekta-600 text-aspekta-heading-8 tracking-[-0.045em] text-background-1">
                    {work.title}
                  </h3>
                  <div className="space-y-4">
                    <p className="max-w-100 font-aspekta-400 text-tagline-1 text-background-1/75">
                      {work.description}
                    </p>
                    <p className="max-w-100 text-tagline-3 text-background-1/70">
                      My role: {work.role}
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {work.stack.map((tech) => (
                        <li
                          key={tech}
                          className="rounded-full border border-background-1/12 px-2.5 py-1 text-tagline-4 text-background-1/75"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                    <a
                      {...linkProps(work.href)}
                      className="inline-flex min-h-11 items-center gap-1.5 font-aspekta-550 text-tagline-2 text-background-1 underline decoration-background-1/25 underline-offset-[0.25em]"
                    >
                      {work.href.startsWith("/") ? "View all" : "Visit project"}
                      <span aria-hidden>{work.href.startsWith("/") ? "→" : "↗"}</span>
                    </a>
                  </div>
                </div>
              </div>
            </RevealAnimation>
          ))}

          {/* <div>
            <TextReveal delay={0.1}>
              <h3 className="m-0 max-w-100 text-center font-instrument-serif text-instrument-heading-4 font-medium text-background-1">
                Every high-performance website starts with a vision. Let&apos;s
                talk about your vision.
              </h3>
            </TextReveal>
            <RevealAnimation delay={0.3}>
              <div className="mt-10">
                <FeaturedWorksContactButton />
              </div>
            </RevealAnimation>
          </div> */}
        </div>
      </div>
    </section>
  )
}
