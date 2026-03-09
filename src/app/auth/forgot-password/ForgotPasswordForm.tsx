'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import styles from '../auth.module.css';

export default function AuthForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setMessage({ type: 'error', text: 'Please enter your email address.' }); return; }

        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        });

        setLoading(false);
        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Reset link sent! Check your inbox.' });
        }
    };

    return (
        <div className={styles.formCard}>
            <h1 className={styles.formTitle}>Forgot Password?</h1>
            <p className={styles.formSubtitle}>Enter your email and we'll send you a reset link.</p>

            {message && (
                <div className={`${styles.alertBanner} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Email Address</label>
                    <div className={styles.inputWrap}>
                        <Mail size={16} className={styles.inputIconLeft} />
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={`${styles.input} ${styles.inputWithLeftIcon}`}
                            autoComplete="email"
                            disabled={message?.type === 'success'}
                        />
                    </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading || message?.type === 'success'}>
                    {loading ? <><span className={styles.spinner} /> Sending…</> : 'Send Reset Link'}
                </button>
            </form>

            <div className={styles.formFooter}>
                <Link href="/auth/login" className={styles.formLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <ArrowLeft size={14} /> Back to Sign In
                </Link>
            </div>
        </div>
    );
}
