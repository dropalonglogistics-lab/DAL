'use client'

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '../login/actions';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from '../login/login.module.css';

export default function ForgotPasswordClient() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('email', email);

        const result = await forgotPassword(formData);
        if (result?.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: result.success || 'Reset link sent!' });
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Link href="/login" className={styles.toggleBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', marginLeft: 0 }}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <div className={styles.header}>
                    <h1 className={styles.title}>Reset Password</h1>
                    <p className={styles.subtitle}>Enter your email to receive a password reset link.</p>
                </div>

                {message && (
                    <div className={message.type === 'success' ? styles.success : styles.error}>
                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <Mail className={styles.icon} size={20} />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
}
