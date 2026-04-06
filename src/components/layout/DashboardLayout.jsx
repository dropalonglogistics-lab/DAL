'use client';

import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, ChevronRight, Menu } from 'lucide-react';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className={styles.layoutWrapper}>
            <Navbar />
            <div className={styles.dashboardRoot}>
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <div className={styles.dashboardMain}>
                    {/* Top bar (Sub-header) */}
                    <header className={styles.topBar}>
                        <div className={styles.topBarLeft}>
                            <button className={styles.mobileMenuBtn} onClick={() => setIsSidebarOpen(true)}>
                                <Menu size={20} />
                            </button>
                            <Breadcrumb pathname={pathname} />
                        </div>
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
        </div>
    );
}
