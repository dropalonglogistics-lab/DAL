import dynamic from 'next/dynamic';

const DynamicInteractiveMap = dynamic(() => import('./InteractiveMap'), {
    ssr: false,
    loading: () => (
        <div style={{ height: '350px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.05)', borderRadius: '12px', border: '1px solid var(--border)', margin: '16px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Loading Map Engine...</span>
        </div>
    )
});

export default function InteractiveMapWrapper({ onLocationSelect, markerPos }: { onLocationSelect: (loc: string) => void, markerPos?: [number, number] | null }) {
    return <DynamicInteractiveMap onLocationSelect={onLocationSelect} markerPos={markerPos} />;
}
