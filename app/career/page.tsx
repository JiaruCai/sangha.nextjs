import { generateSeoMetadata } from '../components/Seo'
import NavBar from '../download/NavBar'
import Career from './Career'
import Footer from './Footer'

export const metadata = generateSeoMetadata({
  title: "Career – JoinSangha",
  description: "Join our mission. Build your career with us at JoinSangha. Discover open roles and perks.",
  url: "https://joinsangha.com/career"
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