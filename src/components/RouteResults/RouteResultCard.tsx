import { Clock, AlertTriangle, ChevronRight } from 'lucide-react';
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
    return (
        <div className={`${styles.card} ${isRecommended ? styles.recommended : ''}`}>
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

            <button className={styles.detailsBtn}>
                View Details
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
