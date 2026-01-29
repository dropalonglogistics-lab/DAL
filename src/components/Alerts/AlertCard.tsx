import { AlertTriangle, Clock, MapPin, ShieldAlert } from 'lucide-react';
import styles from './AlertCard.module.css';

interface AlertCardProps {
    type: string;
    description: string;
    time: string; // Formatted date string
    location?: string;
    confidence?: number;
}

export default function AlertCard({ type, description, time, location, confidence }: AlertCardProps) {
    const getIcon = () => {
        switch (type.toLowerCase()) {
            case 'checkpoint': return <ShieldAlert size={20} />;
            case 'traffic': return <AlertTriangle size={20} />;
            case 'accident': return <AlertTriangle size={20} color="var(--color-error)" />;
            default: return <AlertTriangle size={20} />;
        }
    };

    const getTypeStyle = () => {
        const t = type.toLowerCase();
        if (t.includes('accident')) return styles.critical;
        if (t.includes('checkpoint')) return styles.warning;
        return styles.info;
    };

    return (
        <div className={`${styles.card} ${getTypeStyle()}`}>
            <div className={styles.header}>
                <div className={styles.typeBadge}>
                    {getIcon()}
                    <span>{type}</span>
                </div>
                <div className={styles.time}>
                    <Clock size={14} />
                    <span>{time}</span>
                </div>
            </div>

            <p className={styles.description}>{description}</p>

            {location && (
                <div className={styles.footer}>
                    <MapPin size={16} />
                    <span>{location}</span>
                </div>
            )}
        </div>
    );
}
