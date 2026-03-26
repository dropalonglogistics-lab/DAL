'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, FileText, Pill, CreditCard, Clock, Wrench, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitErrandOrder } from './actions';

const ERRAND_TYPES = [
    { id: 'market', icon: <ShoppingCart size={24} />, name: 'Market Run', baseFee: 1500, placeholder: 'e.g. 2 cups dried crayfish, 1kg chicken from Mile 1 Market, Mama Ngozi stall' },
    { id: 'document', icon: <FileText size={24} />, name: 'Document Drop', baseFee: 700, placeholder: 'e.g. Deliver this manila folder to the receptionist at GTBank Aba Road branch.' },
    { id: 'pharmacy', icon: <Pill size={24} />, name: 'Pharmacy Pick-up', baseFee: 1000, placeholder: 'e.g. Pick up my prescription from MedPlus (Name: John Doe, Ref: 12345)' },
    { id: 'bill', icon: <CreditCard size={24} />, name: 'Bill Payment', baseFee: 800, placeholder: 'e.g. Go to the PHED office to physically recharge my prepaid meter card.' },
    { id: 'queue', icon: <Clock size={24} />, name: 'Queue for Me', baseFee: 1200, placeholder: 'e.g. Stand in line for me at the NIMC registration center until I arrive.' },
    { id: 'custom', icon: <Wrench size={24} />, name: 'Custom Errand', baseFee: 1000, placeholder: 'e.g. Please go to the tailor at D-Line and pick up my traditional wear.' }
];

const PH_AREAS = [
    'GRA Phase 1-3', 'GRA Phase 4-5', 'D-Line', 'Diobu (Mile 1-3)', 'Town (Port Harcourt)', 
    'Trans Amadi', 'Peter Odili Road', 'Elekahia', 'Woji', 'Rumukwurushi', 'Rumuola', 
    'Rumuigbo', 'Rumuokwuta', 'Choba', 'Other'
];

export default function ShopperRequestClient({ user, profile }: any) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // Step 2
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [specificLocation, setSpecificLocation] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    // Step 3
    const [noPurchase, setNoPurchase] = useState(false);
    const [maxBudget, setMaxBudget] = useState('');
    const [deadline, setDeadline] = useState('ASAP');
    const [instructions, setInstructions] = useState('');

    // Step 4
    const [paymentMethod, setPaymentMethod] = useState('wallet');

    useEffect(() => {
        if (!user && step === 1) {
            toast('Please login to continue', { icon: '🔒' });
            router.push(`/login?next=/shopper/request`);
        }
    }, [user, step, router]);

    const activeType = ERRAND_TYPES.find(e => e.id === selectedType);
    const serviceFee = activeType?.baseFee || 0;

    const handleNext = () => {
        if (step === 1 && !selectedType) return toast.error('Select an errand type');
        if (step === 2 && (!description || !location || !deliveryAddress)) return toast.error('Complete all fields');
        if (step === 3 && (!noPurchase && !maxBudget)) return toast.error('Enter a budget or select "No purchase needed"');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(p => Math.min(p + 1, 4));
    };

    const submit = async () => {
        setLoading(true);
        const res = await submitErrandOrder({
            errand_type: activeType?.name,
            description,
            location: specificLocation ? `${location} - ${specificLocation}` : location,
            delivery_address: deliveryAddress,
            max_budget: noPurchase ? 0 : Number(maxBudget),
            deadline,
            instructions,
            service_fee: serviceFee,
            payment_method: paymentMethod
        });
        setLoading(false);
        if (res.success) {
            toast.success('Errand request sent!');
            router.push(`/shopper/tracking/${res.id}`);
        } else {
            toast.error(res.error || 'Failed to submit request');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto 100px', padding: '0 20px', fontFamily: '"Inter", sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                {step > 1 ? (
                    <button onClick={() => setStep(p => p-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={20} /> Back
                    </button>
                ) : <div />}
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Errand Worker</div>
                <div style={{ color: 'var(--color-gold)', fontSize: '0.9rem', fontWeight: 600 }}>Step {step} of 4</div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', boxShadow: '0 12px 32px var(--color-shadow)' }}>
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>What do you need?</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {ERRAND_TYPES.map(e => {
                                const isSel = selectedType === e.id;
                                return (
                                    <div key={e.id} onClick={() => setSelectedType(e.id)} style={{ position: 'relative', padding: '16px', background: isSel ? 'rgba(212,175,55,0.1)' : 'var(--bg-default)', border: `2px solid ${isSel ? 'var(--color-gold)' : 'var(--border)'}`, borderRadius: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                                        {isSel && <CheckCircle size={20} color="var(--color-gold)" style={{ position: 'absolute', top: '8px', right: '8px' }} />}
                                        <div style={{ color: isSel ? 'var(--color-gold)' : 'var(--text-secondary)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{e.icon}</div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{e.name}</div>
                                    </div>
                                );
                            })}
                        </div>

                        <button onClick={handleNext} disabled={!selectedType} style={{ width: '100%', padding: '16px', background: 'var(--text-primary)', color: 'var(--card-bg)', border: 'none', borderRadius: '14px', fontWeight: 700, marginTop: '12px', cursor: selectedType ? 'pointer' : 'not-allowed', opacity: selectedType ? 1 : 0.5 }}>Continue</button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Tell your worker exactly what you need</h2>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Errand Description</label>
                            <textarea 
                                value={description} 
                                onChange={e=>setDescription(e.target.value)} 
                                maxLength={500}
                                placeholder={activeType?.placeholder} 
                                style={{ width: '100%', height: '120px', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', resize: 'none', fontFamily: '"Inter", sans-serif' }} 
                            />
                            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{description.length}/500</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Task Area</label>
                            <select value={location} onChange={e=>setLocation(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}>
                                <option value="">Select an area in Port Harcourt</option>
                                {PH_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        
                        {location && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Specific location note (optional)</label>
                                <input value={specificLocation} onChange={e=>setSpecificLocation(e.target.value)} placeholder="e.g. Inside Everyday Supermarket" style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Delivery / Return Address</label>
                            <input value={deliveryAddress} onChange={e=>setDeliveryAddress(e.target.value)} placeholder="Where should the worker deliver the result?" style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                        </div>

                        <button onClick={handleNext} style={{ width: '100%', padding: '16px', background: 'var(--text-primary)', color: 'var(--card-bg)', border: 'none', borderRadius: '14px', fontWeight: 700, marginTop: '12px', cursor: 'pointer' }}>Next: Budget & Timing</button>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Budget & Timing</h2>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Max purchase budget (paid to worker later)</label>
                            {!noPurchase && (
                                <div style={{ position: 'relative', marginBottom: '8px' }}>
                                    <span style={{ position: 'absolute', left: '16px', top: '12px', color: 'var(--text-secondary)' }}>₦</span>
                                    <input type="number" value={maxBudget} onChange={e=>setMaxBudget(e.target.value)} placeholder="5000" style={{ width: '100%', padding: '12px 12px 12px 32px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                                </div>
                            )}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="checkbox" checked={noPurchase} onChange={e => { setNoPurchase(e.target.checked); if(e.target.checked) setMaxBudget(''); }} style={{ accentColor: 'var(--color-gold)', width: '18px', height: '18px' }} />
                                No purchase needed (just doing a task)
                            </label>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Deadline</label>
                            <select value={deadline} onChange={e=>setDeadline(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }}>
                                <option value="ASAP">ASAP (Immediate)</option>
                                <option value="Within 2 hours">Within 2 hours</option>
                                <option value="Within 4 hours">Within 4 hours</option>
                                <option value="Tomorrow morning">Tomorrow morning</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Special Instructions (optional)</label>
                            <textarea value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="e.g. Call me before paying the vendor" style={{ width: '100%', height: '80px', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', resize: 'none' }} />
                        </div>

                        <div style={{ padding: '16px', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Service fee:</span>
                                <strong>₦{serviceFee.toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Item budget:</span>
                                <span>{noPurchase ? '₦0' : `₦${Number(maxBudget || 0).toLocaleString()} (pay worker)`}</span>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gold)', fontWeight: 800, fontSize: '1.1rem' }}>
                                <span>Pay now:</span>
                                <span>₦{serviceFee.toLocaleString()}</span>
                            </div>
                        </div>

                        <button onClick={handleNext} style={{ width: '100%', padding: '16px', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '14px', fontWeight: 700, marginTop: '8px', cursor: 'pointer' }}>Review Request</button>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Review Request</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-default)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Errand Type</span>
                                <span style={{ fontWeight: 600 }}>{activeType?.name}</span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description</span>
                                    <button onClick={()=>setStep(2)} style={{ background:'none', border:'none', color:'var(--color-gold)', fontSize:'0.8rem', cursor:'pointer' }}>Edit</button>
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>{description}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Location & Delivery</span>
                                <div style={{ fontSize: '0.9rem' }}>From: {location} {specificLocation ? `(${specificLocation})` : ''}</div>
                                <div style={{ fontSize: '0.9rem' }}>To: {deliveryAddress}</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Timing</span>
                                <span style={{ fontWeight: 600 }}>{deadline}</span>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Payment Method</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: paymentMethod === 'wallet' ? 'rgba(212,175,55,0.05)' : 'var(--bg-default)', border: `2px solid ${paymentMethod === 'wallet' ? 'var(--color-gold)' : 'var(--border)'}`, borderRadius: '16px', cursor: 'pointer' }}>
                                    <input type="radio" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} name="pay" style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700 }}>DAL Wallet</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Balance: ₦{(profile?.wallet_balance || 0).toLocaleString()}</div>
                                    </div>
                                </label>
                                
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: paymentMethod === 'card' ? 'rgba(212,175,55,0.05)' : 'var(--bg-default)', border: `2px solid ${paymentMethod === 'card' ? 'var(--color-gold)' : 'var(--border)'}`, borderRadius: '16px', cursor: 'pointer' }}>
                                    <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} name="pay" style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700 }}>Card via Paystack</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Standard processing fees apply</div>
                                    </div>
                                    <CreditCard color="var(--text-secondary)" />
                                </label>
                            </div>
                        </div>

                        <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, var(--color-gold), #D97706)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', marginTop: '12px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(201,162,39,0.3)' }}>
                            {loading ? 'Processing...' : `Pay Service Fee ₦${serviceFee.toLocaleString()}`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
