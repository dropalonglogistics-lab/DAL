'use client';

import { Clock, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './RouteResultCard.module.css';

interface RouteResultProps {
    id: string;
    route_title?: string;
    start_location: string;
    destination: string;
    vehicle_type_used?: string;
    estimated_travel_time_min?: number;
    estimated_travel_time_max?: number;
    fare_price_range_min?: number;
    fare_price_range_max?: number;
    difficulty_level?: string;
    stops_along_the_way?: string;
    detailed_directions?: string;
    tips_and_warnings?: string;
    isExpanded?: boolean;
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
    isExpanded = false,
    onToggleExpand
}: RouteResultProps) {

    const toggleExpand = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (onToggleExpand) onToggleExpand(!isExpanded);
    };

    const getDifficultyClass = (level?: string) => {
        const l = (level || '').toLowerCase();
        if (l === 'easy') return styles.easy;
        if (l === 'moderate') return styles.moderate;
        if (l === 'challenging') return styles.challenging;
        return '';
    };

    const formatPrice = (price?: number) => {
        if (price === undefined || price === null) return '0';
        return price.toLocaleString();
    };

    return (
        <div className={`${styles.card} ${isExpanded ? styles.expanded : ''}`} onClick={() => toggleExpand()}>
            {/* COLLAPSED STATE (Always visible) */}
            <header className={styles.header}>
                <h3 className={styles.title}>
                    {route_title || `${start_location} → ${destination}`}
                </h3>
                <div className={styles.subtitle}>
                    {start_location} <span style={{ opacity: 0.5 }}>→</span> {destination}
                </div>
            </header>

            <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                    <Clock size={16} />
                    <span>{estimated_travel_time_min}{estimated_travel_time_max && estimated_travel_time_max !== estimated_travel_time_min ? `–${estimated_travel_time_max}` : ''} min</span>
                </div>
                <div className={styles.metaItem}>
                    <CreditCard size={16} />
                    <span>₦{formatPrice(fare_price_range_min)}{fare_price_range_max && fare_price_range_max !== fare_price_range_min ? `–₦${formatPrice(fare_price_range_max)}` : ''}</span>
                </div>
                {difficulty_level && (
                    <span className={`${styles.badge} ${getDifficultyClass(difficulty_level)}`}>
                        {difficulty_level}
                    </span>
                )}
            </div>

            {vehicle_type_used && (
                <div className={styles.vehicleRow}>
                    {vehicle_type_used.split(',').map((v, i) => (
                        <span key={i} className={styles.vehiclePill}>{v.trim()}</span>
                    ))}
                </div>
            )}

            {!isExpanded && (
                <div className={styles.expandBtn}>
                    View full directions <ChevronDown size={14} />
                </div>
            )}

            {/* EXPANDED STATE */}
            {isExpanded && (
                <div className={styles.expandedContent} onClick={(e) => e.stopPropagation()}>
                    
                    {stops_along_the_way && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionHeading}>Stops</h4>
                            <div className={styles.stopsList}>
                                {stops_along_the_way.split('→').map((stop, i) => (
                                    <div key={i} className={styles.stopItem}>
                                        {stop.trim()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {detailed_directions && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionHeading}>Directions 🗺️</h4>
                            <p className={styles.directionsContent}>
                                {detailed_directions}
                            </p>
                        </div>
                    )}

                    {tips_and_warnings && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionHeading}>Tips ⚠️</h4>
                            <div className={styles.tipsWrapper}>
                                <p className={styles.tipsContent}>
                                    {tips_and_warnings}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className={styles.section} style={{ flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                        <div className={styles.section}>
                            <h4 className={styles.sectionHeading}>Fare Range</h4>
                            <div className={styles.fareDetails}>
                                ₦{formatPrice(fare_price_range_min)} – ₦{formatPrice(fare_price_range_max)}
                            </div>
                        </div>
                        <div className={styles.section} style={{ alignItems: 'flex-end' }}>
                            <h4 className={styles.sectionHeading}>Journey Time</h4>
                            <div className={styles.timeDetails}>
                                {estimated_travel_time_min}–{estimated_travel_time_max} minutes
                            </div>
                        </div>
                    </div>

                    <button className={styles.expandBtn} onClick={() => toggleExpand()}>
                        Collapse <ChevronUp size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
