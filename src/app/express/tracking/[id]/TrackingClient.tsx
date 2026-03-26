'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Package, MapPin, Bike, CheckCircle, Star, Phone, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cancelExpressOrder, submitOrderRating } from './actions';
import { useRouter } from 'next/navigation';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

// Simple custom icons could be defined here using L.divIcon if Leaflet was imported, but standard Marker is fine contextually.

const STATUS_FLOW = [
    { id: 'placed', label: 'Order Placed' },
    { id: 'paid', label: 'Payment Confirmed' },
    { id: 'assigned', label: 'Rider Assigned' },
    { id: 'en_route', label: 'En Route to Pickup' },
    { id: 'picked_up', label: 'Picked Up' },
    { id: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' }
];

export default function TrackingClient({ initialOrder }: { initialOrder: any }) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(initialOrder);
    const [rider, setRider] = useState<any>(null);
    const [cancelling, setCancelling] = useState(false);
    
    // Rating Modal
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [ratingSubmitting, setRatingSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (order.status === 'delivered') {
            setShowRating(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            return;
        }
        if (order.status === 'cancelled') return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/orders/${order.id}/location`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder((prev: any) => ({
                        ...prev, 
                        status: data.status,
                        rider_location_lat: data.rider_location_lat,
                        rider_location_lng: data.rider_location_lng
                    }));
                    if (data.rider) setRider(data.rider);

                    if (data.status === 'delivered') {
                        setShowRating(true);
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 5000);
                        clearInterval(interval);
                    }
                }
            } catch (e) {}
        }, 15000);

        return () => clearInterval(interval);
    }, [order.id, order.status]);

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        setCancelling(true);
        const res = await cancelExpressOrder(order.id);
        setCancelling(false);
        if (res.success) {
            toast.success('Order cancelled successfully.');
            setOrder((p: any) => ({ ...p, status: 'cancelled' }));
        } else {
            toast.error(res.error || 'Failed to cancel order.');
        }
    };

    const handleRate = async () => {
        if (rating === 0) return toast.error('Please select a rating.');
        setRatingSubmitting(true);
        const res = await submitOrderRating(order.id, rating);
        setRatingSubmitting(false);
        if (res.success) {
            toast.success(`Thanks for rating! You earned ${res.reward} points.`);
            setShowRating(false);
            router.push('/dashboard');
        } else {
            toast.error(res.error || 'Error submitting rating');
        }
    };

    const getCenter = () => {
        if (order.rider_location_lat && order.rider_location_lng) return [order.rider_location_lat, order.rider_location_lng];
        // Parse "lat,lng" from address strings if possible, otherwise use PH center
        const pMatch = order.pickup_address.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (pMatch) return [parseFloat(pMatch[1]), parseFloat(pMatch[2])];
        return [4.8156, 7.0498]; // Default PH
    };

    const center: any = getCenter();

    // Map parsing for polylines
    let pLat, pLng, dLat, dLng;
    const pM = order.pickup_address.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (pM) { pLat = parseFloat(pM[1]); pLng = parseFloat(pM[2]); }
    const dM = order.dropoff_address.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (dM) { dLat = parseFloat(dM[1]); dLng = parseFloat(dM[2]); }

    const curIndex = STATUS_FLOW.findIndex(s => s.id === order.status);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-default)', fontFamily: '"Inter", sans-serif' }}>
            
            {/* Map Half */}
            <div style={{ height: '45vh', width: '100%', position: 'relative', background: '#111' }}>
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    {pLat && pLng && <Marker position={[pLat, pLng]} />}
                    {dLat && dLng && <Marker position={[dLat, dLng]} />}
                    {order.rider_location_lat && order.rider_location_lng && <Marker position={[order.rider_location_lat, order.rider_location_lng]} />}
                    {pLat && pLng && dLat && dLng && <Polyline positions={[[pLat, pLng], [dLat, dLng]]} color="var(--color-gold)" dashArray="5,10" weight={4} />}
                </MapContainer>
                
                {/* Overlay Header */}
                <div style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: 'var(--card-bg)', padding: '10px 16px', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: order.status === 'cancelled' ? '#F87171' : 'var(--color-gold)', boxShadow: `0 0 10px ${order.status === 'cancelled' ? '#F87171' : 'var(--color-gold)'}` }} />
                        {order.status === 'cancelled' ? 'Trip Cancelled' : 'Live Tracking'}
                    </div>
                </div>
            </div>

            {/* Status Timeline Card */}
            <div style={{ flex: 1, padding: '24px', background: 'var(--bg-default)', position: 'relative', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '-24px', zIndex: 20, boxShadow: '0 -10px 30px rgba(0,0,0,0.2)' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    
                    {/* Rider Info Card (If Assigned) */}
                    {rider && order.status !== 'cancelled' && (
                        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {rider.avatar_url ? <img src={rider.avatar_url} alt={rider.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Bike color="var(--color-gold)" />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{rider.full_name || 'DAL Rider'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={12} color="var(--color-gold)" fill="var(--color-gold)" /> {rider.reputation_score ? (rider.reputation_score / 20).toFixed(1) : '4.9'}
                                    </div>
                                </div>
                            </div>
                            <a href={`tel:${rider.phone}`} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                                <Phone size={18} />
                            </a>
                        </div>
                    )}

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px' }}>Order Status</h3>

                    <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid rgba(255,255,255,0.1)', marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {STATUS_FLOW.map((sf, idx) => {
                            const isPast = curIndex > idx;
                            const isCurrent = curIndex === idx;
                            const isFuture = curIndex < idx;
                            
                            if (order.status === 'cancelled') {
                                return idx === 0 ? (
                                    <div key={sf.id} style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '-25px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#F87171' }} />
                                        <div style={{ fontWeight: 700, color: '#F87171' }}>Order Cancelled</div>
                                    </div>
                                ) : null;
                            }

                            return (
                                <div key={sf.id} style={{ position: 'relative', opacity: isFuture ? 0.4 : 1 }}>
                                    {/* Dot */}
                                    <div style={{ position: 'absolute', left: '-25px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: isPast ? 'var(--color-gold)' : isCurrent ? 'var(--color-gold)' : 'var(--bg-default)', border: `2px solid var(--color-gold)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {isCurrent && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000', animation: 'pulse 1.5s infinite' }} />}
                                    </div>
                                    <div style={{ fontWeight: 700, color: isCurrent ? 'var(--color-gold)' : 'var(--text-primary)', fontSize: '1rem', marginBottom: '4px' }}>{sf.label}</div>
                                    
                                    {/* Contextual subtext */}
                                    {sf.id === 'placed' && isCurrent && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Awaiting payment confirmation</div>}
                                    {sf.id === 'paid' && isCurrent && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Finding the nearest rider...</div>}
                                    {sf.id === 'assigned' && isCurrent && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rider has accepted the request.</div>}
                                </div>
                            );
                        })}
                    </div>

                    {(order.status === 'placed' || order.status === 'paid') && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <button onClick={handleCancel} disabled={cancelling} style={{ background: 'none', border: 'none', color: '#F87171', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Confetti Overlay */}
            {showConfetti && (
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', fontSize: '4rem', animation: 'floatUp 3s ease-out forwards', left: '20%' }}>🎉</div>
                    <div style={{ position: 'absolute', fontSize: '5rem', animation: 'floatUp 4s ease-out forwards', left: '50%' }}>🚀</div>
                    <div style={{ position: 'absolute', fontSize: '3rem', animation: 'floatUp 2.5s ease-out forwards', left: '80%' }}>✨</div>
                    <div style={{ position: 'absolute', fontSize: '4rem', animation: 'floatUp 3.5s ease-out forwards', left: '35%' }}>📦</div>
                    <style>{`@keyframes floatUp { 0% { transform: translateY(100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; } }`}</style>
                </div>
            )}

            {/* Rating Modal */}
            {showRating && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--color-gold)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 24px 64px rgba(201,162,39,0.2)' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--color-gold)' }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Delivery Complete!</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>How was your experience with {rider?.full_name || 'the rider'}?</p>
                        
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                    <Star size={36} color={rating >= star ? 'var(--color-gold)' : 'rgba(255,255,255,0.2)'} fill={rating >= star ? 'var(--color-gold)' : 'none'} style={{ transition: 'all 0.2s' }} />
                                </button>
                            ))}
                        </div>

                        <button onClick={handleRate} disabled={ratingSubmitting} style={{ width: '100%', padding: '16px', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '100px', fontWeight: 800, fontSize: '1.05rem', cursor: ratingSubmitting ? 'not-allowed' : 'pointer' }}>
                            {ratingSubmitting ? 'Submitting...' : 'Submit & Collect Points'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
