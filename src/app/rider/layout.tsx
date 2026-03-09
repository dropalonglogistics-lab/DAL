'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Navigation, DollarSign, History, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function RiderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const SIDEBAR_ITEMS = [
        { label: 'Home', href: '/rider', icon: Home },
        { label: 'Active Job', href: '/rider/active', icon: Navigation },
        { label: 'Earnings', href: '/rider/earnings', icon: DollarSign },
        { label: 'Trip History', href: '/rider/history', icon: History },
        { label: 'Settings', href: '/rider/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', backgroundColor: 'var(--card-bg)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--brand-gold)' }}>
                        DAL <span style={{ color: 'var(--text-primary)' }}>Rider</span>
                    </h1>
                </div>

                <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {SIDEBAR_ITEMS.map(item => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                                backgroundColor: isActive ? 'var(--brand-black)' : 'transparent',
                                color: isActive ? 'var(--brand-gold)' : 'var(--text-secondary)',
                                fontWeight: isActive ? 600 : 500,
                                transition: 'all 0.2s'
                            }}>
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div style={{ padding: '24px 16px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%',
                        background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontWeight: 500
                    }}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
