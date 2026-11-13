import { AboutDesktop } from "./desktop"
import { AboutMobile } from "./mobile"

const About = () => (
  <section id="about" className="scroll-mt-24">
    <AboutDesktop />
    <AboutMobile />
  </section>
)

export default About
