'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, RotateCcw, Lock } from 'lucide-react';
import styles from './verify-otp.module.css';
import authStyles from '../auth.module.css';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyOTPForm() {
    const router = useRouter();
    const params = useSearchParams();
    const phone = params?.get('phone') || '';

    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [status, setStatus] = useState<'idle' | 'error' | 'success' | 'locked'>('idle');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);
    const [resending, setResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer
    useEffect(() => {
        if (resendSeconds <= 0) return;
        const t = setTimeout(() => setResendSeconds(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendSeconds]);

    const focusInput = (idx: number) => inputRefs.current[idx]?.focus();

    const handleDigitChange = (idx: number, val: string) => {
        const char = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[idx] = char;
        setDigits(next);
        setStatus('idle');
        if (char && idx < OTP_LENGTH - 1) focusInput(idx + 1);
        // Auto-submit when all filled
        if (char && idx === OTP_LENGTH - 1 && next.every(Boolean)) {
            submitCode(next.join(''));
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace') {
            if (!digits[idx] && idx > 0) {
                const next = [...digits];
                next[idx - 1] = '';
                setDigits(next);
                focusInput(idx - 1);
            } else {
                const next = [...digits];
                next[idx] = '';
                setDigits(next);
            }
        } else if (e.key === 'ArrowLeft' && idx > 0) {
            focusInput(idx - 1);
        } else if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
            focusInput(idx + 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (pasted.length === OTP_LENGTH) {
            setDigits(pasted.split(''));
            focusInput(OTP_LENGTH - 1);
            submitCode(pasted);
        }
    };

    const submitCode = useCallback(async (code: string) => {
        if (!phone || code.length !== OTP_LENGTH) return;
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code }),
            });
            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setMessage('Phone verified! Redirecting…');
                setTimeout(() => router.push('/welcome'), 1200);
            } else if (data.locked) {
                setStatus('locked');
                setMessage(data.error);
            } else {
                setStatus('error');
                setMessage(data.error || 'Incorrect code. Please try again.');
                setDigits(Array(OTP_LENGTH).fill(''));
                focusInput(0);
            }
        } catch {
            setStatus('error');
            setMessage('Verification failed. Check your connection.');
        } finally {
            setLoading(false);
        }
    }, [phone, router]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitCode(digits.join(''));
    };

    const handleResend = async () => {
        if (resendSeconds > 0 || !phone) return;
        setResending(true);
        setMessage('');
        setStatus('idle');
        setDigits(Array(OTP_LENGTH).fill(''));

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (data.success || data.phone) {
                setResendSeconds(RESEND_SECONDS);
                setMessage('New code sent! Check your messages.');
                setStatus('success');
                setTimeout(() => { setMessage(''); setStatus('idle'); }, 3000);
                focusInput(0);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to resend. Try again.');
            }
        } catch {
            setStatus('error');
            setMessage('Resend failed. Check your connection.');
        } finally {
            setResending(false);
        }
    };

    const maskedPhone = phone
        ? phone.slice(0, 5) + '****' + phone.slice(-4)
        : 'your phone';

    return (
        <div className={authStyles.formCard}>
            <div className={styles.iconBadge}>
                <Lock size={22} />
            </div>
            <h1 className={authStyles.formTitle}>Verify Your Phone</h1>
            <p className={authStyles.formSubtitle}>
                We sent a 6-digit code to <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{maskedPhone}</strong>.
            </p>

            {message && (
                <div className={`${authStyles.alertBanner} ${status === 'success' ? authStyles.alertSuccess : authStyles.alertError}`}>
                    {status === 'success' ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                    <span>{message}</span>
                </div>
            )}

            {status !== 'locked' && (
                <form onSubmit={handleManualSubmit}>
                    <div className={styles.otpRow} onPaste={handlePaste}>
                        {digits.map((d, i) => (
                            <input
                                key={i}
                                ref={el => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={d}
                                onChange={e => handleDigitChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className={`${styles.digitBox} ${status === 'error' ? styles.digitError : ''} ${status === 'success' ? styles.digitSuccess : ''}`}
                                autoFocus={i === 0}
                                disabled={loading || status === 'success'}
                                aria-label={`Digit ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className={authStyles.submitBtn}
                        disabled={loading || digits.some(d => !d) || status === 'success'}
                        style={{ marginTop: 24 }}
                    >
                        {loading ? <><span className={authStyles.spinner} /> Verifying…</> : 'Confirm Code'}
                    </button>
                </form>
            )}

            <div className={styles.resendRow}>
                <span className={styles.resendLabel}>Didn't receive it?</span>
                {resendSeconds > 0 ? (
                    <span className={styles.countdown}>
                        Resend in <strong>{resendSeconds}s</strong>
                    </span>
                ) : (
                    <button
                        className={styles.resendBtn}
                        onClick={handleResend}
                        disabled={resending || resendSeconds > 0}
                    >
                        <RotateCcw size={13} style={{ marginRight: 4 }} />
                        {resending ? 'Sending…' : 'Resend Code'}
                    </button>
                )}
            </div>
        </div>
    );
}
