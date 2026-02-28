'use client';
import dynamic from 'next/dynamic';

const SuggestRouteClient = dynamic(() => import('./SuggestRouteClient'), { ssr: false });

export default function SuggestRoutePage() {
    return <SuggestRouteClient />;
}
