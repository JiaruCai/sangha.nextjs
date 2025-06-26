import Seo from '../components/Seo'
import NavBar from '../download/NavBar'
import Partnership from './Partnership'
import Footer from '../download/Footer'

export default function PartnershipPage() {
  return (
    <>
      <Seo title="Partnership – JoinSangha" description="Partner with JoinSangha to spread mindfulness and build meaningful connections. Explore collaboration opportunities." />

      <main className="flex flex-col min-h-screen">
        <NavBar />
        <Partnership />
      </main>
    </>
  )
}