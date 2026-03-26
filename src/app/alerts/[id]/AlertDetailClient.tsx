'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Shield, TrafficCone, MapPin, ThumbsUp, ThumbsDown, Send, Loader } from 'lucide-react';
import Link from 'next/link';
import RouteMap from '@/components/Map/RouteMap';

type AlertDetail = {
    id: string;
    type: string;
    description: string;
    area?: string;
    severity?: string;
    vote_score?: number;
    created_at: string;
};

type Comment = {
    id: string;
    body: string;
    created_at: string;
    profiles: { full_name: string; avatar_url?: string } | null;
};

function timeAgo(iso: string) {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'Just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

const ICON_MAP: Record<string, any> = {
    police: <Shield size={22} />, traffic: <TrafficCone size={22} />,
    accident: <AlertTriangle size={22} />, flooding: <MapPin size={22} />,
};

const severityColor = (s?: string) => s === 'critical' ? '#ef4444' : s === 'warning' ? '#f59e0b' : '#3b82f6';

export default function AlertDetailClient() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [alert, setAlert] = useState<AlertDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [score, setScore] = useState(0);
    const [userVote, setUserVote] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        // Load alert
        fetch(`/api/alerts`).then(r => r.json()).then(data => {
            const found = (data.alerts || []).find((a: AlertDetail) => a.id === id);
            setAlert(found || null);
            setScore(found?.vote_score ?? 0);
            setLoading(false);
        });
        // Load comments
        fetch(`/api/alerts/${id}/comments`).then(r => r.json()).then(data => setComments(data.comments || []));
        // Load current vote
        fetch(`/api/alerts/${id}/vote`).then(r => r.json()).then(data => setUserVote(data.userVote ?? 0));
    }, [id]);

    const handleVote = async (v: 1 | -1) => {
        const newVote = userVote === v ? 0 : v;
        setScore(prev => prev + (newVote - userVote));
        setUserVote(newVote);
        await fetch(`/api/alerts/${id}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vote: v }),
        });
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/alerts/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body: commentText.trim() }),
            });
            if (res.ok) {
                const data = await res.json();
                setComments(prev => [...prev, data.comment]);
                setCommentText('');
            } else {
                window.alert('Please sign in to comment.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-secondary)' }}>
            <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
    );

    if (!alert) return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Alert not found.</p>
            <Link href="/alerts" style={{ color: 'var(--color-gold)', fontWeight: 700 }}>← Back to Alerts</Link>
        </div>
    );

    return (
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px' }}>
            <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '24px', fontWeight: 600 }}>
                <ArrowLeft size={16} /> Back
            </button>

            {/* Alert card */}
            <div style={{ background: 'var(--card-bg)', border: `1px solid ${severityColor(alert.severity)}40`, borderRadius: '20px', padding: '28px', marginBottom: '28px', borderLeft: `4px solid ${severityColor(alert.severity)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${severityColor(alert.severity)}18`, color: severityColor(alert.severity), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ICON_MAP[alert.type] ?? <AlertTriangle size={22} />}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'capitalize', margin: 0 }}>{alert.type} Alert</h1>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                            {alert.area && <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}><MapPin size={12} style={{ display: 'inline' }} /> {alert.area}</span>}
                            {alert.severity && <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: `${severityColor(alert.severity)}20`, color: severityColor(alert.severity), textTransform: 'uppercase' }}>{alert.severity}</span>}
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{timeAgo(alert.created_at)}</span>
                        </div>
                    </div>
                </div>

                <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '1rem', margin: '0 0 20px 0' }}>{alert.description}</p>

                {/* Interactive Map */}
                <div style={{ height: '250px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', border: '1px solid var(--border)' }}>
                    <RouteMap 
                        locations={[{
                            title: `${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert`,
                            desc: alert.description,
                            city: alert.area || 'Port Harcourt',
                            type: alert.severity === 'critical' ? 'end' : alert.severity === 'warning' ? 'switch' : 'start'
                        }]}
                    />
                </div>

                {/* Vote buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Was this helpful?</span>
                    <button onClick={() => handleVote(1)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '16px', border: '1.5px solid var(--border)', background: userVote === 1 ? 'rgba(34,197,94,0.12)' : 'transparent', color: userVote === 1 ? '#22c55e' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s' }}>
                        <ThumbsUp size={15} /> {score > 0 ? score : ''}
                    </button>
                    <button onClick={() => handleVote(-1)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '16px', border: '1.5px solid var(--border)', background: userVote === -1 ? 'rgba(239,68,68,0.12)' : 'transparent', color: userVote === -1 ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s' }}>
                        <ThumbsDown size={15} />
                    </button>
                </div>
            </div>

            {/* Comments */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
                Comments ({comments.length})
            </h2>

            {comments.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>No comments yet. Be the first to comment.</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {comments.map(c => (
                    <div key={c.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#000', flexShrink: 0 }}>
                                {c.profiles?.full_name?.charAt(0) ?? '?'}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.profiles?.full_name || 'Anonymous'}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{timeAgo(c.created_at)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{c.body}</p>
                    </div>
                ))}
            </div>

            {/* Comment box */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    rows={2}
                    style={{ flex: 1, background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 14px', color: 'var(--text-primary)', resize: 'none', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }}
                />
                <button onClick={handleComment} disabled={submitting || !commentText.trim()} style={{ alignSelf: 'flex-end', padding: '12px 18px', borderRadius: '12px', background: 'var(--color-gold)', border: 'none', color: '#000', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: !commentText.trim() ? 0.5 : 1 }}>
                    {submitting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                </button>
            </div>
        </div>
    );
}
