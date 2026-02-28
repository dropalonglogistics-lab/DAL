'use client';
import dynamic from 'next/dynamic';

const ResetPasswordClient = dynamic(() => import('./ResetPasswordClient'), { ssr: false });

export default function ResetPasswordPage() {
    return <ResetPasswordClient />;
}
