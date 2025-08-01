import { generateSeoMetadata, StructuredData, getStructuredData } from './components/Seo'
import Hero from './download/Hero'
import NavBar from './download/NavBar'
import Features from './download/Features'
import Testimonials from './download/Testimonials'
import Footer from './download/Footer'

export const metadata = generateSeoMetadata({
  title: "JoinSangha - Official Site",
  description: "JoinSangha Meditation Platform — Connect with meditation communities, discover mindfulness practices, and build deeper spiritual connections.",
  url: "https://www.joinsangha.com"
})

export default function Home() {
  return (
    <>
      <StructuredData data={getStructuredData()} />
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
