import TransfinityScroll from '../components/home/TransfinityScroll'
import { CollectionBanner } from '../components/home/CollectionBanner'
import { ThreeStories } from '../components/home/ThreeStories'
import { FeaturedProduct } from '../components/home/FeaturedProduct'
import { SiteFooter } from '../components/home/SiteFooter'

/**
 * New Transfinity home — same experience as localhost:10001 marketing build.
 * Old Intro hero is retired.
 */
export default function Landing() {
  return (
    <div className="bg-[#F4F4F2]">
      <TransfinityScroll />
      <CollectionBanner />
      <ThreeStories />
      <FeaturedProduct />
      <SiteFooter />
    </div>
  )
}
