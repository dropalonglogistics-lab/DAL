import React from 'react';
import styles from '../legal.module.css';

export const metadata = {
    title: 'Privacy Policy | DAL',
};

export default function PrivacyPolicy() {
    return (
        <div className={styles.header}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <span className={styles.updatedDate}>Last Revised: April 2026</span>

            <h2>1. Our Commitment to Your Privacy</h2>
            <p>
                Drop Along Logistics (DAL) values your privacy. We are fully committed strictly to complying with the <strong>Nigerian Data Protection Regulation (NDPR)</strong> and international privacy standards. This policy transparently documents how your data is collected, secured, and managed across the DAL mobility, search, and personal shopper platforms.
            </p>

            <h2>2. Data We Collect</h2>
            <p>To provide and improve our logistics search and delivery ecosystem, we gather the following types of information when you register, launch the app, or engage with our services:</p>
            <ul>
                <li><strong>Identity Information:</strong> Name, valid Nigerian phone number, and verified email address required for routing alerts and delivery receipts.</li>
                <li><strong>Location Dynamics:</strong> Geographic coordinates (GPS), route searches, and frequent transit locations within Port Harcourt required to curate live traffic intelligence.</li>
                <li><strong>Transactions:</strong> Limited identifiers associated with order history, referral interactions, and payment tokens. <i>We do not store your raw credit/debit card numbers on our servers.</i></li>
                <li><strong>Log Data:</strong> Diagnostic statistics detailing app crashes, connection timeouts, and browser device fingerprints via automated analytics.</li>
            </ul>

            <h2>3. How We Utilize Your Data</h2>
            <p>
                We process your information exclusively for essential platform delivery, security operations, and the community intelligence layer:
            </p>
            <ul>
                <li>Powering the DAL real-time matching system (riders/drivers to users).</li>
                <li>Calculating and awarding your Intelligence Points.</li>
                <li>Ensuring network security and detecting fraudulent behavior (e.g., bot alerts).</li>
            </ul>

            <h2>4. Third-Party Handshakes</h2>
            <p>
                We do not sell your personal data. Operational sharing strictly occurs with:
                <br /><br />
                <b>Payment Gateways:</b> Paystack securely processes all fiat currency on DAL.<br />
                <b>Analytics Providers:</b> Platforms like PostHog tracking performance latency without attaching your direct identity.<br />
                <b>Cloud Hosts:</b> Database infrastructure managed within secure ISO-certified facilities via Supabase.
            </p>

            <h2>5. User Rights & Data Retention</h2>
            <p>
                Under NDPR, you possess rights to:
                1. Access the personal data DAL holds.<br />
                2. Rectify incorrect profile identifiers.<br />
                3. Erase entirely unneeded historical logs (excluding completed transactions kept for legal compliance).<br />
                4. Object to algorithmic analytics.<br />
                <br />
                We retain your account details as long as you use our services. Inactive datasets are purged completely after 36 months of deliberate inactivity.
            </p>

            <h2>6. Cookies & Tracking Systems</h2>
            <p>
                DAL uses cookies to authenticate active sessions and log user preferences. Review our comprehensive <strong>Cookie Policy</strong> for instructions detailing how to block non-essential trackers. Note that disabling essential security cookies may degrade the application's functionality.
            </p>
        </div>
    );
}
