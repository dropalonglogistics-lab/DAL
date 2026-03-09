'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import { showToast } from '@/components/UI/Toast';
import BVNVerifier from '@/components/Forms/BVNVerifier';
import BankAccountVerifier from '@/components/Forms/BankAccountVerifier';
import { RIVERS_STATE_AREAS } from '@/utils/locations';
import { ArrowRight, ShoppingCart, Clock, CheckCircle2 } from 'lucide-react';

const AVAILABILITY_OPTIONS = [
    'Early Morning 6am–10am',
    'Morning 10am–12pm',
    'Afternoon 12pm–4pm',
    'Evening 4pm–8pm',
    'Flexible'
];

const PREFERENCE_OPTIONS = [
    'Market Runs',
    'Document Drops',
    'Pharmacy',
    'Bill Payments',
    'Queue on Behalf',
    'Open to All'
];

const TRANSPORT_OPTIONS = [
    { id: 'foot', label: 'On Foot', icon: '🚶' },
    { id: 'bicycle', label: 'Bicycle', icon: '🚲' },
    { id: 'bike', label: 'Bike (motorcycle)', icon: '🏍️' },
    { id: 'keke', label: 'Keke', icon: '🛺' },
    { id: 'car', label: 'Personal Car', icon: '🚗' },
    { id: 'none', label: 'None', icon: '❌' },
];

export default function BecomeAnErrandWorkerPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(0); // 0 = Landing, 1-3 = Form, 4 = Success
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Basic
        fullName: '',
        phone: '',
        email: '',
        dob: '',
        address: '',
        area: '',

        // Step 2: Availability & Preferences
        availability: [] as string[],
        preferences: [] as string[],
        transport: '',

        // Step 3: Bank & Identity
        bankCode: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        nin: '',
        bvn: '',
        bvnVerified: false,
        agreed: false
    });

    const updateForm = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

    const toggleArrayItem = (key: 'availability' | 'preferences', item: string) => {
        setFormData(prev => {
            const arr = prev[key];
            if (arr.includes(item)) return { ...prev, [key]: arr.filter(i => i !== item) };
            if (item === 'Flexible' || item === 'Open to All') return { ...prev, [key]: [item] }; // Exclusivity logic
            return { ...prev, [key]: [...arr.filter(i => i !== 'Flexible' && i !== 'Open to All'), item] };
        });
    };

    const isStep1Valid = formData.fullName && formData.phone && formData.email && formData.dob && formData.address && formData.area;
    const isStep2Valid = formData.availability.length > 0 && formData.preferences.length > 0 && formData.transport;
    const isStep3Valid = formData.bankCode && formData.accountNumber && formData.accountName && formData.nin && formData.bvnVerified && formData.agreed;

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // 1. Authenticate via OTP first using the email
            const { error: otpError } = await supabase.auth.signInWithOtp({ email: formData.email });
            if (otpError) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: Math.random().toString(36).slice(-8) + 'A1!'
                });
                if (signUpError && signUpError.message !== 'User already registered') throw signUpError;
            }

            const { data: { session } } = await supabase.auth.getSession();
            let userId = session?.user?.id;

            if (!userId) {
                showToast('Please check your email for the login link to verify and complete your application.', 'success');
                localStorage.setItem('pending_errand_application', JSON.stringify(formData));
                return;
            }

            // Update profile
            const { error: profileError } = await supabase.from('profiles').update({
                full_name: formData.fullName,
                phone: formData.phone,
                date_of_birth: formData.dob,
                address: formData.address,
                home_area: formData.area,

                availability_preferences: {
                    availability: formData.availability,
                    preferences: formData.preferences,
                },
                transport_available: formData.transport,

                nin_number: formData.nin,
                bvn: formData.bvn,
                bvn_verified: formData.bvnVerified,

                bank_name: formData.bankName,
                bank_account_number: formData.accountNumber,
                bank_account_name: formData.accountName,

                is_errand_worker: true,
                role: 'errand'
            }).eq('id', userId);

            if (profileError) throw profileError;

            // Show success screen
            setStep(4);

        } catch (error: any) {
            showToast(error.message || 'An error occurred submitting your application', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (step === 0) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: 'white' }}>
                <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '56px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1 }}>
                        Earn Money Around <span style={{ color: 'var(--brand-gold)' }}>Your Schedule.</span>
                    </h1>
                    <p style={{ fontSize: '20px', color: '#888', marginBottom: '48px' }}>
                        Market runs. Document drops. No vehicle required for most tasks. Weekly bank payouts.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '48px', flexWrap: 'wrap' }}>
                        <div style={{ padding: '12px 24px', borderRadius: '50px', border: '1px solid #333', backgroundColor: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={20} color="var(--brand-gold)" /> Flexible Hours
                        </div>
                        <div style={{ padding: '12px 24px', borderRadius: '50px', border: '1px solid #333', backgroundColor: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShoppingCart size={20} color="var(--brand-gold)" /> No Vehicle Needed
                        </div>
                        <div style={{ padding: '12px 24px', borderRadius: '50px', border: '1px solid #333', backgroundColor: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--brand-gold)', fontWeight: 'bold' }}>₦</span> Weekly Payouts
                        </div>
                    </div>

                    <Button size="lg" onClick={() => setStep(1)} rightIcon={<ArrowRight size={20} />}>
                        Join the Errand Team
                    </Button>
                </div>
            </div>
        );
    }

    if (step === 4) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: 'var(--brand-surface)' }}>
                <Card style={{ padding: '48px', textAlign: 'center', maxWidth: '400px' }}>
                    <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 24px' }} />
                    <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Application Received!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        We have successfully received your application. We will review your details and respond within 24 hours.
                    </p>
                    <Button onClick={() => router.push('/')} variant="secondary" style={{ width: '100%' }}>
                        Return Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', gap: '8px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        flex: 1, height: '6px',
                        backgroundColor: i <= step ? 'var(--brand-gold)' : 'var(--border)',
                        borderRadius: '4px', transition: 'var(--transition-fast)'
                    }} />
                ))}
            </div>

            <Card style={{ padding: '32px' }}>
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Step 1: Basic Information</h2>
                        <Input label="Full Name" value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} />
                        <Input label="Phone Number" placeholder="080..." value={formData.phone} onChange={e => updateForm('phone', e.target.value)} />
                        <Input label="Email Address" type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} helperText="We will send your OTP here." />
                        <Input label="Date of Birth" type="date" value={formData.dob} onChange={e => updateForm('dob', e.target.value)} />
                        <Input label="Full House Address" placeholder="Street and Landmark" value={formData.address} onChange={e => updateForm('address', e.target.value)} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600 }}>Home Area (Rivers State)</label>
                            <select
                                value={formData.area}
                                onChange={e => updateForm('area', e.target.value)}
                                style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)' }}
                            >
                                <option value="">Select Area</option>
                                {RIVERS_STATE_AREAS.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={() => setStep(2)} disabled={!isStep1Valid} style={{ marginTop: '16px' }}>Continue</Button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Step 2: Availability & Preferences</h2>

                        <div>
                            <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '12px' }}>When are you usually available?</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {AVAILABILITY_OPTIONS.map(opt => (
                                    <div
                                        key={opt}
                                        onClick={() => toggleArrayItem('availability', opt)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '50px', cursor: 'pointer', fontSize: '14px',
                                            border: `1.5px solid ${formData.availability.includes(opt) ? 'var(--brand-gold)' : 'var(--border)'}`,
                                            backgroundColor: formData.availability.includes(opt) ? 'rgba(201,162,39,0.1)' : 'transparent',
                                            color: formData.availability.includes(opt) ? 'var(--brand-gold)' : 'var(--text-primary)',
                                            fontWeight: formData.availability.includes(opt) ? 600 : 400
                                        }}>
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '12px' }}>What types of errands are you open to?</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {PREFERENCE_OPTIONS.map(opt => (
                                    <div
                                        key={opt}
                                        onClick={() => toggleArrayItem('preferences', opt)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '50px', cursor: 'pointer', fontSize: '14px',
                                            border: `1.5px solid ${formData.preferences.includes(opt) ? 'var(--brand-gold)' : 'var(--border)'}`,
                                            backgroundColor: formData.preferences.includes(opt) ? 'rgba(201,162,39,0.1)' : 'transparent',
                                            color: formData.preferences.includes(opt) ? 'var(--brand-gold)' : 'var(--text-primary)',
                                            fontWeight: formData.preferences.includes(opt) ? 600 : 400
                                        }}>
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Transport Available for Errands</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {TRANSPORT_OPTIONS.map(opt => (
                                    <div
                                        key={opt.id}
                                        onClick={() => updateForm('transport', opt.label)}
                                        style={{
                                            padding: '12px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px',
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            border: `1.5px solid ${formData.transport === opt.label ? 'var(--brand-gold)' : 'var(--border)'}`,
                                            backgroundColor: formData.transport === opt.label ? 'rgba(201,162,39,0.1)' : 'transparent',
                                        }}>
                                        <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                                        <span style={{ fontWeight: formData.transport === opt.label ? 600 : 400 }}>{opt.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</Button>
                            <Button onClick={() => setStep(3)} disabled={!isStep2Valid} style={{ flex: 2 }}>Continue to Verification</Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Step 3: Verification & Payment</h2>

                        <BankAccountVerifier
                            bankCode={formData.bankCode}
                            accountNumber={formData.accountNumber}
                            onBankChange={(code, name) => { updateForm('bankCode', code); updateForm('bankName', name); }}
                            onAccountChange={(acc) => updateForm('accountNumber', acc)}
                            onResolved={(name) => updateForm('accountName', name)}
                        />

                        <Input label="NIN Number" value={formData.nin} onChange={e => updateForm('nin', e.target.value)} />

                        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

                        <BVNVerifier
                            value={formData.bvn}
                            onChange={(val) => updateForm('bvn', val)}
                            onVerified={(isValid) => updateForm('bvnVerified', isValid)}
                        />

                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginTop: '16px' }}>
                            <input type="checkbox" checked={formData.agreed} onChange={e => updateForm('agreed', e.target.checked)} style={{ width: '20px', height: '20px' }} />
                            I accept the DAL Errand Worker Agreement.
                        </label>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <Button variant="secondary" onClick={() => setStep(2)} style={{ flex: 1 }} disabled={loading}>Back</Button>
                            <Button onClick={handleSubmit} disabled={!isStep3Valid} loading={loading} style={{ flex: 2 }}>
                                Submit Application
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
