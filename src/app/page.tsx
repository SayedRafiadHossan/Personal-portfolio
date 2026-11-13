import About from "@/components/home/about"
import Contact from "@/components/home/contact"
import FeaturedWorks from "@/components/home/featured-works"
import Hero from "@/components/home/hero"

export default function Page() {
  return (
    <>
      <Hero />
      <FeaturedWorks />
      <About />
      <Contact />
      {/* <div className="h-dvh bg-red-300"></div> */}
    </>
  )
}
