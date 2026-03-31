'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Instagram, MessageCircle } from 'lucide-react';
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
                        <Link href="/" className={styles.logoLink}>
                            <span className="hidden dark:block">
                                <Image src="/dal-logo-light.png" alt="Drop Along Logistics" width={140} height={40} className="object-contain" />
                            </span>
                            <span className="block dark:hidden">
                                <Image src="/dal-logo-dark.png" alt="Drop Along Logistics" width={140} height={40} className="object-contain" />
                            </span>
                        </Link>
                        <p className={styles.tagline}>
                            Nigeria&apos;s informal economy moves on DAL. Building the intelligence layer for urban mobility in Port Harcourt and beyond.
                        </p>
                        <div className={styles.socials}>
                            <a href="https://twitter.com/dropalong" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Twitter">
                                <Twitter size={18} />
                            </a>
                            <a href="https://instagram.com/dropalong" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                                <Instagram size={18} />
                            </a>
                            <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="WhatsApp">
                                <MessageCircle size={18} />
                            </a>
                        </div>
                    </div>

                    <div className={styles.linksGrid}>
                        <div className={styles.linkCol}>
                            <h4 className={styles.colTitle}>Platform</h4>
                            <div className={styles.links}>
                                {PLATFORM_LINKS.map(({ href, label }) => (
                                    <Link key={href} href={href} className={styles.footerLink}>{label}</Link>
                                ))}
                            </div>
                        </div>
                        <div className={styles.linkCol}>
                            <h4 className={styles.colTitle}>Company</h4>
                            <div className={styles.links}>
                                {COMPANY_LINKS.map(({ href, label }) => (
                                    <Link key={href} href={href} className={styles.footerLink}>{label}</Link>
                                ))}
                            </div>
                        </div>
                        <div className={styles.linkCol}>
                            <h4 className={styles.colTitle}>Resources</h4>
                            <div className={styles.links}>
                                {SUPPORT_LINKS.map(({ href, label }) => (
                                    <Link key={href} href={href} className={styles.footerLink}>{label}</Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <div className={styles.footerInner}>
                    <div className={styles.bottomContent}>
                        <span className={styles.copyright}>
                            © 2026 Drop Along Logistics. <span className={styles.hideMobile}>Nigeria&apos;s Intelligence Layer.</span>
                        </span>
                        <div className={styles.madeIn}>
                            Designed in Port Harcourt 🇳🇬
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
