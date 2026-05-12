import FieldGlowNav from './nav'
import FieldGlowHero from './hero'
import ParkingLotSection from './parking-lot'
import HowItWorks from './how-it-works'
import FeaturesSection from './features'
import MoatSection from './moat'
import ForLeaders from './for-leaders'
import Testimonials from './testimonials'
import FinalCta from './final-cta'
import FieldGlowFooter from './footer'

export default function FieldGlowLandingContent() {
  return (
    <main id="main-content" className="relative isolate min-h-screen overflow-hidden">
      <FieldGlowNav />
      <FieldGlowHero />
      <ParkingLotSection />
      <FeaturesSection />
      <HowItWorks />
      <MoatSection />
      <ForLeaders />
      <Testimonials />
      <FinalCta />
      <FieldGlowFooter />
    </main>
  )
}
