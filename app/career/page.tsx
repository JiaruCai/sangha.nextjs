import Seo from '../components/Seo'
import NavBar from '../download/NavBar'
import Career from './Career'
import Footer from './Footer'

export default function CareerPage() {
  return (
    <>
      <Seo title="Career – JoinSangha" description="Join our mission. Build your career with us at JoinSangha. Discover open roles and perks." />
      <main className="flex flex-col min-h-screen">
        <NavBar />
        <Career />
        <Footer />
      </main>
    </>
  )
} 