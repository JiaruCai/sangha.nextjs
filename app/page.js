import {SignInButton} from "@clerk/nextjs";
import {currentUser} from "@clerk/nextjs/server";


export default  async function Home() {
    const user = await currentUser();

    return (
        <div>
            <header>
                <div className="logo">Sangha</div>
                <nav>
                    <SignInButton  redirectUrl={"http://localhost:3000"}
                                   mode={'redirect'}>
                        <span>Sign In</span>
                    </SignInButton>
                    <button className="button">Join</button>
                </nav>
            </header>
            <main>
                <div className="content">

                    {user ? <h1>{`Welcome ${user.firstName} ${user.lastName}!`}</h1> : <h1>Welcome to Our Sangha!</h1>}

                    <p>Meditate with yogis from around the world, <span className="bold">on your schedule.</span></p>
                    <button className="button">Try for Free</button>
                    <p className="small">No Credit Card Required</p>
                </div>
                <div className="image">
                    <img src="/Pictures/image1.jpg" alt="Meditation Image"
                         style={{"width": "300px", "height":"auto"}}/>
                </div>
            </main>
            <div className="page-two">
                <div className="page-content">
                    <div className="big-text">It is hard to meditate regularly when we do it alone.</div>
                    <div className="small-text">It is easier when we do it together.</div>
                </div>
                <div className="image">
                    <img src="/Pictures/image2.jpg" alt="Meditation Image" style={{"width": "300px", "height":"auto"}}/>
                </div>
            </div>
            <div className="page-three">
                <div className="page-content">
                    <h2>With Sangha, you never have to meditate alone again! Here is how it works:</h2>
                    <div className="image-block">
                        <div className="image-info">
                            <img src="/Pictures/image3.jpg" alt="Schedule a Meditation"/>
                            <p className="image-title">1, Schedule a Meditation</p>
                            <p>Book a 15, 30, or 45 minute time slot that works for you! We’ll match you with another
                                yogi.</p>
                        </div>
                        <div className="image-info">
                            <img src="/Pictures/image4.jpg" alt="Meditate!"/>
                            <p className="image-title">2, Meditate!</p>
                            <p>Join the call, introduce yourselves, and then meditate!</p>
                        </div>
                        <div className="image-info">
                            <img src="/Pictures/image5.jpg" alt="Emotional Check-in"/>
                            <p className="image-title">3, Emotional Check-in</p>
                            <p>At the end of the call, you’ll each have a moment to share your feelings.</p>
                        </div>
                    </div>
                </div>
            </div>
            <footer>
                <div className="footer-left">
                    © 2024 FAMILIA IO Inc.
                </div>
                <div className="footer-right">
                    <a href="#" className="footer-link">About</a>
                    <a href="#" className="footer-link">Contact</a>
                </div>
            </footer>
        </div>
    );
}
