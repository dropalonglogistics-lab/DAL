'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User, Phone, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import styles from '../auth.module.css';

const NIGERIAN_REGEX = /^(\+234|0)[789][01]\d{8}$/;

function validatePhone(phone: string) {
    const clean = phone.replace(/\s/g, '');
    if (!clean) return 'Phone number is required';
    if (!NIGERIAN_REGEX.test(clean)) return 'Enter a valid Nigerian phone number (e.g. 08012345678)';
    return null;
}

function validatePassword(pw: string) {
    if (!pw) return 'Password is required';
    if (pw.length < 8) return 'Password must be at least 8 characters';
    return null;
}

export default function RegisterForm() {
    const router = useRouter();
    const supabase = createClient();

    const [fields, setFields] = useState({
        fullName: '', phone: '', email: '', password: '', confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [tosChecked, setTosChecked] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFields(f => ({ ...f, [key]: e.target.value }));
        if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!fields.fullName.trim()) errs.fullName = 'Full name is required';
        const phoneErr = validatePhone(fields.phone);
        if (phoneErr) errs.phone = phoneErr;
        if (!fields.email.trim()) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Enter a valid email address';
        const pwErr = validatePassword(fields.password);
        if (pwErr) errs.password = pwErr;
        if (!fields.confirmPassword) errs.confirmPassword = 'Please confirm your password';
        else if (fields.password !== fields.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        if (!tosChecked) errs.tos = 'You must accept the Terms of Service';
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        setGlobalError('');

        try {
            // Normalize phone — stored in profile but not SMS-verified
            const phone = fields.phone.replace(/\s/g, '');
            const normalizedPhone = phone.startsWith('+234') ? phone : '+234' + phone.replace(/^0/, '');

            // 1. Create Supabase user — Supabase sends confirmation email (OTP or link)
            const { data: authData, error: signUpErr } = await supabase.auth.signUp({
                email: fields.email,
                password: fields.password,
                options: {
                    data: { full_name: fields.fullName },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (signUpErr) throw new Error(signUpErr.message);

            // 2. Save phone to profile (no SMS verification — collected for future use)
            if (authData.user) {
                await supabase.from('profiles').update({
                    full_name: fields.fullName,
                    phone: normalizedPhone,
                    email: fields.email,
                }).eq('id', authData.user.id);
            }

            // 3. Redirect to email OTP verification page
            router.push(`/verify-otp?email=${encodeURIComponent(fields.email)}`);
        } catch (err: any) {
            setGlobalError(err.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.formCard}>
            <h1 className={styles.formTitle}>Create Your Account</h1>
            <p className={styles.formSubtitle}>Join the community moving Port Harcourt smarter.</p>

            {globalError && (
                <div className={`${styles.alertBanner} ${styles.alertError}`}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{globalError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Full Name</label>
                    <div className={styles.inputWrap}>
                        <User size={16} className={styles.inputIconLeft} />
                        <input
                            type="text"
                            placeholder="Emeka Okafor"
                            value={fields.fullName}
                            onChange={set('fullName')}
                            className={`${styles.input} ${styles.inputWithLeftIcon} ${errors.fullName ? styles.inputError : ''}`}
                            autoComplete="name"
                        />
                    </div>
                    {errors.fullName && <span className={styles.errorText}><AlertCircle size={12} />{errors.fullName}</span>}
                </div>

                {/* Phone — collected but not SMS-verified */}
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <div className={styles.inputWrap}>
                        <Phone size={16} className={styles.inputIconLeft} />
                        <input
                            type="tel"
                            placeholder="08012345678"
                            value={fields.phone}
                            onChange={set('phone')}
                            className={`${styles.input} ${styles.inputWithLeftIcon} ${errors.phone ? styles.inputError : ''}`}
                            autoComplete="tel"
                            inputMode="tel"
                        />
                    </div>
                    {errors.phone
                        ? <span className={styles.errorText}><AlertCircle size={12} />{errors.phone}</span>
                        : <span className={styles.helperText}>Nigerian +234 format — 10 digits after 0</span>
                    }
                </div>

                {/* Email */}
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Email Address</label>
                    <div className={styles.inputWrap}>
                        <Mail size={16} className={styles.inputIconLeft} />
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={fields.email}
                            onChange={set('email')}
                            className={`${styles.input} ${styles.inputWithLeftIcon} ${errors.email ? styles.inputError : ''}`}
                            autoComplete="email"
                        />
                    </div>
                    {errors.email
                        ? <span className={styles.errorText}><AlertCircle size={12} />{errors.email}</span>
                        : <span className={styles.helperText}>A 6-digit code will be emailed to you</span>
                    }
                </div>

                {/* Password */}
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrap}>
                        <Lock size={16} className={styles.inputIconLeft} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min 8 characters"
                            value={fields.password}
                            onChange={set('password')}
                            className={`${styles.input} ${styles.inputWithLeftIcon} ${errors.password ? styles.inputError : ''}`}
                            autoComplete="new-password"
                        />
                        <button type="button" className={styles.inputIcon} onClick={() => setShowPassword(p => !p)} aria-label="Toggle password">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && <span className={styles.errorText}><AlertCircle size={12} />{errors.password}</span>}
                </div>

                {/* Confirm Password */}
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Confirm Password</label>
                    <div className={styles.inputWrap}>
                        <Lock size={16} className={styles.inputIconLeft} />
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Repeat password"
                            value={fields.confirmPassword}
                            onChange={set('confirmPassword')}
                            className={`${styles.input} ${styles.inputWithLeftIcon} ${errors.confirmPassword ? styles.inputError : ''}`}
                            autoComplete="new-password"
                        />
                        <button type="button" className={styles.inputIcon} onClick={() => setShowConfirm(p => !p)} aria-label="Toggle confirm">
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.confirmPassword && <span className={styles.errorText}><AlertCircle size={12} />{errors.confirmPassword}</span>}
                </div>

                {/* ToS */}
                <div className={styles.checkboxGroup}>
                    <input
                        type="checkbox"
                        id="tos"
                        className={styles.checkbox}
                        checked={tosChecked}
                        onChange={e => {
                            setTosChecked(e.target.checked);
                            if (errors.tos) setErrors(er => { const n = { ...er }; delete n.tos; return n; });
                        }}
                    />
                    <label htmlFor="tos" className={styles.checkboxLabel}>
                        I agree to the <Link href="/terms" target="_blank">Terms of Service</Link> and{' '}
                        <Link href="/privacy" target="_blank">Privacy Policy</Link>
                    </label>
                </div>
                {errors.tos && (
                    <div style={{ marginTop: -12, marginBottom: 12 }}>
                        <span className={styles.errorText}><AlertCircle size={12} />{errors.tos}</span>
                    </div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading
                        ? <><span className={styles.spinner} /> Creating account…</>
                        : <>Create Account <ArrowRight size={16} /></>
                    }
                </button>
            </form>

            <div className={styles.formFooter}>
                Already have an account?
                <Link href="/login" className={styles.formLink}>Sign in</Link>
            </div>
        </div>
    );
}
