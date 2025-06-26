import Seo from './components/Seo'
import Hero from './download/Hero'
import NavBar from './download/NavBar'
import Features from './download/Features'
import Testimonials from './download/Testimonials'
import Footer from './download/Footer'

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
