'use client';

import React, { useState } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { showToast } from '@/components/UI/Toast';
import Badge from '@/components/UI/Badge';
import { RIVERS_STATE_AREAS } from '@/utils/locations';
import { HandCoins } from 'lucide-react';

export default function DriverSettings() {
    const [optedIntoErrands, setOptedIntoErrands] = useState(true);
    const [operatingAreas, setOperatingAreas] = useState(['Trans-Amadi', 'Old GRA', 'Port Harcourt City']);
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            showToast('Settings saved successfully', 'success');
            setSaving(false);
        }, 1000);
    };

    const toggleOperatingArea = (area: string) => {
        if (operatingAreas.includes(area)) {
            setOperatingAreas(operatingAreas.filter(a => a !== area));
        } else {
            if (operatingAreas.length >= 5) {
                showToast('Maximum of 5 allowed', 'error');
                return;
            }
            setOperatingAreas([...operatingAreas, area]);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
            <div>
                <h1 style={{ fontSize: '32px', margin: 0 }}>Driver Settings</h1>
                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Manage your premium subscription and preferences.</p>
            </div>

            <Card style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', margin: 0 }}>Subscription Details</h2>
                    <Badge variant="gold">Premium Active</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Current Plan</span>
                        <strong style={{ fontSize: '18px' }}>DAL Road Intel (₦1,500/mo)</strong>
                    </div>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Next Billing Date</span>
                        <strong style={{ fontSize: '18px' }}>March 16, 2026</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="secondary">Update Payment Method</Button>
                    <Button variant="danger">Cancel Subscription</Button>
                </div>
            </Card>

            <Card style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '20px', margin: '0 0 24px' }}>Operating Areas</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Limit your road intelligence alerts (max 5 areas).</p>

                <select
                    onChange={e => {
                        if (e.target.value) toggleOperatingArea(e.target.value);
                        e.target.value = "";
                    }}
                    style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', width: '100%', marginBottom: '16px' }}
                >
                    <option value="">Select an area to add...</option>
                    {RIVERS_STATE_AREAS.filter(a => !operatingAreas.includes(a)).map(area => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {operatingAreas.map(area => (
                        <div key={area} onClick={() => toggleOperatingArea(area)} style={{
                            padding: '6px 16px', borderRadius: '50px', backgroundColor: 'var(--brand-black)', color: 'white',
                            fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                        }}>
                            {area} ×
                        </div>
                    ))}
                </div>
            </Card>

            <Card style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-gold)' }}>
                        <HandCoins size={20} /> Errand Jobs Integration
                    </h2>
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
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                    Accept errand requests during your daily commute. Your premium subscription guarantees a reduced DAL service fee of <strong>20% (instead of 30%)</strong>.
                </p>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="lg" onClick={handleSave} loading={saving}>Save Preferences</Button>
            </div>
        </div>
    );
}
