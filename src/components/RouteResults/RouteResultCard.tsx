'use client';

import { useState } from 'react';
import { Clock, AlertTriangle, ChevronRight, MapPin, CreditCard, Info, Navigation } from 'lucide-react';
import styles from './RouteResultCard.module.css';

interface ItineraryStep {
    type: 'start' | 'stop' | 'switch' | 'end';
    location: string;
    instruction: string;
    vehicle?: string;
}

interface RouteResultProps {
    title: string;
    time: string;
    fare: string;
    traffic: 'clear' | 'moderate' | 'heavy';
    warnings?: string[];
    isRecommended?: boolean;
    vehicleType?: string;
    itinerary?: ItineraryStep[];
    fareRange?: string;
}

export default function RouteResultCard({
    title,
    time,
    fare,
    traffic,
    warnings,
    isRecommended,
    vehicleType,
    itinerary: initialItinerary,
    fareRange
}: RouteResultProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    // Robust parsing for itinerary
    let itinerary = initialItinerary;
    if (typeof initialItinerary === 'string') {
        try {
            itinerary = JSON.parse(initialItinerary);
        } catch (e) {
            console.error("Failed to parse itinerary JSON", e);
            itinerary = [];
        }
    }

    return (
        <div
            className={`${styles.card} ${isRecommended ? styles.recommended : ''} ${isExpanded ? styles.expanded : ''}`}
            onClick={toggleExpand}
        >
            {isRecommended && <div className={styles.badge}>Recommended</div>}

            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h3 className={styles.title}>{title}</h3>
                    {vehicleType && <span className={styles.vehicleBadge}>{vehicleType}</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span className={styles.fare}>{fare}</span>
                    {fareRange && <div className={styles.fareRange}>{fareRange}</div>}
                </div>
            </div>

            <div className={styles.meta}>
                <div className={styles.timeWrapper}>
                    <Clock size={16} />
                    <span className={styles.time}>{time}</span>
                </div>

                <div className={`${styles.traffic} ${styles[traffic]}`}>
                    <span className={styles.trafficDot} />
                    {traffic.charAt(0).toUpperCase() + traffic.slice(1)} Traffic
                </div>
            </div>

            {isExpanded && (
                <div className={styles.detailsSection}>
                    {itinerary && Array.isArray(itinerary) && itinerary.length > 0 ? (
                        <div className={styles.itinerary}>
                            <div className={styles.itineraryHeader}>
                                <Navigation size={18} />
                                <strong>Precise Directions & Stops</strong>
                            </div>
                            {itinerary.map((step, idx) => (
                                <div key={idx} className={`${styles.step} ${step.type === 'switch' ? styles.stepSwitch : ''}`}>
                                    <div className={styles.stepDot}></div>
                                    <div className={styles.stepContent}>
                                        <div className={styles.stepHeader}>
                                            <span className={styles.stepLocation}>{step.location}</span>
                                            {step.vehicle && <span className={styles.stepVehicleBadge}>{step.vehicle}</span>}
                                        </div>
                                        <p className={styles.stepInstruction}>{step.instruction}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.detailItem}>
                            <Info size={16} className={styles.detailIcon} />
                            <div>
                                <strong>Direct Route Intelligence</strong>
                                <p>This is a standard road path. Follow the vehicle and fare details above for the best experience.</p>
                            </div>
                        </div>
                    )}

                    <div className={styles.detailItem}>
                        <CreditCard size={16} className={styles.detailIcon} />
                        <div>
                            <strong>Fare Intelligence</strong>
                            <p>{fareRange ? `Verified Range: ${fareRange}` : `Standard fare observed at ${fare}`}</p>
                        </div>
                    </div>
                </div>
            )}

            {warnings && warnings.length > 0 && (
                <div className={styles.warnings}>
                    {warnings.map((warning, idx) => (
                        <div key={idx} className={styles.warningItem}>
                            <AlertTriangle size={14} />
                            <span>{warning}</span>
                        </div>
                    ))}
                </div>
            )}

            <button className={styles.detailsBtn} onClick={(e) => { e.stopPropagation(); toggleExpand(); }}>
                {isExpanded ? 'Hide Details' : 'View Details'}
                <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
        </div>
    );
}
