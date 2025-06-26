import Seo from '../components/Seo'
import NavBar from '../download/NavBar'
import Merchandise from './Merchandise'

export default function PartnershipPage() {
  return (
    <>
      <Seo title="Partnership – JoinSangha" description="Check out our merchandise at JoinSangha. A collection of products to help you spread mindfulness and build meaningful connections!" />

      <main className="flex flex-col min-h-screen">
        <NavBar />
        <Merchandise />
      </main>
    </>
  )
}