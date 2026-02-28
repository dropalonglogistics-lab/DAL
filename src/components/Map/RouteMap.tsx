import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
    ssr: false, // Prevents "window is not defined" error in Next.js
    loading: () => (
        <div style={{ height: '350px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.05)', borderRadius: '12px', border: '1px solid var(--border)', margin: '16px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Loading Map Engine...</span>
        </div>
    )
});

export default function RouteMap({
    locations
}: {
    locations: { title: string; desc: string; city: string }[]
}) {
    return <DynamicMap locations={locations} />;
}
