import styles from '@/app/content-pages.module.css';

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Nigeria&apos;s Intelligence Layer</h1>
            <span className={styles.lastUpdated}>The Story of Drop Along Logistics</span>
            
            <div className={styles.content}>
                <p>
                    <strong>Drop Along Logistics (DAL)</strong> was born out of a simple necessity: making urban transit in Port Harcourt smarter, safer, and more predictable. 
                    In a city where the informal economy moves millions of people every day through kekes, buses, and shared taxis, the data on how we move has historically been non-existent or fragmented.
                </p>

                <p>
                    Our platform leverages collective intelligence to map the "unmapped" logic of our city&apos;s transit systems. From Keke routes to real-time traffic alerts, we empower citizens with the data they need to move efficiently and stress-free.
                </p>

                <h2>The Vision</h2>
                <p>
                    We believe that local intelligence is the most powerful tool for solving logistics challenges. By rewarding contributors and verifying data through the community, we&apos;re building a living map of the city that grows every day.
                </p>

                <h2>Our Commitment</h2>
                <p>
                    DAL is more than just an app; it&apos;s a community-driven movement. We are committed to:
                </p>
                <ul>
                    <li><strong>Transparency:</strong> Providing real-time, community-verified data on road conditions.</li>
                    <li><strong>Efficiency:</strong> Reducing travel time by providing the most direct informal transit routes.</li>
                    <li><strong>Growth:</strong> Empowering local contributors through a system of points and monthly rewards.</li>
                </ul>

                <h2>A Note from the Founder</h2>
                <p>
                    Port Harcourt is a vibrant, fast-moving city. Our goal is to ensure that everyone—from students to business professionals—can navigate it with absolute confidence. DAL is the infrastructure that allows our city to move smarter.
                </p>

                <p>
                    Thank you for being part of this journey.
                </p>
            </div>
        </div>
    );
}
