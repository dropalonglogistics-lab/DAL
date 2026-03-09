'use client';

import React, { useState } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { MapPin, Navigation2, Phone, MessageSquare, CheckCircle } from 'lucide-react';

export default function RiderActiveJob() {
    const [step, setStep] = useState(1); // 1 = Heading to Pickup, 2 = Arrived at Pickup, 3 = Heading to Dropoff, 4 = Delivered

    // Mock active job data
    const job = {
        id: 'JOB-1029',
        type: 'Package Delivery',
        earnings: '₦1,850',
        customer: { name: 'Chima Obi', phone: '08012345678', rating: '4.8' },
        pickup: { address: '22 Peter Odili Rd, Trans-Amadi', note: 'Call me when you are at the gate.' },
        dropoff: { address: 'Plot 15, GRA Phase 2', note: 'Leave with the security.' },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', position: 'relative' }}>

            {/* Map Area Mock */}
            <div style={{ flex: 1, backgroundColor: '#E5E7EB', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#9CA3AF', fontSize: '24px', fontWeight: 600 }}>Interactive Map View</span>

                {/* Floating Directions Badge */}
                <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'var(--brand-black)', color: 'white', padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <Navigation2 size={32} color="var(--brand-gold)" />
                        <div>
                            <strong style={{ display: 'block', fontSize: '20px' }}>
                                {step <= 2 ? 'Head north on Peter Odili Rd' : 'Continue on Aba Road'}
                            </strong>
                            <span style={{ color: '#ccc' }}>1.2 km • 5 mins</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Details Bottom Sheet */}
            <Card style={{ marginTop: '-40px', zIndex: 10, padding: '24px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '24px' }}>{step <= 2 ? 'Pickup' : 'Dropoff'}</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{job.type} • {job.earnings}</p>
                    </div>
                    <Badge variant={step === 4 ? "green" : "gold"}>
                        {step === 1 && 'Heading to Pickup'}
                        {step === 2 && 'At Pickup'}
                        {step === 3 && 'Heading to Dropoff'}
                        {step === 4 && 'Delivered'}
                    </Badge>
                </div>

                {/* Location Details */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: step <= 2 ? 'var(--brand-gold)' : 'var(--border)' }} />
                        <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--border)' }} />
                        <div style={{ width: '12px', height: '12px', backgroundColor: step >= 3 ? 'var(--brand-gold)' : 'var(--border)' }} />
                    </div>
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <strong style={{ display: 'block', fontSize: '16px', color: step <= 2 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{job.pickup.address}</strong>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Note: {job.pickup.note}</span>
                        </div>
                        <div>
                            <strong style={{ display: 'block', fontSize: '16px', color: step >= 3 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{job.dropoff.address}</strong>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Note: {job.dropoff.note}</span>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />

                {/* Customer Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                            CO
                        </div>
                        <div>
                            <strong style={{ display: 'block', fontSize: '16px' }}>{job.customer.name}</strong>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>★ {job.customer.rating}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button variant="secondary" style={{ padding: '12px', borderRadius: '50%' }}><MessageSquare size={20} /></Button>
                        <Button variant="secondary" style={{ padding: '12px', borderRadius: '50%' }}><Phone size={20} /></Button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div>
                    {step === 1 && (
                        <Button size="lg" style={{ width: '100%' }} onClick={() => setStep(2)}>I've Arrived at Pickup</Button>
                    )}
                    {step === 2 && (
                        <Button size="lg" style={{ width: '100%' }} onClick={() => setStep(3)}>Confirm Pickup & Start Trip</Button>
                    )}
                    {step === 3 && (
                        <Button size="lg" style={{ width: '100%' }} onClick={() => setStep(4)}>Complete Dropoff</Button>
                    )}
                    {step === 4 && (
                        <div style={{ textAlign: 'center' }}>
                            <CheckCircle color="var(--success)" size={48} style={{ margin: '0 auto 16px' }} />
                            <h3 style={{ margin: '0 0 16px' }}>Delivery Completed!</h3>
                            <Button size="lg" style={{ width: '100%' }} onClick={() => window.location.href = '/rider'}>Return to Home</Button>
                        </div>
                    )}
                </div>
            </Card>

        </div>
    );
}
