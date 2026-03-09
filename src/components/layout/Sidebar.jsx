'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Home, Map, Package, Star, Settings, LayoutDashboard,
    Briefcase, DollarSign, Clock, CheckSquare, TrendingUp,
    Users, AlertTriangle, Shield, Building, ShoppingCart,
    BarChart2, Megaphone, Coins, UserCheck, Globe,
    Navigation, LogOut, Zap
} from 'lucide-react';
import Badge from '@/components/UI/Badge';
import styles from './Sidebar.module.css';

const NAV_BY_ROLE = {
    user: [
        { href: '/dashboard', label: 'Home', icon: Home },
        { href: '/dashboard/routes', label: 'My Routes', icon: Map },
        { href: '/dashboard/orders', label: 'My Orders', icon: Package },
        { href: '/dashboard/points', label: 'Points', icon: Star },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
    rider: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/active-job', label: 'Active Job', icon: Zap },
        { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
        { href: '/dashboard/history', label: 'Trip History', icon: Clock },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
    errand_worker: [
        { href: '/dashboard', label: 'Home', icon: Home },
        { href: '/dashboard/available-tasks', label: 'Available Tasks', icon: CheckSquare },
        { href: '/dashboard/my-tasks', label: 'My Tasks', icon: Briefcase },
        { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
    driver: [
        { href: '/dashboard', label: 'Road Intel', icon: Map },
        { href: '/dashboard/errand-jobs', label: 'Errand Jobs', icon: Briefcase },
        { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
    business: [
        { href: '/dashboard', label: 'Overview', icon: TrendingUp },
        { href: '/dashboard/products', label: 'Products', icon: ShoppingCart },
        { href: '/dashboard/orders', label: 'Orders', icon: Package },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
    admin: [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/routes', label: 'Routes', icon: Map },
        { href: '/admin/alerts', label: 'Alerts', icon: AlertTriangle },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/businesses', label: 'Businesses', icon: Building },
        { href: '/admin/riders', label: 'Riders', icon: UserCheck },
        { href: '/admin/community', label: 'Community', icon: Globe },
    ],
    super_admin: [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/routes', label: 'Routes', icon: Map },
        { href: '/admin/alerts', label: 'Alerts', icon: AlertTriangle },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/businesses', label: 'Businesses', icon: Building },
        { href: '/admin/riders', label: 'Riders', icon: UserCheck },
        { href: '/admin/community', label: 'Community', icon: Globe },
        { href: '/admin/roles', label: 'Roles', icon: Shield },
        { href: '/admin/platform-settings', label: 'Platform Settings', icon: Settings },
        { href: '/admin/financials', label: 'Financials', icon: DollarSign },
        { href: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
        { href: '/admin/points-log', label: 'Points Log', icon: Coins },
    ],
};

const ROLE_BADGE_VARIANT = {
    user: 'grey',
    rider: 'green',
    errand_worker: 'amber',
    driver: 'amber',
    business: 'gold',
    admin: 'red',
    super_admin: 'red',
};

const ROLE_LABELS = {
    user: 'User',
    rider: 'Rider',
    errand_worker: 'Errand Worker',
    driver: 'Driver',
    business: 'Business',
    admin: 'Admin',
    super_admin: 'Super Admin',
};

export default function Sidebar() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const load = async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            setUser(u);
            if (u) {
                const { data: p } = await supabase
                    .from('profiles')
                    .select('full_name, role, is_admin, points, avatar_url')
                    .eq('id', u.id)
                    .single();
                setProfile(p);
            }
        };
        load();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    // Determine effective role
    const role = profile?.is_admin
        ? (profile?.role === 'super_admin' ? 'super_admin' : 'admin')
        : (profile?.role || 'user');

    const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.user;

    const isActive = (href) => pathname === href || (href !== '/admin' && href !== '/dashboard' && pathname?.startsWith(href));

    const getInitials = () => {
        if (profile?.full_name) return profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        return user?.email?.charAt(0).toUpperCase() ?? 'U';
    };

    return (
        <aside className={styles.sidebar}>
            {/* Logo */}
            <div className={styles.sidebarLogo}>
                <Link href="/">
                    <Image
                        src="/images/dal-logo-icon.png"
                        alt="DAL"
                        height={36}
                        width={36}
                        style={{ objectFit: 'contain' }}
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className={styles.sidebarNav}>
                {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`${styles.sidebarItem} ${isActive(href) ? styles.sidebarItemActive : ''}`}
                    >
                        <Icon size={18} className={styles.sidebarIcon} />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>

            {/* User info card */}
            <div className={styles.userCard}>
                <div className={styles.userAvatar}>
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className={styles.userAvatarImg} />
                    ) : (
                        <span className={styles.userAvatarInitials}>{getInitials()}</span>
                    )}
                </div>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>
                        {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <Badge variant={ROLE_BADGE_VARIANT[role] || 'grey'}>
                        {ROLE_LABELS[role] || role}
                    </Badge>
                </div>
                <button className={styles.logoutBtn} onClick={handleSignOut} aria-label="Sign out">
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
}
