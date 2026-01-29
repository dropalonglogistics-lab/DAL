'use client';

import { useState } from 'react';
import { Clock, AlertTriangle, ChevronRight, MapPin, CreditCard, Info } from 'lucide-react';
import styles from './RouteResultCard.module.css';

interface RouteResultProps {
    title: string;
    time: string;
    fare: string;
    traffic: 'clear' | 'moderate' | 'heavy';
    warnings?: string[];
    isRecommended?: boolean;
}

export default function RouteResultCard({
    title,
    time,
    fare,
    traffic,
    warnings,
    isRecommended
}: RouteResultProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div
            className={`${styles.card} ${isRecommended ? styles.recommended : ''} ${isExpanded ? styles.expanded : ''}`}
            onClick={toggleExpand}
        >
            {isRecommended && <div className={styles.badge}>Recommended</div>}

            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <span className={styles.fare}>{fare}</span>
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
                    <div className={styles.detailItem}>
                        <MapPin size={16} className={styles.detailIcon} />
                        <div>
                            <strong>Route Path</strong>
                            <p>Direct road transit via major PH arteries.</p>
                        </div>
                    </div>
                    <div className={styles.detailItem}>
                        <CreditCard size={16} className={styles.detailIcon} />
                        <div>
                            <strong>Estimated Cost</strong>
                            <p>Standard fare: {fare}</p>
                        </div>
                    </div>
                    <div className={styles.detailItem}>
                        <Info size={16} className={styles.detailIcon} />
                        <div>
                            <strong>Instructions</strong>
                            <p>Wait at designated bus stops or flag down transit.</p>
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

            <button className={styles.detailsBtn} onClick={(e) => e.stopPropagation()}>
                {isExpanded ? 'Hide Details' : 'View Details'}
                <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
        </div>
    );
}
