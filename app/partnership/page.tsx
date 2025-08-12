import { generateSeoMetadata } from '../components/Seo'
import NavBar from '../download/NavBar'
import Partnership from './Partnership'

export const metadata = generateSeoMetadata({
  title: "Partnership - JoinSangha",
  description: "Partner with JoinSangha to spread mindfulness and build meaningful connections. Explore collaboration opportunities.",
  url: "https://www.joinsangha.com/partnership"
})

export default function PartnershipPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <NavBar />
      <Partnership />
    </main>
  )
}