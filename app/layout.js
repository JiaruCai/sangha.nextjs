import { ClerkProvider, SignInButton, SignOutButton } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import Head from 'next/head';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Join Sangha",
  description: "Meditate today on your own schedule!",
  openGraph: {
    title: 'Join Sangha',
    description: 'Meditate today on your own schedule!',
    url: 'https://www.joinsangha.co',
    siteName: 'Join Sangha',
    images: [
      {
        url: 'https://www.joinsangha.co/Pictures/image8.jpg',
        width: 800,
        height: 600,
      },
      {
        url: 'https://www.joinsangha.co/Pictures/image8_alt.jpg',
        width: 1800,
        height: 1600,
        alt: 'Sangha meditation session',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default async function RootLayout({ children }) {
  const user = await currentUser();
  const redirectUrl = process.env.NODE_ENV === 'production' ? 'https://www.joinsangha.co' : 'http://localhost:3000';

  return (
    <ClerkProvider>
      <html lang="en">
        <Head>
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
        </Head>
        <body className={inter.className}>
          <header>
            <div className="logo">
              <Link href="/" legacyBehavior>
                <a className="logo-link">Sangha</a>
              </Link>
            </div>
            <nav className="flex flex-row gap-4">
              {user ? (
                <SignOutButton className="signOutButton" /> // Render sign-out button if user is logged in
              ) : (
                <>
                  <SignInButton
                    className="signInButton"
                    redirectUrl={redirectUrl}
                    mode={'redirect'}>
                    <span>Sign In</span>
                  </SignInButton>
                  <SignInButton
                    className="signInButton"
                    redirectUrl={redirectUrl}
                    mode={'redirect'}>
                    <span>Join</span>
                  </SignInButton>
                </>
              )}
            </nav>
          </header>
          {children}
          <footer>
            <div className="footer-left">
              © 2024 FAMILIA IO Inc.
            </div>
            <div className="footer-right">
              <a href="/about" className="footer-link">About</a>
              <a href="/contact" className="footer-link">Contact</a>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
