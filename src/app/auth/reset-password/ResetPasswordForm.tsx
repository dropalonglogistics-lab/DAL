'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import styles from '../auth.module.css';
import strengthStyles from './strength.module.css';

function getStrength(pw: string): { label: 'Weak' | 'Fair' | 'Strong'; level: 0 | 1 | 2 } {
    if (!pw) return { label: 'Weak', level: 0 };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { label: 'Weak', level: 0 };
    if (score <= 3) return { label: 'Fair', level: 1 };
    return { label: 'Strong', level: 2 };
}

export default function AuthResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const strength = getStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (strength.level === 0) {
            setMessage({ type: 'error', text: 'Password is too weak. Add uppercase letters, numbers, or symbols.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Password updated! Redirecting…' });
            setTimeout(() => router.push('/profile'), 1500);
        }
    };

    return (
        <div className={styles.formCard}>
            <h1 className={styles.formTitle}>Set New Password</h1>
            <p className={styles.formSubtitle}>Choose a strong password for your account.</p>

            {message && (
                <div className={`${styles.alertBanner} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>New Password</label>
                    <div className={styles.inputWrap}>
                        <Lock size={16} className={styles.inputIconLeft} />
                        <input
                            type={showPw ? 'text' : 'password'}
                            placeholder="Min 8 characters"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={`${styles.input} ${styles.inputWithLeftIcon}`}
                            autoComplete="new-password"
                            minLength={8}
                        />
                        <button type="button" className={styles.inputIcon} onClick={() => setShowPw(p => !p)} aria-label="Toggle">
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* Strength meter */}
                    {password.length > 0 && (
                        <div className={strengthStyles.meter}>
                            <div className={strengthStyles.bars}>
                                <div className={`${strengthStyles.bar} ${strength.level >= 0 ? strengthStyles[`bar${strength.label}`] : ''}`} />
                                <div className={`${strengthStyles.bar} ${strength.level >= 1 ? strengthStyles[`bar${strength.label}`] : ''}`} />
                                <div className={`${strengthStyles.bar} ${strength.level >= 2 ? strengthStyles[`bar${strength.label}`] : ''}`} />
                            </div>
                            <span className={`${strengthStyles.label} ${strengthStyles[`label${strength.label}`]}`}>
                                {strength.label}
                            </span>
                        </div>
                    )}
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Confirm Password</label>
                    <div className={styles.inputWrap}>
                        <Lock size={16} className={styles.inputIconLeft} />
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className={`${styles.input} ${styles.inputWithLeftIcon} ${confirmPassword && confirmPassword !== password ? styles.inputError : ''}`}
                            autoComplete="new-password"
                        />
                        <button type="button" className={styles.inputIcon} onClick={() => setShowConfirm(p => !p)} aria-label="Toggle">
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                        <span className={styles.errorText}><AlertCircle size={12} /> Passwords don't match</span>
                    )}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? <><span className={styles.spinner} /> Updating…</> : 'Update Password'}
                </button>
            </form>
        </div>
    );
}
