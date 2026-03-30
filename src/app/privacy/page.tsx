import styles from '@/app/content-pages.module.css';

export default function PrivacyPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <span className={styles.lastUpdated}>Effective Date: March 30, 2024</span>
            
            <div className={styles.content}>
                <p>
                    At <strong>Drop Along Logistics (DAL)</strong>, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform for routing and community intelligence.
                </p>

                <h2>1. Information We Collect</h2>
                <p>
                    We collect information that you provide directly to us, including:
                </p>
                <ul>
                    <li><strong>Account Data:</strong> Name, email, and phone number when you register.</li>
                    <li><strong>Community Data:</strong> Profiles, city location, and biography for the contributor leaderboard.</li>
                    <li><strong>Intelligence Data:</strong> Submitted routes, road alerts, and verification reports.</li>
                    <li><strong>Location Data:</strong> Real-time GPS data (only when the app is active) to provide accurate routing and local alerts.</li>
                </ul>

                <h2>2. How We Use Your Data</h2>
                <p>
                    Your data helps us build the Port Harcourt Intelligence Layer:
                </p>
                <ul>
                    <li>To verify community-sourced transit data for accuracy.</li>
                    <li>To calculate and award community points and leaderboard rankings.</li>
                    <li>To improve our F1 routing algorithms and F2/F3 logistics efficiency.</li>
                    <li>To prevent fraudulent submissions or malicious reports.</li>
                </ul>

                <h2>3. Data Sharing and Protection</h2>
                <p>
                    We do not sell your personal data. We only share information with third parties when necessary to provide our services, comply with Nigerian laws, or protect the safety of our users. All data is encrypted and stored securely within the Supabase ecosystem.
                </p>

                <h2>4. Your Rights (NDPR)</h2>
                <p>
                    In accordance with the <strong>Nigeria Data Protection Regulation (NDPR)</strong>, you have the right to access, correct, or request the deletion of your personal data at any time through your account settings or by contacting our privacy team.
                </p>

                <h2>5. Contact Us</h2>
                <p>
                    If you have any questions about our privacy practices, please contact us at <strong>privacy@dropalonglogistics.com</strong>.
                </p>
            </div>
        </div>
    );
}
