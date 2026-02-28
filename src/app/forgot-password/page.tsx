'use client';
import dynamic from 'next/dynamic';

const ForgotPasswordClient = dynamic(() => import('./ForgotPasswordClient'), { ssr: false });

export default function ForgotPasswordPage() {
    return <ForgotPasswordClient />;
}
