import React from 'react';
import styles from '../legal.module.css';

export const metadata = {
    title: 'Terms of Service | DAL',
};

export default function TermsOfService() {
    return (
        <div className={styles.header}>
            <h1 className={styles.title}>Terms of Service</h1>
            <span className={styles.updatedDate}>Last Revised: April 2026</span>

            <h2>1. Platform Use Agreement</h2>
            <p>
                Welcome to Drop Along Logistics (DAL), Nigeria's intelligence layer for urban mobility. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service. These terms govern your use of the routing community features, delivery tracking, marketplace integrations, and personal shopper services.
            </p>

            <h2>2. Delivery & Marketplace Commitments</h2>
            <p>
                DAL functions as a dynamic logistics marketplace. We connect independent dispatch riders, drivers, and shoppers with end-users. DAL does not directly employ the transport providers and relies strictly on our community rating and verification system to establish trust.
            </p>
            <ul>
                <li><strong>Verified Routes:</strong> Users offering transport along verified routes must complete trips safely or face penalties.</li>
                <li><strong>Personal Shopper:</strong> Shopper services act strictly as purchasing agents; explicit instructions must be communicated via the platform.</li>
                <li><strong>Payments:</strong> All payments initiated on DAL are processed through verified third-party gateways (e.g., Paystack). We prohibit cash exchanges not formally logged on the platform.</li>
            </ul>

            <h2>3. Community Content & Rating System</h2>
            <p>
                Our community intelligence layer heavily relies on user-generated road alerts, route validations, and peer-to-peer ratings. Producing false reports, manipulating the points system, or submitting unverified data constitutes a violation of these Terms.
            </p>

            <h2>4. Points & Referrals</h2>
            <p>
                DAL Awards "Intelligence Points" to users reporting routes and submitting valid referrals. These points carry no fiat currency value and cannot be legally redeemed offline. Points can only be used to claim platform perks, airtime, or premium subscription time subject to DAL’s sole discretion.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
                The DAL interface, underlying algorithms, dynamic routing systems, CSS illustrations, databases, and structural code ("Platform IP") are solely the property of Drop Along Logistics. Decompiling, scraping, or copying elements of the platform is strictly prohibited.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
                DAL acts as an intelligence aggregator and mobility matching system. We are not liable for incidental delays, damage to physical goods transit, or conflicts arising between dispatchers and users. You utilize the platform at your own risk.
            </p>

            <h2>7. Governing Law</h2>
            <p>
                These Terms of Service function and govern in accordance with the laws of the Federal Republic of Nigeria. Any dispute or claim arising out of your use of the website shall be resolved exclusively in the courts located in Port Harcourt, Rivers State.
            </p>
        </div>
    );
}
