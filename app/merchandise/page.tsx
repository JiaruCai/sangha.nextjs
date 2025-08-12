import { generateSeoMetadata } from '../components/Seo'
import NavBar from '../download/NavBar'
import Merchandise from './Merchandise'

export const metadata = generateSeoMetadata({
  title: "Merchandise - JoinSangha",
  description: "Explore mindfulness merchandise and meditation accessories. Shop JoinSangha products to enhance your meditation practice.",
  url: "https://www.joinsangha.com/merchandise"
})

export default function MerchandisePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <NavBar />
      <Merchandise />
    </main>
  )
}