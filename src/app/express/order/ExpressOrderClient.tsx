'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, MapPin, Package, ShieldAlert, CreditCard, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import InteractiveMapWrapper from '@/components/Map/InteractiveMapWrapper';
import { submitExpressOrder } from './actions';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a));
}

const PACKAGE_SIZES = [
    { id: 'envelope', name: 'Envelope/Doc', info: 'Bike or Keke', base: 500, icon: '📤' },
    { id: 'small', name: 'Small parcel', info: 'Bike, Keke, Taxi', base: 800, icon: '📦' },
    { id: 'large', name: 'Large parcel', info: 'Taxi or Keke', base: 1200, icon: '🎒' },
    { id: 'xl', name: 'Extra large', info: 'Taxi only', base: 2000, icon: '🏋️' }
];

export default function ExpressOrderClient({ user, profile, perKmRate }: any) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [pickupAddress, setPickupAddress] = useState('');
    const [pickupName, setPickupName] = useState(profile?.full_name || '');
    const [pickupPhone, setPickupPhone] = useState(profile?.phone || '');
    const [pickupLoc, setPickupLoc] = useState<string | null>(null);

    const [dropoffAddress, setDropoffAddress] = useState('');
    const [dropoffName, setDropoffName] = useState('');
    const [dropoffPhone, setDropoffPhone] = useState('');
    const [dropoffLoc, setDropoffLoc] = useState<string | null>(null);
    const [instructions, setInstructions] = useState('');

    const [itemDesc, setItemDesc] = useState('');
    const [pkgSize, setPkgSize] = useState('small');
    const [isFragile, setIsFragile] = useState(false);
    const [hasCash, setHasCash] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('wallet');

    // Calculated fields
    const [distance, setDistance] = useState(0);

    useEffect(() => {
        if (pickupLoc && dropoffLoc) {
            const [pl, pt] = pickupLoc.split(',').map(Number);
            const [dl, dt] = dropoffLoc.split(',').map(Number);
            setDistance(getDistance(pl, pt, dl, dt));
        }
    }, [pickupLoc, dropoffLoc]);

    useEffect(() => {
        if (!user && step === 1) {
            toast('Please login to continue', { icon: '🔒' });
            router.push(`/login?next=/express/order`);
        }
    }, [user, step]);

    const handleNext = () => {
        if (step === 1 && (!pickupAddress || !pickupName || !pickupPhone || !pickupLoc)) return toast.error('Complete pickup details');
        if (step === 2 && (!dropoffAddress || !dropoffName || !dropoffPhone || !dropoffLoc)) return toast.error('Complete drop-off details');
        if (step === 3 && (!itemDesc)) return toast.error('Item description is required');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(p => Math.min(p + 1, 4));
    };

    const selPkg = PACKAGE_SIZES.find(p => p.id === pkgSize);
    const baseFee = selPkg?.base || 800;
    const distanceFee = distance * perKmRate;
    const totalFee = Math.round(baseFee + distanceFee);

    const submit = async () => {
        setLoading(true);
        const res = await submitExpressOrder({
            pickup_address: pickupAddress, pickup_name: pickupName, pickup_phone: pickupPhone,
            dropoff_address: dropoffAddress, dropoff_name: dropoffName, dropoff_phone: dropoffPhone,
            instructions,
            package_size: pkgSize, is_fragile: isFragile, contains_high_value: hasCash,
            base_fee: baseFee, distance_km: distance, per_km_rate: perKmRate, total_fee: totalFee, payment_method: paymentMethod
        });
        setLoading(false);
        if (res.success) {
            toast.success('Order placed!');
            router.push(`/express/tracking/${res.id}`);
        } else {
            toast.error(res.error || 'Failed to place order');
        }
    };

    const renderMapLine = () => {
        if (!pickupLoc || !dropoffLoc) return null;
        const [p1, p2] = pickupLoc.split(',').map(Number);
        const [d1, d2] = dropoffLoc.split(',').map(Number);
        return (
            <MapContainer center={[p1, p2]} zoom={12} style={{ height: '300px', width: '100%', borderRadius: '16px' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Marker position={[p1, p2]} />
                <Marker position={[d1, d2]} />
                <Polyline positions={[[p1, p2], [d1, d2]]} color="var(--color-gold)" dashArray="5,10" weight={4} />
            </MapContainer>
        );
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
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>DAL Express</div>
                <div style={{ color: 'var(--color-gold)', fontSize: '0.9rem', fontWeight: 600 }}>Step {step} of 4</div>
            </div>

            {/* Content Cards */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', boxShadow: '0 12px 32px var(--color-shadow)' }}>
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Pickup Details</h2>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Address</label>
                            <input value={pickupAddress} onChange={e=>setPickupAddress(e.target.value)} placeholder="Type address or drop pin on map" style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                            <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', marginTop: '12px', border: '1px solid var(--border)' }}>
                                <InteractiveMapWrapper onLocationSelect={(loc) => { setPickupLoc(loc); setPickupAddress(`Pinned Location: ${loc}`); }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Contact Name</label>
                                <input value={pickupName} onChange={e=>setPickupName(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Phone Number</label>
                                <input value={pickupPhone} onChange={e=>setPickupPhone(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                            </div>
                        </div>

                        <button onClick={handleNext} style={{ width: '100%', padding: '16px', background: 'var(--text-primary)', color: 'var(--card-bg)', border: 'none', borderRadius: '14px', fontWeight: 700, marginTop: '12px', cursor: 'pointer' }}>Next: Drop-off</button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Drop-off Details</h2>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Address</label>
                            <input value={dropoffAddress} onChange={e=>setDropoffAddress(e.target.value)} placeholder="Type address or drop pin on map" style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                            <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', marginTop: '12px', border: '1px solid var(--border)' }}>
                                <InteractiveMapWrapper onLocationSelect={(loc) => { setDropoffLoc(loc); setDropoffAddress(`Pinned Location: ${loc}`); }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Recipient Name</label>
                                <input value={dropoffName} onChange={e=>setDropoffName(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Phone Number</label>
                                <input value={dropoffPhone} onChange={e=>setDropoffPhone(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Instructions for Rider</label>
                            <input value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="e.g. Leave with security" style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                        </div>

                        <button onClick={handleNext} style={{ width: '100%', padding: '16px', background: 'var(--text-primary)', color: 'var(--card-bg)', border: 'none', borderRadius: '14px', fontWeight: 700, marginTop: '12px', cursor: 'pointer' }}>Next: Package Info</button>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Item Details</h2>
                        
                        {pickupLoc && dropoffLoc && (
                            <div style={{ background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                                {renderMapLine()}
                                <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Distance: <strong style={{ color: 'var(--color-gold)' }}>{distance.toFixed(1)} km</strong>
                                </div>
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>What are we delivering?</label>
                            <input value={itemDesc} onChange={e=>setItemDesc(e.target.value)} maxLength={150} placeholder="e.g. Laptop charger" style={{ width: '100%', padding: '12px', background: 'var(--bg-default)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{itemDesc.length}/150</div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Package Size (affects base fee)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {PACKAGE_SIZES.map(p => (
                                    <div key={p.id} onClick={() => setPkgSize(p.id)} style={{ padding: '14px', border: `2px solid ${pkgSize === p.id ? 'var(--color-gold)' : 'var(--border)'}`, borderRadius: '16px', cursor: 'pointer', background: pkgSize === p.id ? 'rgba(212,175,55,0.05)' : 'var(--bg-default)' }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{p.icon}</div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Base: ₦{p.base.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{p.info}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-default)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <input type="checkbox" checked={isFragile} onChange={e=>setIsFragile(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--color-gold)' }} />
                                <div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Is this item fragile?</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Handle with extra care</div>
                                </div>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-default)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <input type="checkbox" checked={hasCash} onChange={e=>setHasCash(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--color-gold)' }} />
                                <div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Contains cash over ₦50K?</div>
                                    {hasCash && <div style={{ fontSize: '0.75rem', color: '#F87171', marginTop: '4px' }}>DAL carries a maximum liability limit of ₦100K on uninsured items.</div>}
                                </div>
                            </label>
                        </div>

                        <div style={{ padding: '16px', background: 'rgba(212,175,55,0.1)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-gold)' }}>Live Estimate</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>₦{totalFee.toLocaleString()}</div>
                        </div>

                        <button onClick={handleNext} style={{ width: '100%', padding: '16px', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '14px', fontWeight: 700, marginTop: '8px', cursor: 'pointer' }}>Review & Pay</button>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Review Order</h2>

                        <div style={{ background: 'var(--bg-default)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Delivery Fee</div>
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-gold)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                                ₦{totalFee.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                Base (₦{baseFee.toLocaleString()}) + Distance (₦{Math.round(distanceFee).toLocaleString()})
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pickup</span>
                                <button onClick={()=>setStep(1)} style={{ background:'none', border:'none', color:'var(--color-gold)', fontSize:'0.8rem', cursor:'pointer' }}>Edit</button>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--bg-default)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                                {pickupAddress.replace('Pinned Location: ', '')}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Drop-off</span>
                                <button onClick={()=>setStep(2)} style={{ background:'none', border:'none', color:'var(--color-gold)', fontSize:'0.8rem', cursor:'pointer' }}>Edit</button>
                            </div>
                            <div style={{ padding: '12px', background: 'var(--bg-default)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                                {dropoffAddress.replace('Pinned Location: ', '')}
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
                            {loading ? 'Processing...' : `Confirm & Pay ₦${totalFee.toLocaleString()}`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
