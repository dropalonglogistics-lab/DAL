import RouteSearch from '@/components/RouteSearch/RouteSearch';
import RouteResultCard from '@/components/RouteResults/RouteResultCard';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';

interface HomeProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
    const supabase = await createClient();
    const params = await searchParams;

    const origin = typeof params.origin === 'string' ? params.origin : '';
    const destination = typeof params.destination === 'string' ? params.destination : '';
    const vehicle = typeof params.vehicle === 'string' ? params.vehicle : '';

    let query = supabase.from('routes').select('*');

    if (origin) query = query.ilike('origin', `%${origin}%`);
    if (destination) query = query.ilike('destination', `%${destination}%`);
    if (vehicle) query = query.ilike('vehicle_type', vehicle);

    const { data: routes, error } = await query;

    return (
        <div className={styles.pageContainer}>
            <section className={styles.searchSection}>
                <div className={styles.heroText}>
                    <h1>Move Smarter in Your City</h1>
                    <p>Real-time routing for Taxi, Keke, and Bus.</p>
                </div>
                <RouteSearch />
                {/* Debug Info for now */}
                {/* <p style={{marginTop: 20, fontSize: '0.8rem', color: '#666'}}>
          Searching: {origin} -&gt; {destination} ({vehicle})
        </p> */}
            </section>

            <section className={styles.resultsSection}>
                <div className={styles.sectionHeader}>
                    <h2>Available Routes</h2>
                    <span className={styles.subtext}>Live updates</span>
                </div>

                <div className={styles.resultsGrid}>
                    {routes && routes.length > 0 ? (
                        routes.map((route) => (
                            <RouteResultCard
                                key={route.id}
                                title={`${route.origin} → ${route.destination}`}
                                time={`${route.duration_minutes} min`}
                                fare={`₦${route.price_estimated}`}
                                traffic="clear" // This would be dynamic in future V2
                                isRecommended={false} // Add logic for this later
                            />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No routes found. Try &quot;Wuse Zone 4&quot; to &quot;Central Area&quot;.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
