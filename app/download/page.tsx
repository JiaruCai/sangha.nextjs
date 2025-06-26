import Seo from '../components/Seo'
import Hero from './Hero'
import NavBar from './NavBar'
import Features from './Features'
import Testimonials from './Testimonials'
import Footer from './Footer'

// import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Seo title="JoinSangha – Meditate Anywhere, Connect Everywhere" description="From your quiet corner to the wider world, explore mindfulness practices that ground you—and connections that uplift you." />

      <main className="flex flex-col">
        <NavBar/>
        <Hero/>
        <Features/>
        <Testimonials/>
        <Footer/>
      </main>
    </>
  )
}
