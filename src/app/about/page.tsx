import styles from '@/app/content-pages.module.css';

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Our Mission</h1>
            
            <div className={styles.content}>
                <p>
                    Drop Along Logistics (DAL) was born out of a simple necessity: making urban transit in Port Harcourt smarter, safer, and more predictable.
                </p>

                <p>
                    Our platform leverages collective intelligence to map the "unmapped" logic of our city's transit systems. From Keke routes to real-time traffic alerts, we empower citizens with the data they need to move efficiently.
                </p>

                <h2>The Vision</h2>
                <p>
                    We believe that local intelligence is the most powerful tool for solving logistics challenges. By rewarding contributors and verifying data through the community, we're building a living map of the city that grows every day.
                </p>

                <h2>A Note from the Founder</h2>
                <p>
                    Port Harcourt is a vibrant, fast-moving city. Our goal is to ensure that everyone—from students to business professionals—can navigate it with confidence. DAL is more than just an app; it's a community-driven movement to improve urban mobility.
                </p>

                <p>
                    Thank you for being part of this journey.
                </p>
            </div>
        </div>
    );
}
