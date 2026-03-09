'use client';

import React, { useState } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { Camera, MessageSquare, Phone, CheckCircle2, Clock, MapPin, Receipt, Upload } from 'lucide-react';

export default function ErrandTaskDetail() {
    const [step, setStep] = useState(1); // 1 = Assigned, 2 = In Progress (At Store/Location), 3 = Upload Receipt/Proof, 4 = Completed
    const [receiptUploaded, setReceiptUploaded] = useState(false);

    // Mock active active task
    const task = {
        id: 'ERRAND-9012',
        type: 'Market Run',
        title: 'Pick up groceries from Next Cash N Carry',
        yourCut: '₦2,100', // 70% of 3000
        customer: { name: 'Sarah Peters', phone: '08098765432' },
        items: ['2x 5L Power Oil', '1x Carton of Indomie (Onion)', '1x 10kg Semovita', 'Tomato Paste (Big)'],
        budget: '₦25,000 (To be paid by customer)',
        location: { name: 'Next Cash N Carry', address: 'Trans-Amadi, Port Harcourt' },
        dropoff: 'Agbani Darego Street, GRA Phase 3',
        notes: 'Please check the expiration date on the Indomie.',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                        <Badge variant="grey">{task.id}</Badge>
                        <Badge variant="gold">{task.type}</Badge>
                    </div>
                    <h1 style={{ fontSize: '32px', margin: 0 }}>{task.title}</h1>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '14px' }}>Your Earnings</span>
                    <strong style={{ fontSize: '28px', color: 'var(--success)' }}>{task.yourCut}</strong>
                </div>
            </div>

            <Card style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', margin: 0 }}>Task Progress</h2>
                    </div>
                    <Badge variant={step === 4 ? "green" : "amber"}>
                        {step === 1 && 'Assigned - Head to Location'}
                        {step === 2 && 'In Progress / Shopping'}
                        {step === 3 && 'Upload Proof'}
                        {step === 4 && 'Completed'}
                    </Badge>
                </div>

                {/* Locations */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: step <= 2 ? 'var(--brand-gold)' : 'var(--border)' }} />
                        <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--border)' }} />
                        <div style={{ width: '12px', height: '12px', backgroundColor: step >= 4 ? 'var(--brand-gold)' : 'var(--border)' }} />
                    </div>
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <strong style={{ display: 'block', fontSize: '16px' }}>Task Location</strong>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{task.location.name} — {task.location.address}</span>
                        </div>
                        <div>
                            <strong style={{ display: 'block', fontSize: '16px' }}>Final Dropoff (If applicable)</strong>
                            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{task.dropoff}</span>
                        </div>
                    </div>
                </div>

                {/* Errand List details */}
                <h3 style={{ fontSize: '18px', margin: '0 0 16px' }}>Shopping List & Details</h3>
                <ul style={{ margin: '0 0 24px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {task.items.map((item, i) => (
                        <li key={i} style={{ fontSize: '15px' }}>{item}</li>
                    ))}
                </ul>
                <div style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    <Clock size={18} /> Note: {task.notes}
                </div>
                <div style={{ padding: '12px', backgroundColor: 'rgba(245,158,11,0.1)', color: '#D97706', borderRadius: '8px', marginBottom: '24px', fontWeight: 600 }}>
                    Estimated Budget: {task.budget}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />

                {/* Customer Contact */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                            SP
                        </div>
                        <div>
                            <strong style={{ display: 'block', fontSize: '16px' }}>{task.customer.name}</strong>
                            <Badge variant="gold" style={{ marginTop: '4px' }}>Customer</Badge>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button variant="secondary" style={{ padding: '12px', borderRadius: '50%' }}><MessageSquare size={20} /></Button>
                        <Button variant="secondary" style={{ padding: '12px', borderRadius: '50%' }}><Phone size={20} /></Button>
                    </div>
                </div>

                {/* Status Actions */}
                <div style={{ backgroundColor: step === 4 ? 'rgba(26,140,78,0.05)' : 'transparent', padding: step === 4 ? '24px' : '0', borderRadius: '12px', textAlign: step === 4 ? 'center' : 'left' }}>
                    {step === 1 && (
                        <Button size="lg" style={{ width: '100%' }} onClick={() => setStep(2)}>I have arrived at the location</Button>
                    )}

                    {step === 2 && (
                        <Button size="lg" style={{ width: '100%' }} onClick={() => setStep(3)}>Items purchased / Task finished</Button>
                    )}

                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ border: '2px dashed var(--border)', padding: '32px', textAlign: 'center', borderRadius: '12px' }}>
                                <Receipt size={40} color="var(--text-secondary)" style={{ margin: '0 auto 12px' }} />
                                <strong style={{ display: 'block', marginBottom: '8px' }}>Upload Receipt / Proof</strong>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'block', marginBottom: '16px' }}>Take a clear photo of the receipt or the delivered items.</span>
                                <Button
                                    variant="secondary"
                                    onClick={() => setReceiptUploaded(true)}
                                    disabled={receiptUploaded}
                                    style={{ borderColor: receiptUploaded ? 'var(--success)' : '' }}
                                >
                                    {receiptUploaded ? 'Receipt Uploaded ✓' : 'Select Photo'} <Camera size={18} style={{ marginLeft: '8px' }} />
                                </Button>
                            </div>
                            <Button size="lg" disabled={!receiptUploaded} onClick={() => setStep(4)}>Submit Proof & Complete Task</Button>
                        </div>
                    )}

                    {step === 4 && (
                        <>
                            <CheckCircle2 color="var(--success)" size={48} style={{ margin: '0 auto 16px' }} />
                            <h3 style={{ margin: '0 0 8px' }}>Task Completed!</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You earned ₦2,100 from this errand. The proof was sent to the customer.</p>
                            <Button variant="secondary" style={{ width: '100%' }} onClick={() => window.location.href = '/errand/tasks'}>Return to Tasks List</Button>
                        </>
                    )}
                </div>

            </Card>
        </div>
    );
}
