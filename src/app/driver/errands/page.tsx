'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { ShoppingCart, HandCoins, CheckCircle2, Clock, MapPin } from 'lucide-react';

export default function DriverErrandsView() {
    const [incomingJob, setIncomingJob] = useState<any>(null);
    const [countdown, setCountdown] = useState(30);

    // Mock incoming job trigger tailored for a driver (usually larger items or longer distances)
    useEffect(() => {
        const timer = setTimeout(() => {
            setIncomingJob({
                id: 'DRV-ERR-492',
                type: 'Bulky Pickup',
                area: 'Choba to GRA',
                description: 'Pick up 3 boxes from Choba campus and deliver to GRA Phase 2.',
                totalFee: 5000,
            });
            setCountdown(30);
        }, 6000);

        return () => clearTimeout(timer);
    }, []);

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
                    <h1 style={{ fontSize: '32px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        Premium Errand Jobs
                    </h1>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>You are currently receiving requests during your downtime.</p>
                </div>

                <Badge variant="gold" style={{ fontSize: '14px', padding: '8px 16px' }}>
                    <HandCoins size={16} style={{ marginRight: '6px' }} />
                    20% Premium Fee Active
                </Badge>
            </div>

            {/* Earnings Cards for Errands specifically */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <Card style={{ padding: '24px', border: '1px solid var(--brand-gold)' }}>
                    <p style={{ margin: '0 0 8px', color: 'var(--brand-gold)', fontWeight: 600 }}>Errand Earnings Today</p>
                    <h2 style={{ margin: 0, fontSize: '36px', color: 'var(--text-primary)' }}>₦12,500</h2>
                </Card>
                <Card style={{ padding: '24px' }}>
                    <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Premium Saved</p>
                    <h2 style={{ margin: 0, fontSize: '36px', color: 'var(--success)' }}>₦1,400</h2>
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>from the reduced 20% fee</p>
                </Card>
            </div>

            {/* Recent Completed Errand Tasks */}
            <div>
                <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Past Errand Jobs</h3>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: i !== 2 ? '1px solid var(--border)' : 'none' }}>
                                <div>
                                    <strong style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Document Delivery <CheckCircle2 size={16} color="var(--success)" />
                                    </strong>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                        <MapPin size={14} /> Trans-Amadi → Garrison • Yesterday
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <strong style={{ display: 'block', color: 'var(--success)', fontSize: '16px' }}>+₦2,400</strong>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Driver Cut (80%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(26, 140, 78, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(26, 140, 78, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(26, 140, 78, 0); }
                }
            `}} />

            {/* Incoming Job Overlay explicitly showing the 20% fee for Premium Drivers */}
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
                            <ShoppingCart size={40} color="var(--brand-gold)" />
                        </div>

                        <h2 style={{ margin: 0, color: 'var(--brand-gold)' }}>NEW ERRAND JOB</h2>
                        <div style={{ fontSize: '48px', fontWeight: 800, margin: '16px 0' }}>{countdown}s</div>

                        <div style={{ backgroundColor: '#1A1A1A', width: '100%', padding: '20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>Type</span>
                                <strong style={{ color: 'white' }}>{incomingJob.type}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>Route</span>
                                <strong style={{ color: 'white' }}>{incomingJob.area}</strong>
                            </div>
                            <div style={{ fontSize: '13px', color: '#ccc', marginTop: '8px', lineHeight: 1.4 }}>
                                "{incomingJob.description}"
                            </div>
                            <div style={{ borderTop: '1px solid #333', margin: '8px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#888', fontSize: '14px' }}>Service Fee</span>
                                <span style={{ color: '#aaa', textDecoration: 'line-through' }}>₦{incomingJob.totalFee}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#888', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <HandCoins size={14} color="var(--brand-gold)" /> DAL Premium Cut (20%)
                                </span>
                                <span style={{ color: '#C0392B' }}>-₦{incomingJob.totalFee * 0.2}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <strong style={{ color: 'white', fontSize: '16px' }}>You Earn (80%)</strong>
                                <strong style={{ fontSize: '24px', color: 'var(--success)' }}>₦{incomingJob.totalFee * 0.8}</strong>
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
                                onClick={() => setIncomingJob(null)}
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
