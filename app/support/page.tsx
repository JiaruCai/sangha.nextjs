import { generateSeoMetadata } from '../components/Seo'
import NavBar from '../download/NavBar'
import Support from './Support'

export const metadata = generateSeoMetadata({
  title: "Support – JoinSangha",
  description: "Get help and support for JoinSangha. Contact our team via email, phone, or submit a support ticket for assistance.",
  url: "https://joinsangha.com/support"
})

export default function SupportPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <NavBar />
      <Support />
    </main>
  )
}