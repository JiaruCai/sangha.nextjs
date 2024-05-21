import { ClerkProvider, SignInButton, SignOutButton } from '@clerk/nextjs';
import { Inter } from 'next/font/google'; // Import Inter font
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server'; // Import currentUser function
import "./globals.css";

const inter = Inter({subsets: ["latin"]});


export const metadata = {
    title: "Join Sangha",
    description: "Meditate today on your own schedule!",
};

export default async function RootLayout({ children }) {
    const user = await currentUser();
    const redirectUrl = process.env.NODE_ENV === 'production' ? 'https://joinsangha.co' : 'http://localhost:3000';

    return (
        <ClerkProvider>
            <html lang="en">
            <body className={inter.className}>
            <header>
                <div className="logo">
                    <Link href="/" legacyBehavior>
                        <a className="logo-link">Sangha</a>
                    </Link>
                </div>
            
                <nav className="flex flex-row gap-4">
                    {user ? (
                        <SignOutButton className="signOutButton"/> // Render sign-out button if user is logged in
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
