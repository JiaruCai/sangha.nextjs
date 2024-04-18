import {Inter} from "next/font/google";
import {ClerkProvider, SignInButton} from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "Join Sangha",
    description: "Meditate today so you don't die!",
};

export default function RootLayout({children}) {
    const redirectUrl = process.env.NODE_ENV === 'production' ? 'https://joinsangha.co' : 'http://localhost:3000';
    return (
        <ClerkProvider>
            <html lang="en">
            <body className={inter.className}>
            <header>
                <div className="logo">Sangha</div>
                <nav>
                    <SignInButton redirectUrl={redirectUrl}
                                  mode={'redirect'}>
                        <span>Sign In</span>
                    </SignInButton>
                    <button className="button">Join</button>
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
