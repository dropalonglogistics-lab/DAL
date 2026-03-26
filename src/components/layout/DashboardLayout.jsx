'use client';

import Sidebar from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, ChevronRight } from 'lucide-react';
import NotificationBell from '@/components/Notifications/NotificationBell';
import styles from './DashboardLayout.module.css';

function Breadcrumb({ pathname }) {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs = segments.map((seg, i) => ({
        label: seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        href: '/' + segments.slice(0, i + 1).join('/'),
    }));

    return (
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbItem}>Home</Link>
            {crumbs.map(({ label, href }, i) => (
                <span key={href} className={styles.breadcrumbGroup}>
                    <ChevronRight size={14} className={styles.breadcrumbSep} />
                    {i === crumbs.length - 1 ? (
                        <span className={styles.breadcrumbCurrent}>{label}</span>
                    ) : (
                        <Link href={href} className={styles.breadcrumbItem}>{label}</Link>
                    )}
                </span>
            ))}
        </nav>
    );
}

export default function DashboardLayout({ children }) {
    const pathname = usePathname();

    return (
        <div className={styles.dashboardRoot}>
            <Sidebar />
            <div className={styles.dashboardMain}>
                {/* Top bar */}
                <header className={styles.topBar}>
                    <Breadcrumb pathname={pathname} />
                    <div className={styles.topBarActions}>
                        <NotificationBell />
                    </div>
                </header>

                {/* Page content */}
                <main className={styles.dashboardContent}>
                    {children}
                </main>
            </div>
        </div>
    );
}
