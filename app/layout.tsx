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
  title: "Join Sangha - Meditate Anywhere, Connect Everywhere",
  description: "From your quiet corner to the wider world, explore mindfulness practices that ground you—and connections that uplift you.",
  icons: {
    icon: "/joinsangha-logo.svg",
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
