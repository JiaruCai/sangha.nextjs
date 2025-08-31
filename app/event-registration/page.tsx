import { generateSeoMetadata } from '../components/Seo'
import { Suspense } from 'react'
import EventRegistration from './EventRegistration'

export const metadata = generateSeoMetadata({
  title: "Event Registration - JoinSangha",
  description: "Complete your registration for JoinSangha online events.",
  url: "https://www.joinsangha.com/event-registration"
})

export default function EventRegistrationPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Wrap in Suspense for searchParams */}
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#FFF7F5] to-[#F9E3E0] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#bf608f]"></div>
        </div>
      }>
        <EventRegistration />
      </Suspense>
    </main>
  )
}