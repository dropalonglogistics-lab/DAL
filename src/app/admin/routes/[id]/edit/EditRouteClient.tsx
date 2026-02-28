'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateRouteDetails } from '../../../actions';
import {
    MapPin,
    ChevronLeft,
    Save,
    PlusCircle,
    Navigation,
} from 'lucide-react';
import styles from '@/app/suggest-route/suggest-route.module.css';

interface RouteStop {
    id: string;
    location: string;
    instructions: string;
    vehicle: string;
    fare: string;
}

export default function EditRouteClient({ routeData }: { routeData: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [origin, setOrigin] = useState(routeData.origin || '');
    const [destination, setDestination] = useState(routeData.destination || '');
    const [vehicleType, setVehicleType] = useState(routeData.vehicle_type || '');
    const [status, setStatus] = useState(routeData.status || 'pending');

    // Parse itinerary from JSONb to state array
    const initialStops = routeData.itinerary && routeData.itinerary.length > 0
        ? routeData.itinerary.map((stop: any, idx: number) => ({
            id: Date.now().toString() + idx,
            location: stop.location || '',
            instructions: stop.instruction || stop.instructions || '',
            vehicle: stop.vehicle || '',
            fare: stop.fare ? stop.fare.toString() : ''
        }))
        : [{ id: '1', location: '', instructions: '', vehicle: '', fare: '' }];

    const [stops, setStops] = useState<RouteStop[]>(initialStops);

    const [totalFare, setTotalFare] = useState(routeData.price_estimated || routeData.fare_min || '');
    const [duration, setDuration] = useState(routeData.duration_minutes || '');

    const router = useRouter();

    const addStop = () => {
        setStops([...stops, { id: Date.now().toString(), location: '', instructions: '', vehicle: '', fare: '' }]);
    };

    const removeStop = (id: string) => {
        if (stops.length > 1) {
            setStops(stops.filter(stop => stop.id !== id));
        }
    };

    const updateStop = (id: string, field: keyof RouteStop, value: string) => {
        setStops(stops.map(stop => stop.id === id ? { ...stop, [field]: value } : stop));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('routeId', routeData.id);
        formData.append('origin', origin);
        formData.append('destination', destination);
        formData.append('status', status);
        formData.append('vehicle_type', vehicleType);
        formData.append('fare_max', totalFare.toString());
        formData.append('duration_minutes', duration.toString());

        // Format stops back to JSON correctly
        const formattedStops = stops.map(stop => ({
            location: stop.location,
            instruction: stop.instructions,
            vehicle: stop.vehicle,
            fare: stop.fare ? parseInt(stop.fare) : null
        }));

        formData.append('stopsJSON', JSON.stringify(formattedStops));

        const result = await updateRouteDetails(formData);

        if (result.success) {
            alert('Route updated successfully!');
            router.push('/admin/all-routes');
            router.refresh();
        } else {
            alert(result.error || 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <Link href="/admin/all-routes" className={styles.backLink}>
                <ChevronLeft size={18} />
                Back to All Routes
            </Link>

            <div className={styles.header}>
                <h1 className={styles.title}>Edit Route</h1>
                <p className={styles.subtitle}>Modify route details, adjust pricing, or correct stops.</p>
            </div>

            <div className={styles.card}>
                <form className={styles.form} onSubmit={handleSubmit}>

                    <div className={styles.stopSplitGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Origin</label>
                            <div className={styles.inputWrapper}>
                                <Navigation size={18} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                    className={styles.inputWithIcon}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Destination</label>
                            <div className={styles.inputWrapper}>
                                <MapPin size={18} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className={styles.inputWithIcon}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.stopSplitGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>General Vehicle Type</label>
                            <input
                                type="text"
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value)}
                                placeholder="e.g. Mixed, Bus, Keke"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={styles.input}
                                style={{ backgroundColor: 'var(--card-bg)' }}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.stopsContainer}>
                        <h3>Step-by-Step Directions</h3>
                        {stops.map((stop, index) => (
                            <div key={stop.id} className={styles.stopCard}>
                                <div className={styles.stopHeader}>
                                    <h4>Stop {index + 1}</h4>
                                    {stops.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeStop(stop.id)}
                                            className={styles.removeStopBtn}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Location</label>
                                    <input
                                        type="text"
                                        value={stop.location}
                                        onChange={(e) => updateStop(stop.id, 'location', e.target.value)}
                                        className={styles.input}
                                        required
                                    />
                                </div>

                                <div className={styles.stopSplitGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Take a (Vehicle)</label>
                                        <input
                                            type="text"
                                            value={stop.vehicle}
                                            onChange={(e) => updateStop(stop.id, 'vehicle', e.target.value)}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Est. Fare (₦)</label>
                                        <input
                                            type="number"
                                            value={stop.fare}
                                            onChange={(e) => updateStop(stop.id, 'fare', e.target.value)}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Directions / Instructions</label>
                                    <textarea
                                        value={stop.instructions}
                                        onChange={(e) => updateStop(stop.id, 'instructions', e.target.value)}
                                        className={styles.textarea}
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addStop}
                            className={styles.addStopBtn}
                        >
                            <PlusCircle size={16} /> Add Next Stop
                        </button>
                    </div>

                    <div className={styles.stopSplitGrid} style={{ marginTop: '24px' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Total Est. Fare (₦)</label>
                            <input
                                type="number"
                                value={totalFare}
                                onChange={(e) => setTotalFare(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Total Est. Duration (mins)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving Route...' : 'Save Changes'}
                        {!isSubmitting && <Save size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
