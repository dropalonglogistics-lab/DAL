import { redirect } from 'next/navigation'
import { isAdmin } from '@/utils/supabase/admin-check'
import Link from 'next/link'
import { LayoutDashboard, Users, AlertTriangle, Home } from 'lucide-react'
import styles from './admin.module.css'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const admin = await isAdmin()

    if (!admin) {
        redirect('/')
    }

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>Admin Portal</h2>
                </div>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.navItem}>
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link href="/admin/users" className={styles.navItem}>
                        <Users size={20} /> User Management
                    </Link>
                    <Link href="/alerts" className={styles.navItem}>
                        <AlertTriangle size={20} /> View Alerts
                    </Link>
                    <Link href="/" className={styles.navItem}>
                        <Home size={20} /> Back to Site
                    </Link>
                </nav>
            </aside>
            <main className={styles.content}>
                {children}
            </main>
        </div>
    )
}
