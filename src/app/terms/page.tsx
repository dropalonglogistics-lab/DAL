import styles from '@/app/content-pages.module.css';

export default function TermsPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Terms of Service</h1>
            <span className={styles.lastUpdated}>Effective Date: March 30, 2024</span>
            
            <div className={styles.content}>
                <p>
                    By using <strong>Drop Along Logistics (DAL)</strong>, you agree to these Terms of Service. Please read them carefully.
                </p>

                <h2>1. Account Registration</h2>
                <p>
                    To contribute to the Intelligence Layer or use our F2/F3 services, you must create a DAL account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate and complete.
                </p>

                <h2>2. Community Contributions</h2>
                <p>
                    When you suggest a route or report a road alert:
                </p>
                <ul>
                    <li>You grant DAL a non-exclusive, worldwide, royalty-free license to use, reproduce, and publicly display this information for the benefit of the community.</li>
                    <li>You represent that your contributions are based on real-world observations and are not intentionally false or misleading.</li>
                    <li>DAL reserves the right to verify, modify, or remove any contribution at our absolute discretion.</li>
                </ul>

                <h2>3. Points and Leaderboards</h2>
                <p>
                    Community points and leaderboard rankings are intended for engagement and recognition purposes. DAL reserves the right to reset point counts, adjust earning rates, or disqualify users who attempt to manipulate the system for gain.
                </p>

                <h2>4. Intellectual Property</h2>
                <p>
                    The DAL Intelligence Layer, the DAL logo, and all proprietary algorithms are the intellectual property of Drop Along Logistics. Unauthorized scraping, copying, or redistribution of our data is strictly prohibited.
                </p>

                <h2>5. Limitation of Liability</h2>
                <p>
                    DAL provides transit intelligence "as is." While we strive for accuracy, we cannot guarantee the real-time condition of every road or the punctuality of every vehicle. Users are advised to exercise their own discretion when navigating the city.
                </p>

                <h2>6. Termination</h2>
                <p>
                    We may suspend or terminate your access to the platform without notice if we find you have violated these Terms or provided fraudulent intelligence data.
                </p>

                <h2>7. Contact</h2>
                <p>
                    For questions about these Terms, please contact <strong>legal@dropalonglogistics.com</strong>.
                </p>
            </div>
        </div>
    );
}
