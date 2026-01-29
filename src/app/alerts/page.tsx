import { createClient } from '@/utils/supabase/server';
import AlertCard from '@/components/Alerts/AlertCard';
import CreateAlertButton from '@/components/Alerts/CreateAlertButton';
import styles from './page.module.css';

// Function to format "2023-10-27T..." to "2 hrs ago" - simple helper for now
function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default async function AlertsPage() {
    const supabase = await createClient();

    const { data: alerts, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Community Alerts</h1>
                <p>Real-time updates on traffic, checkpoints, and road safety.</p>
            </header>

            <div className={styles.alertList}>
                {alerts && alerts.length > 0 ? (
                    alerts.map((alert) => (
                        <AlertCard
                            key={alert.id}
                            type={alert.type || 'info'}
                            description={alert.description || ''}
                            time={timeAgo(alert.created_at)}
                            location="Abuja (Near Wuse)" // Placeholder, we would reverse geocode in V2
                        />
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <p>No active alerts. Roads look clear!</p>
                    </div>
                )}
            </div>

            <CreateAlertButton />
        </div>
    );
}
