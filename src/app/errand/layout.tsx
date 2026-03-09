'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListTodo, CheckSquare, DollarSign, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ErrandLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const SIDEBAR_ITEMS = [
        { label: 'Home', href: '/errand', icon: Home },
        { label: 'Available Tasks', href: '/errand/available', icon: ListTodo },
        { label: 'My Tasks', href: '/errand/tasks', icon: CheckSquare },
        { label: 'Earnings', href: '/errand/earnings', icon: DollarSign },
        { label: 'Settings', href: '/errand/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', backgroundColor: 'var(--brand-black)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', color: 'white' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #333' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--brand-gold)' }}>
                        DAL <span style={{ color: 'white' }}>Errand</span>
                    </h1>
                </div>

                <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {SIDEBAR_ITEMS.map(item => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
                                backgroundColor: isActive ? 'rgba(201,162,39,0.1)' : 'transparent',
                                color: isActive ? 'var(--brand-gold)' : '#aaa',
                                fontWeight: isActive ? 600 : 500,
                                transition: 'all 0.2s'
                            }}>
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div style={{ padding: '24px 16px', borderTop: '1px solid #333' }}>
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
