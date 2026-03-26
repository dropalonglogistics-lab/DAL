'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

type Notification = {
    id: string;
    type: string;
    title: string;
    body: string;
    url: string | null;
    is_read: boolean;
    created_at: string;
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const fetchUserAndNotifs = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // initial fetch
                const { data } = await supabase.from('notifications')
                    .select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
                if (data) setNotifications(data);

                // Subscribe
                supabase.channel('public:notifications')
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload: any) => {
                        setNotifications(prev => [payload.new as Notification, ...prev]);
                    })
                    .subscribe();
            }
        };
        fetchUserAndNotifs();

        return () => { supabase.removeAllChannels(); };
    }, [supabase]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const markRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setOpen(false);
    };

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        if (userId) {
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', padding: '8px' }}>
                <Bell size={24} color="#C9A227" />
                {unreadCount > 0 && (
                    <div style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>

            {open && (
                <div style={{ position: 'absolute', top: '40px', right: 0, width: '380px', maxHeight: '500px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => {
                                const Content = (
                                    <div style={{ display: 'flex', gap: '12px', padding: '16px', borderBottom: '1px solid var(--border)', background: n.is_read ? 'transparent' : 'rgba(212,175,39,0.05)', transition: 'background 0.2s', cursor: 'pointer' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: n.is_read ? 'normal' : 'bold', color: n.is_read ? 'var(--text-primary)' : '#fff', marginBottom: '4px' }}>
                                                {n.title}
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                {n.body}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)', marginTop: '4px' }} />}
                                    </div>
                                );
                                
                                return n.url ? (
                                    <Link key={n.id} href={n.url} onClick={() => markRead(n.id)} style={{ textDecoration: 'none' }}>
                                        {Content}
                                    </Link>
                                ) : (
                                    <div key={n.id} onClick={() => markRead(n.id)}>
                                        {Content}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
