import { FeaturedWorksDesktop } from "@/components/home/featured-works-desktop"
import { FeaturedWorksMobile } from "@/components/home/featured-works-mobile"
import { featuredWorks } from "@/data/data"
import { getGitHubStars } from "@/utils/github-stars"

const FeaturedWorks = async () => {
  const stars = await getGitHubStars(
    featuredWorks.flatMap((work) => (work.repo ? [work.repo] : []))
  )

  return (
    <div id="work" className="relative z-10 scroll-mt-24 bg-background-2">
      <FeaturedWorksDesktop stars={stars} />
      <FeaturedWorksMobile stars={stars} />
    </div>
  )
}

export default FeaturedWorks
