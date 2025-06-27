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
    default: "JoinSangha – Meditate Anywhere, Connect Everywhere",
    template: "%s | JoinSangha"
  },
  description: "From your quiet corner to the wider world, explore mindfulness practices that ground you—and connections that uplift you.",
  keywords: ["meditation", "mindfulness", "sangha", "community", "wellness", "mental health", "spiritual growth"],
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
    title: "JoinSangha – Meditate Anywhere, Connect Everywhere",
    description: "From your quiet corner to the wider world, explore mindfulness practices that ground you—and connections that uplift you.",
    images: [
      {
        url: "/joinsangha-logo.svg",
        width: 1200,
        height: 630,
        alt: "JoinSangha - Meditation Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JoinSangha – Meditate Anywhere, Connect Everywhere",
    description: "From your quiet corner to the wider world, explore mindfulness practices that ground you—and connections that uplift you.",
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
    google: "af7a06a91636f971",
  },
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
