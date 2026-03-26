import { Metadata } from 'next';
import AlertsPageClient from './AlertsPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Live Road Alerts Port Harcourt | DAL',
};

export default function AlertsPage() {
    return <AlertsPageClient />;
}
