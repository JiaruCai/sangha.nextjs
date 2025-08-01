import type { Metadata } from "next";
import { Arsenal } from "next/font/google";
import "./globals.css";

const arsenal = Arsenal({
  variable: "--font-arsenal",
  weight: '700',
  subsets: ['latin'],
});

const subArsenal = Arsenal({
  variable: "--font-sub-arsenal",
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: "JoinSangha - Official Site",
    template: "%s | JoinSangha"
  },
  description: "JoinSangha Meditation Platform — Connect with meditation communities, discover mindfulness practices, and build deeper spiritual connections.",
  keywords: ["meditation", "mindfulness", "sangha", "community", "wellness", "mental health", "spiritual growth", "meditation app", "mindfulness platform"],
  authors: [{ name: "JoinSangha Team" }],
  creator: "JoinSangha",
  publisher: "JoinSangha",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://joinsangha.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://joinsangha.com",
    siteName: "JoinSangha",
    title: "JoinSangha - Official Site",
    description: "JoinSangha Meditation Platform — Connect with meditation communities, discover mindfulness practices, and build deeper spiritual connections.",
    images: [
      {
        url: "/joinsangha-logo.svg",
        width: 1200,
        height: 630,
        alt: "JoinSangha - Meditation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JoinSangha - Official Site",
    description: "JoinSangha Meditation Platform — Connect with meditation communities, discover mindfulness practices, and build deeper spiritual connections.",
    site: "@joinsangha",
    creator: "@joinsangha",
    images: ["/joinsangha-logo.svg"],
  },
  icons: {
    icon: "/joinsangha-logo.svg",
    shortcut: "/joinsangha-logo.svg",
    apple: "/joinsangha-logo.svg",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "PWlESXs6pH6ATGrabq_-5A-y6A9pVYg7OoA6s9OfLoY",
  },
  other: {
    "application/ld+json": JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "JoinSangha",
        "alternateName": "JoinSangha - Official Site",
        "url": "https://joinsangha.com",
        "description": "JoinSangha Meditation Platform — Connect with meditation communities, discover mindfulness practices, and build deeper spiritual connections.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://joinsangha.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://joinsangha.com/#organization",
        "name": "JoinSangha",
        "url": "https://joinsangha.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://joinsangha.com/joinsangha-logo.svg",
          "width": 400,
          "height": 400
        },
        "description": "JoinSangha Meditation Platform — Connect with meditation communities, discover mindfulness practices, and build deeper spiritual connections.",
        "foundingDate": "2024",
        "sameAs": [
          "https://twitter.com/joinsangha",
          "https://facebook.com/joinsangha",
          "https://instagram.com/joinsangha"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": "English"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Meditation Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Meditation Community Access",
                "description": "Connect with meditation communities worldwide"
              }
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Service",
                "name": "Mindfulness Practices",
                "description": "Discover guided meditation and mindfulness practices"
              }
            }
          ]
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "SiteNavigationElement",
        "name": "Download App",
        "description": "Download the JoinSangha meditation app for iOS and Android",
        "url": "https://joinsangha.com/download"
      },
      {
        "@context": "https://schema.org", 
        "@type": "SiteNavigationElement",
        "name": "Merchandise",
        "description": "Explore mindfulness merchandise and meditation accessories",
        "url": "https://joinsangha.com/merchandise"
      },
      {
        "@context": "https://schema.org",
        "@type": "SiteNavigationElement", 
        "name": "Partnership",
        "description": "Partner with JoinSangha to spread mindfulness",
        "url": "https://joinsangha.com/partnership"
      },
      {
        "@context": "https://schema.org",
        "@type": "SiteNavigationElement",
        "name": "Team Blog", 
        "description": "Read insights and updates from the JoinSangha team",
        "url": "https://joinsangha.com/team-blog"
      }
    ])
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${arsenal.variable} ${subArsenal.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
