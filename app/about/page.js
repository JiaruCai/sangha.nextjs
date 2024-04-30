export default function About() {
    return (
        <main style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            textAlign: 'center', 
            padding: '50px',
            fontFamily: "&apos;Merriweather&apos;, serif", // Replace ' with &apos;
            color: '#333'
        }}>
            <h1 style={{ marginBottom: '0.5em' }}>About Us</h1>
            <section style={{ 
                maxWidth: '800px', 
                lineHeight: '1.7',
                fontSize: '18px',
            }}>
                <p style={{ fontSize: '21px', fontWeight: '300' }}>
                    Welcome to Join Sangha, where we turn meditation into a community experience.
                </p>
                {/* Apply bold style to subtitles */}
                <h2 style={{ fontWeight: 'bold' }}>Our Story</h2>
                <p>In the midst of the tech industry&apos;s tumultuous layoff season, where companies often manipulate performance improvement plans to dismiss employees and avoid severance payouts, the need for personal peace has never been more acute. This environment has left many searching for solace and mental clarity.</p>
                
                <h2 style={{ fontWeight: 'bold' }}>Our Mission</h2>
                <p>At Join Sangha, founded by veterans of the tech world, we understand the challenges faced by those struggling to find balance in a demanding career landscape. Our mission is rooted in the belief that meditation provides not only peace but also a profound sense of community connection.</p>
                
                <h2 style={{ fontWeight: 'bold' }}>The Difference We Make</h2>
                <p>Realizing that many do not have the luxury to set aside time for lengthy meditation retreats, we innovated a solution—online meditation matching. This platform allows individuals to connect with others across the globe for short, guided meditation sessions online, making mental well-being accessible to everyone, anytime and anywhere.</p>
                
                <p>We believe deeply in the power of our product to bring peace and hope to those living in a crowded yet isolated world. Join Sangha is more than just a meditation platform—it&apos;s a movement towards a more mindful, connected society.</p>
            </section>
        </main>
    );
}
