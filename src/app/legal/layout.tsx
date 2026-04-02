'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './legal.module.css';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const links = [
        { name: 'Terms of Service', href: '/legal/terms' },
        { name: 'Privacy Policy', href: '/legal/privacy' },
        { name: 'Cookie Policy', href: '/legal/cookies' },
    ];

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <h3 className={styles.sidebarTitle}>Legal Center</h3>
                <nav className={styles.nav}>
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link 
                                key={link.href} 
                                href={link.href} 
                                className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
