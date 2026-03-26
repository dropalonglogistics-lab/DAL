'use client';

import { useState } from 'react';
import { Clock, AlertTriangle, ChevronRight, MapPin, CreditCard, TrafficCone, Navigation, ShieldAlert, CheckCircle2 } from 'lucide-react';
import RouteMap from '../Map/RouteMap';
import styles from './RouteResultCard.module.css';

interface RouteResultProps {
    route_title?: string;
    start_location: string;
    destination: string;
    vehicle_type_used?: string;
    estimated_travel_time_min?: number;
    estimated_travel_time_max?: number;
    fare_price_range_min?: number;
    fare_price_range_max?: number;
    difficulty_level?: 'Easy' | 'Moderate' | 'Challenging' | string;
    stops_along_the_way?: string | any[];
    detailed_directions?: string;
    tips_and_warnings?: string;
    traffic?: 'clear' | 'moderate' | 'heavy';
    routeAlerts?: any[];
    isRecommended?: boolean;
    isGlobalMode?: boolean;
    activeStepIndex?: number | null;
    isExpanded?: boolean;
    onStepSelect?: (index: number) => void;
    onExpand?: () => void;
    onToggleExpand?: (expanded: boolean) => void;
}

export default function RouteResultCard({
    route_title,
    start_location,
    destination,
    vehicle_type_used,
    estimated_travel_time_min,
    estimated_travel_time_max,
    fare_price_range_min,
    fare_price_range_max,
    difficulty_level,
    stops_along_the_way,
    detailed_directions,
    tips_and_warnings,
    traffic = 'clear',
    routeAlerts = [],
    isRecommended,
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

    const getDifficultyColor = (level?: string) => {
        switch(level) {
            case 'Easy': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', icon: <CheckCircle2 size={12} /> };
            case 'Moderate': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', icon: <AlertTriangle size={12} /> };
            case 'Challenging': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', icon: <TrafficCone size={12} /> };
            default: return null;
        }
    };

    const diffColors = getDifficultyColor(difficulty_level);

    const toggleExpand = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const nextState = !isExpanded;
        if (onToggleExpand) onToggleExpand(nextState);
        if (nextState && onExpand) onExpand();
    };

    // Helper to render stops
    const renderStops = () => {
        if (!stops_along_the_way) return null;
        
        // Handle JSON stringified array (new V2 format)
        if (typeof stops_along_the_way === 'string' && stops_along_the_way.startsWith('[')) {
            try {
                const parsed = JSON.parse(stops_along_the_way);
                if (Array.isArray(parsed)) {
                    return parsed.map((s: any, i: number) => (
                        <li key={i} style={{ marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{s.location}</span>: {s.instruction} 
                            {s.fare > 0 && <span style={{ marginLeft: '8px', opacity: 0.8 }}>(₦{s.fare})</span>}
                        </li>
                    ));
                }
            } catch (e) {
                console.error("Failed to parse stops JSON:", e);
            }
        }

        if (Array.isArray(stops_along_the_way)) {
            return stops_along_the_way.map((s, i) => (
                <li key={i}>{s.location || s.title || JSON.stringify(s)}</li>
            ));
        }

        if (typeof stops_along_the_way === 'string') {
            return stops_along_the_way.split(/[,;\n]+/).map((stop, i) => (
                <li key={i}>{stop.trim()}</li>
            ));
        }
        return null;
    };

    return (
        <div 
            className={`${styles.card} ${isRecommended ? styles.recommended : ''} ${isExpanded ? styles.expanded : ''}`}
            onClick={() => toggleExpand()}
        >
            {isRecommended && <div className={styles.badge}>Recommended</div>}

            <div className={styles.header}>
                <div className={styles.mainInfo}>
                    <h3 className={styles.title}>{route_title || `${start_location} → ${destination}`}</h3>
                    
                    <div className={styles.journeyLine} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {start_location} <ChevronRight size={12} /> <Navigation size={12} /> {destination}
                    </div>

                    <div className={styles.meta}>
                        <div className={styles.metaItem}>
                            <Clock size={14} />
                            <span>
                                {estimated_travel_time_min} {estimated_travel_time_max ? `- ${estimated_travel_time_max}` : ''} min
                            </span>
                        </div>
                        <div className={styles.metaItem}>
                            <CreditCard size={14} />
                            <span>
                                ₦{fare_price_range_min?.toLocaleString() || 0} {fare_price_range_max && fare_price_range_max !== fare_price_range_min ? `- ₦${fare_price_range_max.toLocaleString()}` : ''}
                            </span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {vehicle_type_used && vehicle_type_used.split(',').map((v, i) => (
                            <span key={i} className={styles.vehicleBadge} style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                                {v.trim()}
                            </span>
                        ))}
                        
                        {difficulty_level && diffColors && (
                            <span style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                background: diffColors.bg, color: diffColors.text, 
                                padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', 
                                border: `1px solid ${diffColors.border}`, fontWeight: 500
                            }}>
                                {diffColors.icon} {difficulty_level}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className={styles.itineraryWrapper} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.itinerary}>
                        
                        {stops_along_the_way && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>Stops Along The Way</h4>
                                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {renderStops()}
                                </ul>
                            </div>
                        )}

                        <div className={styles.itineraryHeader} style={{ marginBottom: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            <Navigation size={18} className={styles.headerIcon} />
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Full Directions</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Detailed guide & tips</p>
                            </div>
                        </div>
                        
                        <div style={{ padding: '0 8px' }}>
                            {detailed_directions ? (
                                <p style={{ fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-line', marginBottom: '16px' }}>
                                    {detailed_directions}
                                </p>
                            ) : (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '16px' }}>
                                    No detailed directions provided for this route.
                                </p>
                            )}

                            {tips_and_warnings && (
                                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', marginTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontWeight: 600, marginBottom: '6px', fontSize: '0.85rem' }}>
                                        <ShieldAlert size={14} /> Tips & Warnings
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#b45309', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                                        {tips_and_warnings}
                                    </p>
                                </div>
                            )}
                        </div>

                        {routeAlerts && routeAlerts.length > 0 && (
                            <div className={styles.alertsSection} style={{ marginTop: '24px' }}>
                                <h4 className={styles.alertsHeading}>Real-time Alerts</h4>
                                {routeAlerts.map((alert, idx) => (
                                    <div key={idx} className={`${styles.alertItem} ${styles[alert.severity || 'info']}`}>
                                        <AlertTriangle size={16} className={styles.alertIcon} />
                                        <div className={styles.alertContent}>
                                            <div className={styles.alertHeader}>
                                                <span className={styles.alertType}>{alert.type}</span>
                                            </div>
                                            <p>{alert.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={styles.footer}>
                <button className={styles.detailsBtn} onClick={toggleExpand}>
                    {isExpanded ? 'Collapse Details' : 'View Full Directions'}
                    <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
                </button>
            </div>
        </div>
    );
}
