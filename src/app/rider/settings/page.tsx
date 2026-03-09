'use client';

import React, { useState } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { showToast } from '@/components/UI/Toast';

export default function RiderSettings() {
    // In a real app, this would be fetched from Supabase Profiles
    const [optedIntoErrands, setOptedIntoErrands] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            showToast('Settings saved successfully', 'success');
            setSaving(false);
        }, 1000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
            <div>
                <h1 style={{ fontSize: '32px', margin: 0 }}>Driver Settings</h1>
                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Manage your preferences and vehicle details.</p>
            </div>

            <Card style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '20px', margin: '0 0 24px' }}>Job Preferences</h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div>
                        <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px' }}>Accept Errand Jobs</strong>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', maxWidth: '500px' }}>
                            When enabled, you will receive requests to pick up and deliver shopping or custom errands, usually for a higher fee. Our standard 30% commission applies.
                        </span>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px', cursor: 'pointer', flexShrink: 0 }}>
                        <input type="checkbox" checked={optedIntoErrands} onChange={e => setOptedIntoErrands(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: optedIntoErrands ? 'var(--success)' : 'var(--border)',
                            borderRadius: '34px', transition: '0.4s'
                        }}>
                            <span style={{
                                position: 'absolute', left: optedIntoErrands ? '24px' : '4px', top: '4px',
                                width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: '0.4s'
                            }} />
                        </span>
                    </label>
                </div>
            </Card>

            <Card style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '20px', margin: '0 0 24px' }}>Vehicle Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <Input label="Vehicle Type" value="Motorcycle (Bike)" disabled />
                    <Input label="Registration Number" value="RVS-123-XY" disabled />
                    <Input label="Make / Model" value="Qlink 150" disabled />
                    <Input label="Year" value="2020" disabled />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '16px' }}>
                    To update your vehicle details or upload new documents, please contact DAL Support from the Help Center.
                </p>
            </Card>

            <Card style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '20px', margin: '0 0 24px' }}>Payout Bank Account</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <Input label="Bank Name" value="Guaranty Trust Bank" disabled />
                    <Input label="Account Number" value="0123456789" disabled />
                    <Input label="Account Name" value="Chima Obi" disabled style={{ gridColumn: 'span 2' }} />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '16px' }}>
                    Payout accounts can only be changed after secondary BVN verification.
                </p>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="lg" onClick={handleSave} loading={saving}>Save Preferences</Button>
            </div>
        </div>
    );
}
