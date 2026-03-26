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
import { ArrowRight, CheckCircle2, CloudUpload, FileText } from 'lucide-react';

const VEHICLE_TYPES = [
    { id: 'bike', label: 'Bike', icon: '🏍️', requiresReg: true, requiresLicence: true },
    { id: 'bicycle', label: 'Bicycle', icon: '🚲', requiresReg: false, requiresLicence: false },
    { id: 'keke', label: 'Keke', icon: '🛺', requiresReg: true, requiresLicence: true },
    { id: 'taxi', label: 'Taxi', icon: '🚕', requiresReg: true, requiresLicence: true },
];

export default function BecomeARiderPage() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(0); // 0 = Landing, 1-5 = Form
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Identity & Location
        fullName: '',
        phone: '',
        email: '',
        dob: '',
        address: '',
        area: '',

        // Step 2: Vehicle
        vehicleType: '',
        vehicleReg: '',
        vehicleYear: '',
        vehicleMake: '',
        vehiclePhoto: null as File | null,

        // Step 3: Documents & BVN
        nin: '',
        ninSlip: null as File | null,
        driverLicence: null as File | null,
        headshot: null as File | null,
        bvn: '',
        bvnVerified: false,

        // Step 4: Bank
        bankCode: '',
        bankName: '',
        accountNumber: '',
        accountName: '',

        // Step 5: Agreement
        agreed: false,
        signature: ''
    });

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleFileUpload = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${path}-${Math.random()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('worker_documents').upload(fileName, file);
        if (error) throw error;
        // Get public URL immediately
        const { data: { publicUrl } } = supabase.storage.from('worker_documents').getPublicUrl(fileName);
        return publicUrl;
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // 1. Authenticate via OTP first using the email
            const { error: otpError } = await supabase.auth.signInWithOtp({ email: formData.email });
            if (otpError) {
                // If they don't have an account, sign them up so we get a user record
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: Math.random().toString(36).slice(-8) + 'A1!' // dummy secure password for OTP flow
                });

                if (signUpError && signUpError.message !== 'User already registered') {
                    throw signUpError;
                }
            }

            // Since we use email OTP, we will ask them to verify and complete the profile logic afterward.
            // For now, let's assume successful user extraction if already logged in, 
            // OR store the form in localStorage and bounce to OTP screen.

            // To be totally clean, let's prompt the OTP right here if not logged in.
            const { data: { session } } = await supabase.auth.getSession();
            let userId = session?.user?.id;

            if (!userId) {
                showToast('Please check your email for the login link to continue and save your application.', 'success');
                localStorage.setItem('pending_rider_application', JSON.stringify(formData));
                // We will handle the actual DB insertion on the callback or next login inside a dedicated route.
                return;
            }

            // If we ARE logged in (e.g existing user upgrading to rider):

            // Upload documents
            let vehiclePhotoUrl = '', ninSlipUrl = '', dlUrl = '', headshotUrl = '';

            if (formData.vehiclePhoto) vehiclePhotoUrl = await handleFileUpload(formData.vehiclePhoto, `vehicle-${userId}`);
            if (formData.ninSlip) ninSlipUrl = await handleFileUpload(formData.ninSlip, `nin-${userId}`);
            if (formData.headshot) headshotUrl = await handleFileUpload(formData.headshot, `headshot-${userId}`);
            if (formData.driverLicence && formData.vehicleType !== 'bicycle') {
                dlUrl = await handleFileUpload(formData.driverLicence, `dl-${userId}`);
            }

            // Update profile
            const { error: profileError } = await supabase.from('profiles').update({
                full_name: formData.fullName,
                phone: formData.phone,
                date_of_birth: formData.dob,
                address: formData.address,
                home_area: formData.area,

                vehicle_type_used: formData.vehicleType,
                vehicle_reg_number: formData.vehicleReg,
                vehicle_year: formData.vehicleYear,
                vehicle_make_model: formData.vehicleMake,

                vehicle_photo_url: vehiclePhotoUrl,
                nin_slip_url: ninSlipUrl,
                driver_licence_url: dlUrl,
                headshot_url: headshotUrl,

                nin_number: formData.nin,
                bvn: formData.bvn,
                bvn_verified: formData.bvnVerified,

                bank_name: formData.bankName,
                bank_account_number: formData.accountNumber,
                bank_account_name: formData.accountName,

                is_rider: true,
                role: 'rider'
            }).eq('id', userId);

            if (profileError) throw profileError;

            showToast('Application submitted successfully!', 'success');
            router.push('/rider');

        } catch (error: any) {
            showToast(error.message || 'An error occurred submitting your application', 'error');
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const isStep1Valid = formData.fullName && formData.phone && formData.email && formData.dob && formData.address && formData.area;

    const selectedVehicle = VEHICLE_TYPES.find(v => v.id === formData.vehicleType);
    const isStep2Valid = formData.vehicleType && formData.vehiclePhoto &&
        (selectedVehicle?.requiresReg ? (formData.vehicleReg && formData.vehicleYear && formData.vehicleMake) : true);

    const isStep3Valid = formData.nin && formData.ninSlip && formData.headshot && formData.bvnVerified &&
        (selectedVehicle?.requiresLicence ? formData.driverLicence : true);

    const isStep4Valid = formData.bankCode && formData.accountNumber && formData.accountName;
    const isStep5Valid = formData.agreed && formData.signature;

    if (step === 0) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--brand-surface)' }}>
                <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--brand-black)', color: 'white' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px', color: 'var(--brand-gold)' }}>
                        Earn on Your Terms. Ride with DAL.
                    </h1>
                    <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 40px' }}>
                        Join the most intelligent urban routing network in Port Harcourt.
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <strong style={{ display: 'block', color: 'var(--brand-gold)', fontSize: '20px' }}>Flexible</strong>
                            <span>Work your own hours</span>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <strong style={{ display: 'block', color: 'var(--brand-gold)', fontSize: '20px' }}>Smart</strong>
                            <span>Seamless job matching</span>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <strong style={{ display: 'block', color: 'var(--brand-gold)', fontSize: '20px' }}>Fast</strong>
                            <span>Weekly bank payouts</span>
                        </div>
                    </div>
                    <Button size="lg" onClick={() => setStep(1)} rightIcon={<ArrowRight size={20} />}>
                        Apply Now
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                        flex: 1,
                        height: '6px',
                        backgroundColor: i <= step ? 'var(--brand-gold)' : 'var(--border)',
                        borderRadius: '4px',
                        transition: 'var(--transition-fast)'
                    }} />
                ))}
            </div>

            <Card style={{ padding: '32px' }}>
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Basic Information</h2>
                        <Input label="Full Name" value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} />
                        <Input label="Phone Number" placeholder="080..." value={formData.phone} onChange={e => updateForm('phone', e.target.value)} />
                        <Input label="Email Address" type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} helperText="We will send a login link here to verify your identity." />
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
                        <Button onClick={nextStep} disabled={!isStep1Valid} style={{ marginTop: '16px' }}>Continue to Vehicle Details</Button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Vehicle Details</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {VEHICLE_TYPES.map(vt => (
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

                        {selectedVehicle?.requiresReg && (
                            <>
                                <Input label="Registration Number" value={formData.vehicleReg} onChange={e => updateForm('vehicleReg', e.target.value)} />
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <Input label="Year" placeholder="2020" style={{ flex: 1 }} value={formData.vehicleYear} onChange={e => updateForm('vehicleYear', e.target.value)} />
                                    <Input label="Make / Model" placeholder="Honda CG110" style={{ flex: 2 }} value={formData.vehicleMake} onChange={e => updateForm('vehicleMake', e.target.value)} />
                                </div>
                            </>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600 }}>Vehicle Photo</label>
                            <input type="file" accept="image/*" onChange={e => updateForm('vehiclePhoto', e.target.files?.[0])} />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <Button variant="secondary" onClick={prevStep} style={{ flex: 1 }}>Back</Button>
                            <Button onClick={nextStep} disabled={!isStep2Valid} style={{ flex: 2 }}>Continue to Identity</Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Identity Verification</h2>

                        <Input label="NIN Number" value={formData.nin} onChange={e => updateForm('nin', e.target.value)} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600 }}>NIN Slip Upload</label>
                            <input type="file" accept="image/*,.pdf" onChange={e => updateForm('ninSlip', e.target.files?.[0])} />
                        </div>

                        {selectedVehicle?.requiresLicence && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '14px', fontWeight: 600 }}>Driver's Licence</label>
                                <input type="file" accept="image/*,.pdf" onChange={e => updateForm('driverLicence', e.target.files?.[0])} />
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600 }}>Clear Headshot (Selfie)</label>
                            <input type="file" accept="image/*" onChange={e => updateForm('headshot', e.target.files?.[0])} />
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />

                        <BVNVerifier
                            value={formData.bvn}
                            onChange={(val) => updateForm('bvn', val)}
                            onVerified={(isValid) => updateForm('bvnVerified', isValid)}
                        />

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <Button variant="secondary" onClick={prevStep} style={{ flex: 1 }}>Back</Button>
                            <Button onClick={nextStep} disabled={!isStep3Valid} style={{ flex: 2 }}>Continue to Banking</Button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Bank Account details</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                            Where should we send your weekly payouts? Name must match your BVN.
                        </p>

                        <BankAccountVerifier
                            bankCode={formData.bankCode}
                            accountNumber={formData.accountNumber}
                            onBankChange={(code, name) => { updateForm('bankCode', code); updateForm('bankName', name); }}
                            onAccountChange={(acc) => updateForm('accountNumber', acc)}
                            onResolved={(name) => updateForm('accountName', name)}
                        />

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <Button variant="secondary" onClick={prevStep} style={{ flex: 1 }}>Back</Button>
                            <Button onClick={nextStep} disabled={!isStep4Valid} style={{ flex: 2 }}>Review Agreement</Button>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>DAL Rider Agreement</h2>

                        <div style={{
                            height: '240px', overflowY: 'auto', border: '1px solid var(--border)',
                            borderRadius: '8px', padding: '16px', fontSize: '13px', backgroundColor: 'var(--brand-off-white)'
                        }}>
                            <strong>DROP ALONG LOGISTICS (DAL) INDEPENDENT CONTRACTOR RIDER AGREEMENT</strong><br /><br />
                            1. Relationship: The Rider acknowledges they are an independent contractor, not an employee.<br /><br />
                            2. Service Standard: The Rider agrees to transport items safely, securely, and within the agreed timeline.<br /><br />
                            3. Compensation: Payments are disbursed weekly. DAL deducts standard platform fees as outlined in the active schedule.<br /><br />
                            4. Equipment: Rider is responsible for providing their own operational vehicle unless otherwise agreed.<br /><br />
                            5. Safety: Rider must obey all Rivers State traffic laws and wear appropriate safely gear (helmets required).
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                            <input type="checkbox" checked={formData.agreed} onChange={e => updateForm('agreed', e.target.checked)} style={{ width: '20px', height: '20px' }} />
                            I accept the Terms & Conditions
                        </label>

                        <Input label="Digital Signature (Type Full Name)" value={formData.signature} onChange={e => updateForm('signature', e.target.value)} />

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <Button variant="secondary" onClick={prevStep} style={{ flex: 1 }} disabled={loading}>Back</Button>
                            <Button onClick={handleSubmit} disabled={!isStep5Valid} loading={loading} style={{ flex: 2 }}>
                                Submit Application
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
