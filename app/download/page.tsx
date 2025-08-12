import { generateSeoMetadata } from '../components/Seo'
import Hero from './Hero'
import NavBar from './NavBar'
import Features from './Features'
import Testimonials from './Testimonials'
import Footer from './Footer'

export const metadata = generateSeoMetadata({
  title: "Download App - JoinSangha",
  description: "Download the JoinSangha meditation app for iOS and Android. Connect with meditation communities and discover mindfulness practices.",
  url: "https://www.joinsangha.com/download"
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
