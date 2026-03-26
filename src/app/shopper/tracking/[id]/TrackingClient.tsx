'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, Bike, Car, CheckCircle, Star, Phone, MessageSquare, AlertCircle, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitWorkerRating, sendMessage, fetchMessages } from './actions';
import { useRouter } from 'next/navigation';

const STATUS_FLOW = [
    { id: 'placed', label: 'Errand Requested' },
    { id: 'paid', label: 'Payment Confirmed' },
    { id: 'finding', label: 'Finding a Worker' },
    { id: 'assigned', label: 'Worker Assigned' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'done', label: 'Done' }
];

export default function TrackingClient({ initialOrder }: { initialOrder: any }) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(initialOrder);
    const [worker, setWorker] = useState<any>(null);
    
    // Rating Modal
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);

    // Chat
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Simulated status override since it defaults to 'paid' after checkout
    const statusIndex = STATUS_FLOW.findIndex(s => s.id === (order.status === 'placed' || order.status === 'paid' ? 'finding' : order.status));

    useEffect(() => {
        if (order.status === 'done') {
            setShowRating(true);
            return;
        }

        // Simulating the backend finding a worker API if we are in finding state
        if (order.status === 'paid' || order.status === 'finding') {
            const t = setTimeout(() => {
                // Simulate hitting the assigning API
                fetch('/api/internal/assign-errand-worker', {
                    method: 'POST',
                    body: JSON.stringify({ orderId: order.id })
                }).then(r => r.json()).then(data => {
                    if (data.assigned) {
                        setOrder((p: any) => ({ ...p, status: 'assigned', worker_id: data.worker.id }));
                        setWorker(data.worker);
                        toast.success('Worker matched! Tap to see details.');
                    }
                });
            }, 8000); // Wait 8 seconds before auto-assigning for demo
            return () => clearTimeout(t);
        }

        const interval = setInterval(async () => {
            // Poll for order changes (simplified block)
        }, 15000);
        return () => clearInterval(interval);
    }, [order.id, order.status]);

    // Chat polling
    useEffect(() => {
        if (!chatOpen) return;
        
        const loadMsgs = async () => {
            const data = await fetchMessages(order.id);
            setMessages(data);
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };
        
        loadMsgs();
        const ci = setInterval(loadMsgs, 5000);
        return () => clearInterval(ci);
    }, [chatOpen, order.id]);

    const handleRate = async () => {
        if (rating === 0) return toast.error('Please select a rating.');
        const res = await submitWorkerRating(order.id, rating);
        if (res.success) {
            toast.success(`Thanks! You earned ${res.reward} points.`);
            setShowRating(false);
            router.push('/dashboard');
        }
    };

    const handleSend = async (e: any) => {
        e.preventDefault();
        if (!newMsg.trim()) return;
        setSending(true);
        await sendMessage(order.id, newMsg);
        setNewMsg('');
        setSending(false);
        const data = await fetchMessages(order.id);
        setMessages(data);
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const curIndex = Math.max(0, statusIndex);

    return (
        <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', fontFamily: '"Inter", sans-serif', minHeight: '85vh' }}>
            
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Tracking Errand</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{order.description}</p>
            </div>

            {/* Worker Info Card */}
            {worker && (
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', boxShadow: '0 8px 24px var(--color-shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bike color="var(--color-gold)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{worker.full_name || 'DAL Worker'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Travels by {worker.transport_type || 'Bike'}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setChatOpen(true)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', border: 'none', cursor: 'pointer' }}>
                            <MessageSquare size={18} />
                        </button>
                        <a href={`tel:${worker.phone}`} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                            <Phone size={18} />
                        </a>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '32px' }}>Status</h3>

                <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid rgba(255,255,255,0.1)', marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {STATUS_FLOW.map((sf, idx) => {
                        const isPast = curIndex > idx;
                        const isCurrent = curIndex === idx;
                        const isFuture = curIndex < idx;
                        
                        return (
                            <div key={sf.id} style={{ position: 'relative', opacity: isFuture ? 0.3 : 1 }}>
                                <div style={{ position: 'absolute', left: '-29px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: isPast ? 'var(--color-gold)' : isCurrent ? 'var(--color-gold)' : 'var(--bg-default)', border: `2px solid var(--color-gold)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {isCurrent && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000', animation: 'pulse 1.5s infinite' }} />}
                                </div>
                                <div style={{ fontWeight: 700, color: isCurrent ? 'var(--color-gold)' : 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '4px' }}>{sf.label}</div>
                                
                                {sf.id === 'finding' && isCurrent && <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)' }}>Contacting strictly-vetted workers via priority Tier 1 matching...</div>}
                                {sf.id === 'assigned' && isCurrent && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Look out for a call or message from {worker?.full_name?.split(' ')[0] || 'your worker'}.</div>}
                            </div>
                        );
                    })}
                </div>
                
                {order.status === 'assigned' && (
                    <button onClick={() => setOrder({...order, status: 'in_progress'})} style={{ width: '100%', padding: '12px', background: 'transparent', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '12px', marginTop: '24px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        [Simulate: Move to In Progress]
                    </button>
                )}
                {order.status === 'in_progress' && (
                    <button onClick={() => setOrder({...order, status: 'done'})} style={{ width: '100%', padding: '12px', background: 'transparent', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '12px', marginTop: '24px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        [Simulate: Move to Done]
                    </button>
                )}
            </div>

            {/* Chat Overlay */}
            {chatOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--bg-default)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bike size={18} color="var(--color-gold)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{worker?.full_name || 'Worker'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)' }}>Active Now</div>
                            </div>
                        </div>
                        <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.map((m: any) => {
                            // Let's assume user.id is the viewer. Simplified: if sender_id === worker.id, it's incoming. Else outgoing.
                            const isIncoming = m.sender_id === worker?.id;
                            
                            return (
                                <div key={m.id} style={{ alignSelf: isIncoming ? 'flex-start' : 'flex-end', background: isIncoming ? 'var(--card-bg)' : 'var(--color-gold)', color: isIncoming ? '#FFF' : '#000', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: isIncoming ? '4px' : '16px', borderBottomRightRadius: !isIncoming ? '4px' : '16px', maxWidth: '80%', fontSize: '0.95rem' }}>
                                    {m.text}
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSend} style={{ padding: '16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                        <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '100px', color: '#FFF', outline: 'none' }} />
                        <button type="submit" disabled={sending} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-gold)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', cursor: 'pointer' }}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Rating Modal */}
            {showRating && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--color-gold)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 24px 64px rgba(201,162,39,0.2)' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--color-gold)' }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Errand Completed!</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Rate your worker to help us maintain quality.</p>
                        
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                    <Star size={36} color={rating >= star ? 'var(--color-gold)' : 'rgba(255,255,255,0.2)'} fill={rating >= star ? 'var(--color-gold)' : 'none'} style={{ transition: 'all 0.2s' }} />
                                </button>
                            ))}
                        </div>

                        <button onClick={handleRate} style={{ width: '100%', padding: '16px', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '100px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer' }}>
                            Submit & Collect Points
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
