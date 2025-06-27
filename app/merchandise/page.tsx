import { generateSeoMetadata } from '../components/Seo'
import NavBar from '../download/NavBar'
import Merchandise from './Merchandise'

export const metadata = generateSeoMetadata({
  title: "Merchandise – JoinSangha",
  description: "Check out our merchandise at JoinSangha. A collection of products to help you spread mindfulness and build meaningful connections!",
  url: "https://joinsangha.com/merchandise"
})

export default function MerchandisePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <NavBar />
      <Merchandise />
    </main>
  )
}