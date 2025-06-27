import { generateSeoMetadata } from '../components/Seo'
import Hero from './Hero'
import NavBar from './NavBar'
import Features from './Features'
import Testimonials from './Testimonials'
import Footer from './Footer'

export const metadata = generateSeoMetadata({
  title: "Download JoinSangha – Meditate Anywhere, Connect Everywhere",
  description: "Download the JoinSangha app. From your quiet corner to the wider world, explore mindfulness practices that ground you—and connections that uplift you.",
  url: "https://joinsangha.com/download"
})

export default function Home() {
  return (
    <main className="flex flex-col">
      <NavBar/>
      <Hero/>
      <Features/>
      <Testimonials/>
      <Footer/>
    </main>
  )
}
