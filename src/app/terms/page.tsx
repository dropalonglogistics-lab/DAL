import styles from '@/app/content-pages.module.css';

export default function TermsPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Terms of Service</h1>
            <span className={styles.lastUpdated}>Last Updated: March 2024</span>
            
            <div className={styles.content}>
                <p>
                    Welcome to Drop Along Logistics. By using our platform, you agree to comply with and be bound by the following terms and conditions.
                </p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using DAL, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </p>

                <h2>2. User Contributions</h2>
                <p>
                    Our platform relies on community-sourced intelligence. When you suggest a route or report an alert:
                </p>
                <ul>
                    <li>You represent that the information is accurate to the best of your knowledge.</li>
                    <li>You grant DAL a non-exclusive, royalty-free license to use and share this data.</li>
                    <li>You agree not to submit false, misleading, or malicious information.</li>
                </ul>

                <h2>3. Points & Rewards</h2>
                <p>
                    Points earned through contributions are subject to verification. DAL reserves the right to audit, adjust, or remove points if fraudulent activity is detected. Points currently have no cash value unless explicitly stated in a specific competition.
                </p>

                <h2>4. Limitation of Liability</h2>
                <p>
                    DAL provides routing and alert information for informational purposes only. While we strive for accuracy, we are not liable for any delays, losses, or damages resulting from the use of our platform. Users should always exercise caution and follow local laws while traveling.
                </p>

                <h2>5. Modifications</h2>
                <p>
                    We may update these terms from time to time. Continued use of the platform after changes are posted constitutes acceptance of the new terms.
                </p>
            </div>
        </div>
    );
}
