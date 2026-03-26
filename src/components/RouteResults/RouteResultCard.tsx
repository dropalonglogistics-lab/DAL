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
    routeAlerts?: any[];
    warnings?: string[];
    isRecommended?: boolean;
    itinerary?: any[];
    isGlobalMode?: boolean;
    activeStepIndex?: number | null;
    isExpanded?: boolean;
    onStepSelect?: (index: number) => void;
    onExpand?: () => void;
    onToggleExpand?: (expanded: boolean) => void;
}

export default function RouteResultCard({
    title,
    time,
    fare_min,
    fare_max,
    traffic,
    routeAlerts = [],
    warnings,
    isRecommended,
    itinerary = [],
    isGlobalMode = false,
    activeStepIndex,
    isExpanded = false,
    onStepSelect,
    onExpand,
    onToggleExpand
}: RouteResultProps) {

    const trafficColors = {
        clear: '#22c55e',
        moderate: '#f59e0b',
        heavy: '#ef4444'
    };

    const toggleExpand = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const nextState = !isExpanded;
        if (onToggleExpand) {
            onToggleExpand(nextState);
        }
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
                                        <div className={styles.stepInstructionWrapper}>
                                            <p className={styles.stepInstruction}>
                                                {step.instruction || (
                                                    step.type === 'start' ? `Begin your journey at ${step.location}` :
                                                        step.type === 'end' ? `Arrive at your destination: ${step.location}` :
                                                            `Head towards ${step.location}`
                                                )}
                                            </p>
                                            {step.vehicle && (
                                                <p className={styles.vehicleInstruction}>
                                                    {step.type === 'start' ? `Look for a ${step.vehicle} heading towards the next stop.` :
                                                        step.type === 'switch' ? `Transfer to a ${step.vehicle} to continue.` :
                                                            `Continue on the ${step.vehicle}.`}
                                                </p>
                                            )}
                                        </div>
                                        {step.type === 'switch' && (
                                            <div className={styles.switchBox}>
                                                <div className={styles.switchLabel}>TRANSFER POINT</div>
                                                <div className={styles.switchText}>
                                                    Alight from your current vehicle and board a <strong>{step.vehicle || 'connecting vehicle'}</strong>
                                                </div>
                                            </div>
                                        )}
                                        {activeStepIndex === index && (
                                            <div className={styles.stepAction}>
                                                <button className={styles.showOnMapBtn} onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onStepSelect) onStepSelect(index);
                                                }}>
                                                    <MapPin size={14} /> Center on Map
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {routeAlerts && routeAlerts.length > 0 && (
                            <div className={styles.alertsSection}>
                                <h4 className={styles.alertsHeading}>Alerts on this route</h4>
                                {routeAlerts.map(alert => (
                                    <div key={alert.id} className={`${styles.alertItem} ${styles[alert.severity || 'info']}`}>
                                        <AlertTriangle size={16} className={styles.alertIcon} />
                                        <div className={styles.alertContent}>
                                            <div className={styles.alertHeader}>
                                                <span className={styles.alertType}>{alert.type}</span>
                                                {alert.area && <span className={styles.alertArea}>• {alert.area}</span>}
                                            </div>
                                            <p>{alert.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                traffic={traffic}
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
