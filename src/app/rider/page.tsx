'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { Star, MapPin, Navigation, ShoppingCart } from 'lucide-react';

export default function RiderHome() {
    const [isOnline, setIsOnline] = useState(false);
    const [incomingJob, setIncomingJob] = useState<any>(null);
    const [countdown, setCountdown] = useState(30);

    // Mock incoming job trigger for demonstration
    useEffect(() => {
        if (!isOnline) {
            setIncomingJob(null);
            return;
        }

        const timer = setTimeout(() => {
            // Randomly simulate an incoming delivery vs errand job
            const isErrand = Math.random() > 0.5;

            setIncomingJob({
                id: 'JOB-1029',
                type: isErrand ? 'errand' : 'delivery',
                area: 'GRA Phase 2',
                earnings: isErrand ? '₦2,100 (70% Fee)' : '₦1,850',
                distance: '3.2 km',
                time: '12 mins'
            });
            setCountdown(30);
        }, 8000);

        return () => clearTimeout(timer);
    }, [isOnline]);

    // Countdown logic
    useEffect(() => {
        if (incomingJob && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setIncomingJob(null); // missed job
        }
    }, [incomingJob, countdown]);


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '32px', margin: 0 }}>Welcome back, Rider</h1>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>You are currently {isOnline ? 'Online and visible to customers' : 'Offline'}.</p>
                </div>

                {/* ONLINE/OFFLINE Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--card-bg)', padding: '12px 24px', borderRadius: '50px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        backgroundColor: isOnline ? 'var(--success)' : 'var(--text-secondary)',
                        boxShadow: isOnline ? '0 0 12px var(--success)' : 'none',
                        animation: isOnline ? 'pulse 2s infinite' : 'none'
                    }} />
                    <span style={{ fontWeight: 700, fontSize: '18px', color: isOnline ? 'var(--success)' : 'var(--text-secondary)' }}>
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={isOnline} onChange={e => setIsOnline(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isOnline ? 'var(--success)' : 'var(--border)',
                            borderRadius: '34px', transition: '0.4s'
                        }}>
                            <span style={{
                                position: 'absolute', left: isOnline ? '24px' : '4px', top: '4px',
                                width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: '0.4s'
                            }} />
                        </span>
                    </label>
                </div>
            </div>

            {/* Earnings Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 200px', gap: '20px' }}>
                <Card style={{ padding: '24px' }}>
                    <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Today</p>
                    <h2 style={{ margin: 0, fontSize: '36px', color: 'var(--brand-gold)' }}>₦14,200</h2>
                </Card>
                <Card style={{ padding: '24px' }}>
                    <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontWeight: 600 }}>This Week</p>
                    <h2 style={{ margin: 0, fontSize: '36px', color: 'var(--text-primary)' }}>₦84,500</h2>
                </Card>
                <Card style={{ padding: '24px' }}>
                    <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontWeight: 600 }}>This Month</p>
                    <h2 style={{ margin: 0, fontSize: '36px', color: 'var(--text-primary)' }}>₦320,000</h2>
                </Card>
                <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', color: 'white' }}>
                    <Star color="var(--brand-gold)" fill="var(--brand-gold)" size={32} style={{ marginBottom: '8px' }} />
                    <h2 style={{ margin: 0, fontSize: '32px' }}>4.9</h2>
                    <span style={{ opacity: 0.7, fontSize: '14px' }}>Rating</span>
                </Card>
            </div>

            {/* Recent Trips */}
            <div>
                <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Recent Trips</h3>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: i !== 3 ? '1px solid var(--border)' : 'none' }}>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '16px' }}>Peter Odili Rd → GRA Phase 2</strong>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Yesterday, 4:15 PM • Package Delivery</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <strong style={{ display: 'block', color: 'var(--success)', fontSize: '16px' }}>+₦2,400</strong>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Paid</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Global Keyframes for Pulse injected quickly here */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(26, 140, 78, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(26, 140, 78, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(26, 140, 78, 0); }
                }
            `}} />

            {/* Incoming Job Overlay */}
            {incomingJob && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--brand-black)', width: '100%', maxWidth: '400px',
                        borderRadius: '24px', padding: '32px', border: '2px solid var(--brand-gold)',
                        color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                    }}>

                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(201,162,39,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
                        }}>
                            {incomingJob.type === 'errand' ? (
                                <ShoppingCart size={40} color="var(--brand-gold)" />
                            ) : (
                                <Navigation size={40} color="var(--brand-gold)" />
                            )}
                        </div>

                        <h2 style={{ margin: 0, color: 'var(--brand-gold)' }}>NEW {incomingJob.type.toUpperCase()} REQUEST</h2>
                        <div style={{ fontSize: '48px', fontWeight: 800, margin: '16px 0' }}>{countdown}s</div>

                        <div style={{ backgroundColor: '#1A1A1A', width: '100%', padding: '20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>Area</span>
                                <strong style={{ color: 'white' }}>{incomingJob.area}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>Est. Distance</span>
                                <strong style={{ color: 'white' }}>{incomingJob.distance} ({incomingJob.time})</strong>
                            </div>
                            <div style={{ borderTop: '1px solid #333', margin: '4px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#888' }}>Your Earnings</span>
                                <strong style={{ fontSize: '20px', color: 'var(--success)' }}>{incomingJob.earnings}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                            <Button
                                variant="secondary"
                                size="lg"
                                style={{ backgroundColor: '#222', borderColor: '#333', color: 'white' }}
                                onClick={() => setIncomingJob(null)}
                            >
                                Decline
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                style={{ fontSize: '18px' }}
                                onClick={() => {
                                    setIncomingJob(null);
                                    window.location.href = '/rider/active';
                                }}
                            >
                                ACCEPT
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
