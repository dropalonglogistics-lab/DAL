'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

const PLATFORM_LINKS = [
    { href: '/search', label: 'Route Search' },
    { href: '/alerts', label: 'Road Alerts' },
    { href: '/community', label: 'Community Hub' },
    { href: '/suggest-route', label: 'Suggest a Route' },
];

const COMPANY_LINKS = [
    { href: '/about', label: 'About DAL' },
    { href: '/blog', label: 'Intelligence Blog' },
    { href: '/careers', label: 'Join as Rider' },
];

const SUPPORT_LINKS = [
    { href: '/help', label: 'Help Center' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
];

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <Link href="/">
                            <Image
                                src="/dal-logo-light.png"
                                alt="Drop Along Logistics (DAL)"
                                height={32}
                                width={120}
                                style={{ objectFit: 'contain', objectPosition: 'left', marginBottom: '20px' }}
                            />
                        </Link>
                        <p className={styles.tagline}>
                            Nigeria&apos;s informal economy moves on DAL. Building the intelligence layer for urban mobility in Port Harcourt and beyond.
                        </p>
                        <div className={styles.socials}>
                            {/* Standardized social links */}
                            <a href="https://twitter.com/dropalong" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>Twitter</a>
                            <a href="https://instagram.com/dropalong" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>Instagram</a>
                            <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>WhatsApp</a>
                        </div>
                    </div>

                    <div className={styles.linksGrid}>
                        <div className={styles.linkCol}>
                            <h4 className={styles.colTitle}>Platform</h4>
                            {PLATFORM_LINKS.map(({ href, label }) => (
                                <Link key={href} href={href} className={styles.footerLink}>{label}</Link>
                            ))}
                        </div>
                        <div className={styles.linkCol}>
                            <h4 className={styles.colTitle}>Company</h4>
                            {COMPANY_LINKS.map(({ href, label }) => (
                                <Link key={href} href={href} className={styles.footerLink}>{label}</Link>
                            ))}
                        </div>
                        <div className={styles.linkCol}>
                            <h4 className={styles.colTitle}>Resources</h4>
                            {SUPPORT_LINKS.map(({ href, label }) => (
                                <Link key={href} href={href} className={styles.footerLink}>{label}</Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <span className={styles.copyright}>
                        © {new Date().getFullYear()} Drop Along Logistics. Nigeria&apos;s Intelligence Layer.
                    </span>
                    <span className={styles.madeIn}>
                        Designed in Port Harcourt 🇳🇬
                    </span>
                </div>
            </div>
        </footer>
    );
}
