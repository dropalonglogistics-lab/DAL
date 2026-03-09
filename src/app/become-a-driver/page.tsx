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
import { ArrowRight, Info, ShieldCheck, Map, HandCoins } from 'lucide-react';

const DRIVER_VEHICLE_TYPES = [
    { id: 'keke', label: 'Keke', icon: '🛺' },
    { id: 'taxi', label: 'Taxi', icon: '🚕' },
    { id: 'shuttle', label: 'Shuttle', icon: '🚐' },
    { id: 'bus', label: 'Bus', icon: '🚌' },
];

export default function BecomeADriverPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Basic & Vehicle
        fullName: '',
        phone: '',
        email: '',
        dob: '',
        address: '',
        area: '',
        vehicleType: '',
        vehicleReg: '',
        vehicleYear: '',
        vehiclePhoto: null as File | null,

        // Step 2: Operations & Identity
        operatingAreas: [] as string[],
        drivingHours: '',
        errandOptIn: true, // Default ON
        bvn: '',
        bvnVerified: false,
        nin: '',

        // Step 3: Bank & Subscription
        bankCode: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        agreed: false
    });

    const updateForm = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

    const handleFileUpload = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${path}-${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from('worker_documents').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('worker_documents').getPublicUrl(fileName);
        return publicUrl;
    };

    const toggleOperatingArea = (area: string) => {
        setFormData(prev => {
            const arr = prev.operatingAreas;
            if (arr.includes(area)) return { ...prev, operatingAreas: arr.filter(i => i !== area) };
            if (arr.length >= 5) {
                showToast('You can select a maximum of 5 main operating areas', 'error');
                return prev;
            }
            return { ...prev, operatingAreas: [...arr, area] };
        });
    };

    const isStep1Valid = formData.fullName && formData.phone && formData.email && formData.dob && formData.address && formData.area && formData.vehicleType && formData.vehicleReg && formData.vehicleYear && formData.vehiclePhoto;
    const isStep2Valid = formData.operatingAreas.length > 0 && formData.drivingHours && formData.bvnVerified && formData.nin;
    const isStep3Valid = formData.bankCode && formData.accountNumber && formData.accountName && formData.agreed;

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
                showToast('Please check your email for the login link to verify and complete your application. You will be redirected to Paystack upon login.', 'success');
                localStorage.setItem('pending_driver_application', JSON.stringify(formData));
                return;
            }

            // Upload vehicle photo
            let vehiclePhotoUrl = '';
            if (formData.vehiclePhoto) {
                vehiclePhotoUrl = await handleFileUpload(formData.vehiclePhoto, `driver-vehicle-${userId}`);
            }

            // Update profile
            const { error: profileError } = await supabase.from('profiles').update({
                full_name: formData.fullName,
                phone: formData.phone,
                date_of_birth: formData.dob,
                address: formData.address,
                home_area: formData.area,

                vehicle_type: formData.vehicleType,
                vehicle_reg_number: formData.vehicleReg,
                vehicle_year: formData.vehicleYear,
                vehicle_photo_url: vehiclePhotoUrl,

                operating_areas: formData.operatingAreas,
                driving_hours: formData.drivingHours,
                errand_opt_in: formData.errandOptIn,

                nin_number: formData.nin,
                bvn: formData.bvn,
                bvn_verified: formData.bvnVerified,

                bank_name: formData.bankName,
                bank_account_number: formData.accountNumber,
                bank_account_name: formData.accountName,

                is_driver: true,
                role: 'driver'
            }).eq('id', userId);

            if (profileError) throw profileError;

            // Trigger Paystack Trial redirect
            showToast('Initializing secure Paystack 7-Day trial...', 'success');

            // Note: In real production, this routes to /api/initialize-driver-subscription
            // which handles creating the paystack transaction link and setting up the callback.
            // Using a dummy delay to simulate redirect to Paystack checkout screen
            setTimeout(() => {
                router.push('/driver');
            }, 2000);

        } catch (error: any) {
            showToast(error.message || 'An error occurred submitting your application', 'error');
            setLoading(false);
        }
    };

    if (step === 0) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--brand-surface)' }}>
                <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--brand-black)', color: 'white' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px', color: 'var(--brand-gold)' }}>
                        Drive Smarter. Earn More.
                        <br />
                        <span style={{ color: 'white' }}>Know Before You Go.</span>
                    </h1>
                    <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 40px' }}>
                        Real-time road intelligence for Port Harcourt drivers. Checkpoint alerts, optional errand income, earnings analytics. ₦1,500/month.
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flex: '1 1 200px', maxWidth: '280px' }}>
                            <Map size={32} color="var(--brand-gold)" style={{ margin: '0 auto 16px' }} />
                            <strong style={{ display: 'block', color: 'var(--brand-gold)', fontSize: '20px', marginBottom: '8px' }}>Route Intelligence</strong>
                            <span style={{ fontSize: '14px', color: '#ccc' }}>Real-time alerts for checkpoints, flooding, and traffic.</span>
                        </div>
                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flex: '1 1 200px', maxWidth: '280px' }}>
                            <HandCoins size={32} color="var(--brand-gold)" style={{ margin: '0 auto 16px' }} />
                            <strong style={{ display: 'block', color: 'var(--brand-gold)', fontSize: '20px', marginBottom: '8px' }}>Errand Income</strong>
                            <span style={{ fontSize: '14px', color: '#ccc' }}>Accept tasks on your route and earn extra. We only take 20%.</span>
                        </div>
                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flex: '1 1 200px', maxWidth: '280px' }}>
                            <ShieldCheck size={32} color="var(--brand-gold)" style={{ margin: '0 auto 16px' }} />
                            <strong style={{ display: 'block', color: 'var(--brand-gold)', fontSize: '20px', marginBottom: '8px' }}>Analytics</strong>
                            <span style={{ fontSize: '14px', color: '#ccc' }}>Track your daily income directly in your dashboard.</span>
                        </div>
                    </div>
                    <Button size="lg" onClick={() => setStep(1)} rightIcon={<ArrowRight size={20} />}>
                        Try Free for 7 Days
                    </Button>
                </div>
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
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Step 1: Driver & Vehicle</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <Input label="Full Name" value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} />
                            <Input label="Phone Number" placeholder="080..." value={formData.phone} onChange={e => updateForm('phone', e.target.value)} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <Input label="Email Address" type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} />
                            <Input label="Date of Birth" type="date" value={formData.dob} onChange={e => updateForm('dob', e.target.value)} />
                        </div>

                        <Input label="Full House Address" placeholder="Street and Landmark" value={formData.address} onChange={e => updateForm('address', e.target.value)} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600 }}>Home Area</label>
                            <select value={formData.area} onChange={e => updateForm('area', e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)' }}>
                                <option value="">Select Area</option>
                                {RIVERS_STATE_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                            </select>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

                        <label style={{ fontSize: '14px', fontWeight: 600 }}>Vehicle Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {DRIVER_VEHICLE_TYPES.map(vt => (
                                <div
                                    key={vt.id}
                                    onClick={() => updateForm('vehicleType', vt.id)}
                                    style={{
                                        border: `2px solid ${formData.vehicleType === vt.id ? 'var(--brand-gold)' : 'var(--border)'}`,
                                        padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                        backgroundColor: formData.vehicleType === vt.id ? 'rgba(201, 162, 39, 0.1)' : 'transparent'
                                    }}>
                                    <span style={{ fontSize: '32px' }}>{vt.icon}</span>
                                    <div style={{ fontWeight: 600, marginTop: '8px' }}>{vt.label}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Input label="Registration Number" value={formData.vehicleReg} onChange={e => updateForm('vehicleReg', e.target.value)} />
                            <Input label="Year" placeholder="2018" value={formData.vehicleYear} onChange={e => updateForm('vehicleYear', e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600 }}>Vehicle Photo</label>
                            <input type="file" accept="image/*" onChange={e => updateForm('vehiclePhoto', e.target.files?.[0])} />
                        </div>

                        <Button onClick={() => setStep(2)} disabled={!isStep1Valid} style={{ marginTop: '16px' }}>Continue to Operations</Button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Step 2: Operations & Identity</h2>

                        <div>
                            <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Main Operating Areas (Up to 5)</label>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>We use this to send you personalized Route Intelligence alerts.</p>
                            <select
                                onChange={e => {
                                    if (e.target.value) toggleOperatingArea(e.target.value);
                                    e.target.value = ""; // reset
                                }}
                                style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)', width: '100%', marginBottom: '12px' }}
                            >
                                <option value="">Select an area to add...</option>
                                {RIVERS_STATE_AREAS.filter(a => !formData.operatingAreas.includes(a)).map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {formData.operatingAreas.map(area => (
                                    <div key={area} onClick={() => toggleOperatingArea(area)} style={{
                                        padding: '4px 12px', borderRadius: '50px', backgroundColor: 'var(--brand-black)', color: 'white',
                                        fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                                    }}>
                                        {area} ×
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600 }}>Daily Driving Hours</label>
                            <select value={formData.drivingHours} onChange={e => updateForm('drivingHours', e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid var(--border)' }}>
                                <option value="">Select Hours</option>
                                <option value="Part-time">Part-time (Under 4 hours)</option>
                                <option value="Full-time">Full-time (4-8 hours)</option>
                                <option value="Extended">Extended (8+ hours)</option>
                            </select>
                        </div>

                        <Card style={{ backgroundColor: 'rgba(201,162,39,0.05)', borderColor: 'var(--brand-gold)', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-gold)' }}>
                                    <HandCoins size={20} /> Errand Jobs Income
                                </strong>
                                <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.errandOptIn} onChange={e => updateForm('errandOptIn', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: formData.errandOptIn ? 'var(--success)' : 'var(--border)', borderRadius: '34px', transition: '0.4s' }}>
                                        <span style={{ position: 'absolute', left: formData.errandOptIn ? '24px' : '4px', top: '4px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: '0.4s' }} />
                                    </span>
                                </label>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                                Accept errand requests during your downtime and earn extra income.
                                As a Premium Driver, DAL only takes a <strong>20% service fee</strong> on errand jobs (standard is 30%).
                            </p>
                        </Card>

                        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

                        <Input label="NIN Number" value={formData.nin} onChange={e => updateForm('nin', e.target.value)} />

                        <BVNVerifier
                            value={formData.bvn}
                            onChange={(val) => updateForm('bvn', val)}
                            onVerified={(isValid) => updateForm('bvnVerified', isValid)}
                        />

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</Button>
                            <Button onClick={() => setStep(3)} disabled={!isStep2Valid} style={{ flex: 2 }}>Continue to Subscription</Button>
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

                        <Card style={{ padding: '24px', backgroundColor: '#F8FAFC', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <Info size={24} color="var(--brand-gold)" />
                                <div>
                                    <strong style={{ display: 'block' }}>DAL Premium Subscription</strong>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>₦1,500/month after trial</span>
                                </div>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                <li><strong>No charge today.</strong> Auto-renews on Day 8.</li>
                                <li>Full access to real-time Road Intelligence.</li>
                                <li>Access to Errand Jobs at reduced 20% DAL fee.</li>
                                <li>Cancel anytime from your dashboard.</li>
                            </ul>
                        </Card>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>
                            <input type="checkbox" checked={formData.agreed} onChange={e => updateForm('agreed', e.target.checked)} style={{ width: '20px', height: '20px' }} />
                            I accept the DAL Driver Terms of Service.
                        </label>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <Button variant="secondary" onClick={() => setStep(2)} style={{ flex: 1 }} disabled={loading}>Back</Button>
                            <Button onClick={handleSubmit} disabled={!isStep3Valid} loading={loading} style={{ flex: 2 }}>
                                Start Free 7-Day Trial
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
