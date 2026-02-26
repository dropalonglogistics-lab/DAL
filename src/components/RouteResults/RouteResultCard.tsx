'use client';

import { useState } from 'react';
import { Clock, AlertTriangle, ChevronRight, MapPin, CreditCard, Info, Navigation, TrafficCone } from 'lucide-react';
import styles from './RouteResultCard.module.css';

interface ItineraryStep {
    type: 'stop' | 'switch' | 'junction';
    location: string;
    description?: string;
    vehicleFrom?: string;
    vehicleTo?: string;
}

interface RouteResultProps {
    title: string;
    time: string;
    fare_min: number;
    fare_max: number;
    traffic: 'clear' | 'moderate' | 'heavy';
    warnings?: string[];
    isRecommended?: boolean;
    itinerary?: ItineraryStep[];
}

export default function RouteResultCard({
    title,
    time,
    fare_min,
    fare_max,
    traffic,
    warnings,
    isRecommended,
    itinerary = []
}: RouteResultProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const trafficColors = {
        clear: '#22c55e',
        moderate: '#f59e0b',
        heavy: '#ef4444'
    };

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            className={`${styles.card} ${isRecommended ? styles.recommended : ''} ${isExpanded ? styles.expanded : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {isRecommended && <div className={styles.badge}>Recommended</div>}

            <div className={styles.header}>
                <div className={styles.mainInfo}>
                    <h3 className={styles.title}>{title}</h3>
                    <div className={styles.meta}>
                        <div className={styles.metaItem}>
                            <Clock size={14} />
                            <span>{time}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <CreditCard size={14} />
                            <span>₦{fare_min?.toLocaleString()} - ₦{fare_max?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.trafficIndicator} style={{ color: trafficColors[traffic] }}>
                    <TrafficCone size={18} />
                    <span className={styles.trafficText}>{traffic.charAt(0).toUpperCase() + traffic.slice(1)}</span>
                </div>
            </div>

            {warnings && warnings.length > 0 && (
                <div className={styles.warnings}>
                    {warnings.map((warning, index) => (
                        <div key={index} className={styles.warningItem}>
                            <AlertTriangle size={12} />
                            <span>{warning}</span>
                        </div>
                    ))}
                </div>
            )}

            {isExpanded && itinerary && itinerary.length > 0 && (
                <div className={styles.itinerary}>
                    <div className={styles.itineraryHeader}>
                        <Navigation size={16} />
                        <span>Step-by-Step Itinerary</span>
                    </div>
                    {itinerary.map((step, index) => (
                        <div key={index} className={styles.itineraryLine}>
                            <div className={styles.step}>
                                <div className={styles.iconContainer}>
                                    {step.type === 'stop' && <MapPin size={16} className={styles.stepIcon} />}
                                    {step.type === 'switch' && <Info size={16} className={styles.stepIcon} />}
                                    {step.type === 'junction' && <Navigation size={16} className={styles.stepIcon} />}
                                </div>
                                <div className={styles.stepContent}>
                                    <div className={styles.stepLocation}>{step.location}</div>
                                    {step.description && <div className={styles.stepDescription}>{step.description}</div>}
                                    {step.type === 'switch' && (
                                        <div className={styles.switchInfo}>
                                            Change from <span className={styles.vehicle}>{step.vehicleFrom}</span> to <span className={styles.vehicle}>{step.vehicleTo}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.footer}>
                <button className={styles.detailsBtn} onClick={toggleExpand}>
                    {isExpanded ? 'Show less' : 'View full itinerary'}
                    <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
                </button>
            </div>
        </div>
    );
}
