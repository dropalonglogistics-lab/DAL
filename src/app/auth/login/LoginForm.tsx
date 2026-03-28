'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Mail, Phone, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import styles from '../auth.module.css';

const isPhone = (v: string) => /^(\+234|0)[789][01]\d{8}$/.test(v.trim()) || /^\d{10,11}$/.test(v.trim());

const MAX_ATTEMPTS = 5;

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

export default function LoginForm() {
    const router = useRouter();
    const supabase = createClient();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [locked, setLocked] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        supabase.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
            if (data?.user) router.replace('/profile');
        });
    }, []);

    const identifierType = isPhone(identifier) ? 'phone' : 'email';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (locked) return;

        const currentAttempts = attempts + 1;

        if (!identifier.trim() || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let email = identifier.trim();

            // If phone login — look up email from profiles
            if (identifierType === 'phone') {
                const normalized = email.startsWith('+234') ? email : '+234' + email.replace(/^0/, '');
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('phone', normalized)
                    .single();

                if (!profile?.email) {
                    setError('No account found with this phone number.');
                    setLoading(false);
                    return;
                }
                email = profile.email;
            }

            const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

            if (signInErr) {
                setAttempts(currentAttempts);
                if (currentAttempts >= MAX_ATTEMPTS) {
                    setLocked(true);
                    setError(`Too many failed attempts. Your account is temporarily locked. Please reset your password.`);
                } else {
                    setError(`Incorrect credentials. ${MAX_ATTEMPTS - currentAttempts} attempt(s) remaining.`);
                }
                setLoading(false);
                return;
            }

            // Success
            router.push('/profile');
            router.refresh();
        } catch {
            setError('Sign in failed. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setGoogleLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) {
            setError(error.message);
            setGoogleLoading(false);
        }
    };

    return (
        <div className={styles.formCard}>
            <h1 className={styles.formTitle}>Welcome Back</h1>
            <p className={styles.formSubtitle}>Sign in to your DAL account.</p>

            {error && (
                <div className={`${styles.alertBanner} ${styles.alertError}`}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{error}</span>
                </div>
            )}

            {/* Google OAuth */}
            <button className={styles.googleBtn} onClick={handleGoogle} disabled={googleLoading || locked} type="button">
                <GoogleIcon />
                {googleLoading ? 'Connecting…' : 'Continue with Google'}
            </button>

            <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>or sign in with email / phone</span>
                <div className={styles.dividerLine} />
            </div>

            <form onSubmit={handleSubmit} noValidate>
                {/* Email or phone */}
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Email or Phone</label>
                    <div className={styles.inputWrap}>
                        {identifierType === 'phone'
                            ? <Phone size={16} className={styles.inputIconLeft} />
                            : <Mail size={16} className={styles.inputIconLeft} />
                        }
                        <input
                            type="text"
                            placeholder="you@example.com or 08012345678"
                            value={identifier}
                            onChange={e => { setIdentifier(e.target.value); setError(''); }}
                            className={`${styles.input} ${styles.inputWithLeftIcon}`}
                            autoComplete="username"
                            disabled={locked}
                        />
                    </div>
                </div>

                {/* Password */}
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrap}>
                        <Lock size={16} className={styles.inputIconLeft} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Your password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            className={`${styles.input} ${styles.inputWithLeftIcon}`}
                            autoComplete="current-password"
                            disabled={locked}
                        />
                        <button type="button" className={styles.inputIcon} onClick={() => setShowPassword(p => !p)} aria-label="Toggle">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Remember me + Forgot password */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            style={{ margin: 0 }}
                        />
                        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className={styles.formLink} style={{ fontSize: '0.82rem', marginLeft: 0 }}>
                        Forgot password?
                    </Link>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading || locked}>
                    {loading ? <><span className={styles.spinner} /> Signing in…</> : <>Sign In <ArrowRight size={16} /></>}
                </button>
            </form>

            <div className={styles.formFooter}>
                New to DAL?
                <Link href="/signup" className={styles.formLink}>Create account</Link>
            </div>
        </div>
    );
}
