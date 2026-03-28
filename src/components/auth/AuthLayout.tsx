import React from 'react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
    children: React.ReactNode;
    brandHeadline: string;
    brandHighlightWord?: string;
    brandTagline?: string;
}

export default function AuthLayout({ 
    children, 
    brandHeadline, 
    brandTagline 
}: AuthLayoutProps) {
    
    // Split the headline to highlight "smarter"
    const parts = brandHeadline.split('smarter');

    return (
        <div className={styles.container}>
            {/* BRAND PANEL - LEFT */}
            <div className={styles.brandPanel}>
                <div className={styles.svgOverlay}>
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="120" height="130" patternUnits="userSpaceOnUse">
                                <path d="M 120 0 L 0 0 0 130" fill="none" stroke="#C9A227" strokeOpacity="0.15" strokeWidth="0.5" />
                                <circle cx="0" cy="0" r="2.5" fill="#C9A227" fillOpacity="0.3" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        {/* Center focal point */}
                        <circle cx="50%" cy="50%" r="5" fill="none" stroke="#C9A227" strokeOpacity="0.3" strokeWidth="1" />
                    </svg>
                </div>

                <div className={styles.brandContent}>
                    <div className={styles.brandTop}>
                        <img src="/dal-logo-light.png" alt="Drop Along Logistics" className={styles.mainLogo} />
                    </div>

                    <div className={styles.brandMiddle}>
                        <h1 className={styles.headline}>
                            {parts[0]}
                            <span className={styles.goldText}>smarter</span>
                            {parts[1]}
                        </h1>
                        <div className={styles.tagline}>
                            <p>Move smarter. Send faster. Live easier.</p>
                            <p>Route intelligence, on-demand delivery, and personal shopping — in one platform.</p>
                        </div>
                    </div>

                    <div className={styles.brandBottom}>
                        PORT HARCOURT · NIGERIA · 2026
                    </div>
                </div>
            </div>

            {/* FORM PANEL - RIGHT */}
            <div className={styles.formPanel}>
                <div className={styles.scrollContent}>
                    <div className={styles.formContainer}>
                        <div className={styles.mobileLogoContainer}>
                            <img src="/dal-logo-light.png" alt="DAL" className={styles.subLogo} />
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
