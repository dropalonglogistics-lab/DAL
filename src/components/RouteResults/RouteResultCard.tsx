'use client';

import { useState } from 'react';
import { Clock, AlertTriangle, ChevronRight, MapPin, CreditCard, Info, Navigation, TrafficCone } from 'lucide-react';
import RouteMap from '../Map/RouteMap';
import styles from './RouteResultCard.module.css';

interface ItineraryStep {
    type: 'start' | 'end' | 'switch' | 'stop' | 'junction';
    location: string;
    description?: string;
    vehicle?: string;
    vehicleFrom?: string;
    vehicleTo?: string;
    instruction?: string;
}

interface RouteResultProps {
    title: string;
    time: string;
    fare_min: number;
    fare_max: number;
    traffic: 'clear' | 'moderate' | 'heavy';
    warnings?: string[];
    isRecommended?: boolean;
    itinerary?: any[];
    isGlobalMode?: boolean;
    activeStepIndex?: number | null;
    onStepSelect?: (index: number) => void;
    onExpand?: () => void;
}

export default function RouteResultCard({
    title,
    time,
    fare_min,
    fare_max,
    traffic,
    warnings,
    isRecommended,
    itinerary = [],
    isGlobalMode = false,
    activeStepIndex,
    onStepSelect,
    onExpand
}: RouteResultProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const trafficColors = {
        clear: '#22c55e',
        moderate: '#f59e0b',
        heavy: '#ef4444'
    };

    const toggleExpand = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const nextState = !isExpanded;
        setIsExpanded(nextState);
        if (nextState && onExpand) {
            onExpand();
        }
    };

    const handleStepClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        if (onStepSelect) {
            onStepSelect(index);
        }
    };

    return (
        <div
            className={`${styles.card} ${isRecommended ? styles.recommended : ''} ${isExpanded ? styles.expanded : ''}`}
            onClick={() => toggleExpand()}
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
                <div className={styles.itineraryWrapper} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.itinerary}>
                        <div className={styles.itineraryHeader} onClick={toggleExpand} style={{ cursor: 'pointer' }}>
                            <Navigation size={18} className={styles.headerIcon} />
                            <div>
                                <h3>Full Directions</h3>
                                <p>Step-by-step guide to your destination</p>
                            </div>
                        </div>
                        <div className={styles.stepsTimeline}>
                            {itinerary.map((step, index) => (
                                <div
                                    key={index}
                                    className={`${styles.stepItem} ${activeStepIndex === index ? styles.activeStep : ''}`}
                                    onClick={(e) => handleStepClick(e, index)}
                                >
                                    <div className={styles.stepVisual}>
                                        <div className={`${styles.stepIconContainer} ${styles[step.type]}`}>
                                            {step.type === 'start' && <MapPin size={18} />}
                                            {step.type === 'end' && <Navigation size={18} />}
                                            {step.type === 'switch' && <TrafficCone size={18} />}
                                            {(step.type === 'stop' || step.type === 'junction') && <div className={styles.dotPulse} />}
                                        </div>
                                        {index < itinerary.length - 1 && <div className={styles.stepLine} />}
                                    </div>
                                    <div className={styles.stepContent}>
                                        <div className={styles.stepMain}>
                                            <span className={styles.stepLocation}>{step.location}</span>
                                            {step.vehicle && <span className={styles.vehicleBadge}>{step.vehicle}</span>}
                                        </div>
                                        <p className={styles.stepInstruction}>
                                            {step.instruction || (step.type === 'start' ? 'Start your journey here' : step.type === 'end' ? 'You have arrived at your destination' : 'Continue along the route')}
                                        </p>
                                        {step.type === 'switch' && (
                                            <div className={styles.switchBox}>
                                                <div className={styles.switchLabel}>TRANSFER</div>
                                                <div className={styles.switchText}>
                                                    Disembark from <strong>{step.vehicleFrom}</strong> and board <strong>{step.vehicleTo}</strong>
                                                </div>
                                            </div>
                                        )}
                                        {activeStepIndex === index && (
                                            <div className={styles.stepAction}>
                                                <button className={styles.showOnMapBtn}>
                                                    <MapPin size={14} /> Center on Map
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!isGlobalMode && (
                        <div className={styles.mapContainer}>
                            <RouteMap
                                activeStepIndex={activeStepIndex}
                                locations={
                                    itinerary.map((step, index) => ({
                                        title: step.location,
                                        desc: step.instruction || step.description || `Point ${index + 1}`,
                                        city: 'Port Harcourt',
                                        type: step.type
                                    }))
                                }
                            />
                        </div>
                    )}
                </div>
            )}

            <div className={styles.footer}>
                <button className={styles.detailsBtn} onClick={toggleExpand}>
                    {isExpanded ? 'Collapse' : 'View full itinerary'}
                    <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
                </button>
            </div>
        </div>
    );
}
