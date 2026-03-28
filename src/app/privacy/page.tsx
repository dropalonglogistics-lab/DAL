import styles from '@/app/content-pages.module.css';

export default function PrivacyPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <span className={styles.lastUpdated}>Last Updated: March 2024</span>
            
            <div className={styles.content}>
                <p>
                    At Drop Along Logistics (DAL), we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.
                </p>

                <h2>1. Information We Collect</h2>
                <p>
                    We collect information that you provide directly to us, including:
                </p>
                <ul>
                    <li>Account information (name, email, phone number)</li>
                    <li>Profile information (city, biography, profile picture)</li>
                    <li>Location data (to provide accurate routing and alerts)</li>
                    <li>Contribution data (submitted routes, road alerts, and comments)</li>
                </ul>

                <h2>2. How We Use Information</h2>
                <p>
                    Your data helps us:
                </p>
                <ul>
                    <li>Provide and improve our intelligent routing services</li>
                    <li>Verify community-sourced data for accuracy</li>
                    <li>Notify you of relevant road alerts and platform updates</li>
                    <li>Prevent fraud and ensure the safety of our community</li>
                </ul>

                <h2>3. Data Sharing</h2>
                <p>
                    We do not sell your personal data. We only share information with third parties when necessary to provide our services, comply with the law, or protect the rights of our users.
                </p>

                <h2>4. NDPR Compliance</h2>
                <p>
                    DAL is committed to complying with the Nigeria Data Protection Regulation (NDPR). You have the right to access, correct, or delete your personal data at any time through your account settings.
                </p>

                <h2>5. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at <strong>privacy@dropalonglogistics.com</strong>.
                </p>
            </div>
        </div>
    );
}
