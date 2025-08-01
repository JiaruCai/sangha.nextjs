import { generateSeoMetadata } from '../components/Seo'
import NavBar from '../download/NavBar'
import Career from './Career'
import Footer from './Footer'

export const metadata = generateSeoMetadata({
  title: "Career - JoinSangha",
  description: "Join our team and help build the future of meditation. Discover career opportunities at JoinSangha.",
  url: "https://www.joinsangha.com/career"
})

export default function CareerPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <NavBar />
      <Career />
      <Footer />
    </main>
  )
} 