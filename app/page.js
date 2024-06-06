import { currentUser } from "@clerk/nextjs/server";
import { SignInButton } from '@clerk/nextjs';
import ClientCalendar from './client-calendar';

export default async function Page() {
    const user = await currentUser();
    const redirectUrl = process.env.NODE_ENV === 'production' ? 'https://joinsangha.co' : 'http://localhost:3000';

    return (
        <>
            {user ? (
                <div className="welcome-message">
                    <h1>Welcome, {user.firstName} {user.lastName}!</h1>
                    {/* Render calendar components here */}
                    <ClientCalendar />
                </div>
            ) : (
                <>
                    <div className="main-page">
                    <div className="text-container">
                        <h1>Welcome to Our Sangha!</h1>
                        <p>Meditate with yogis from around the world, all backgrounds, on your schedule.</p>
                        <SignInButton 
                        redirectUrl={redirectUrl}
                        mode={'redirect'}>
                        <button className="button">Try for Free</button>
                        </SignInButton>
                        <p>No Credit Card Required</p>
                    </div>
                    <div className="image-container">
                        <img src="/Pictures/image6.jpg" alt="Meditation Image" className="image"/>
                    </div>
                </div>
                </>
            )}

            {/* Page 2 content */}
            {!user && (
                <div className="page-two">
                    <div className="text-container">
                        <h1>It is hard to meditate regularly when we do it alone.</h1>
                        <p>It is easier when we do it together.</p>
                    </div>
                    <div className="image-container">
                        <img src="/Pictures/image7.jpg" alt="Meditation Image" className="image"/>
                    </div>
                </div>
            )}
        </>
    );
}