'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import AuthLayout from '@/components/auth/AuthLayout';
import styles from '@/components/auth/Auth.module.css';

type UserType = 'user' | 'rider' | 'errand_worker';

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    
    const [view, setView] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [userType, setUserType] = useState<UserType>('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Redirect if already authenticated
    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                router.push('/dashboard');
            } else {
                setCheckingAuth(false);
            }
        }
        checkUser();
    }, [supabase, router]);

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?role=${userType}`,
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        setError(null);
        
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            }
        });

        if (error) {
            setError(error.message);
        } else {
            setView('otp');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async () => {
        if (code.length < 6) {
            setError('Please enter the 6-digit code.');
            return;
        }

        setLoading(true);
        setError(null);

        const { data, error: authError } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'email'
        });

        if (authError || !data.user) {
            setError('Invalid code. Please try again.');
            setLoading(false);
            return;
        }

        // Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                email: data.user.email,
                role: userType,
                created_at: new Date().toISOString()
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Even if profile fails, user is authenticated. 
            // But we should probably show an error or try again.
        }

        router.push('/dashboard');
    };

    if (checkingAuth) {
        return (
            <AuthLayout brandHeadline="Join thousands of Port Harcourt commuters moving smarter.">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
                    <div className={styles.skeleton} style={{ height: '40px', width: '60%', borderRadius: '8px' }} />
                    <div className={styles.skeleton} style={{ height: '24px', width: '40%', borderRadius: '8px' }} />
                    <div className={styles.skeleton} style={{ height: '50px', borderRadius: '12px', marginTop: '20px' }} />
                    <div className={styles.skeleton} style={{ height: '50px', borderRadius: '12px' }} />
                    <div className={styles.skeleton} style={{ height: '50px', borderRadius: '12px' }} />
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout brandHeadline="Join thousands of Port Harcourt commuters moving smarter.">
            <div>
                <h2 className={styles.heading}>Create your account</h2>
                <p className={styles.subheading}>Join DAL — it's free</p>

                {/* GOOGLE BUTTON */}
                <button 
                    className={styles.googleBtn} 
                    onClick={handleGoogleSignup} 
                    disabled={loading}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.705A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.705V4.963H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.037l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.117.957 4.963l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    <span className={styles.googleLabel}>Continue with Google</span>
                </button>

                <div className={styles.divider}>
                    <div className={styles.line}></div>
                    <span className={styles.dividerText}>or sign up with email</span>
                    <div className={styles.line}></div>
                </div>

                {view === 'email' ? (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>EMAIL ADDRESS</label>
                        <input 
                            type="email" 
                            className={styles.input} 
                            placeholder="yourname@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setError(null)}
                            style={{ marginBottom: '24px' }}
                        />

                        {/* USER TYPE SELECTION */}
                        <label className={styles.label}>WHICH BEST DESCRIBES YOU?</label>
                        <div className={styles.userTypes}>
                            <div 
                                className={`${styles.typeCard} ${userType === 'user' ? styles.typeCardActive : ''}`}
                                onClick={() => setUserType('user')}
                            >
                                <div className={styles.typeIcon}>🗺</div>
                                <h4 className={styles.typeTitle}>Commuter</h4>
                                <p className={styles.typeDesc}>Find routes and book deliveries</p>
                                {userType === 'user' && <div className={styles.checkmark}>✓</div>}
                            </div>

                            <div 
                                className={`${styles.typeCard} ${userType === 'rider' ? styles.typeCardActive : ''}`}
                                onClick={() => setUserType('rider')}
                            >
                                <div className={styles.typeIcon}>🏍</div>
                                <h4 className={styles.typeTitle}>Rider</h4>
                                <p className={styles.typeDesc}>Deliver with DAL</p>
                                {userType === 'rider' && <div className={styles.checkmark}>✓</div>}
                            </div>

                            <div 
                                className={`${styles.typeCard} ${userType === 'errand_worker' ? styles.typeCardActive : ''}`}
                                onClick={() => setUserType('errand_worker')}
                            >
                                <div className={styles.typeIcon}>🛍</div>
                                <h4 className={styles.typeTitle}>Errand Worker</h4>
                                <p className={styles.typeDesc}>Handle tasks and errands</p>
                                {userType === 'errand_worker' && <div className={styles.checkmark}>✓</div>}
                            </div>
                        </div>

                        {error && <p className={styles.error}>{error}</p>}
                        
                        <button 
                            className={styles.primaryBtn} 
                            onClick={handleSendOtp}
                            disabled={loading}
                        >
                            {loading && <div className={styles.spinner}></div>}
                            Create Account
                        </button>
                    </div>
                ) : (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>ENTER YOUR CODE</label>
                        <input 
                            type="text" 
                            maxLength={6}
                            className={styles.input} 
                            placeholder="000000"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                            onFocus={() => setError(null)}
                        />
                        {error && <p className={styles.error}>{error}</p>}
                        
                        <button 
                            className={styles.primaryBtn} 
                            onClick={handleVerifyOtp}
                            disabled={loading}
                        >
                            {loading && <div className={styles.spinner}></div>}
                            Verify Code
                        </button>
                        <p className={styles.footerNote}>
                            Didn't receive a code?{' '}
                            <span className={styles.link} onClick={handleSendOtp}>Resend</span>
                        </p>
                    </div>
                )}

                <div className={styles.footerNote}>
                    Already have an account?{' '}
                    <a href="/login" className={styles.link}>Sign in</a>
                </div>
            </div>
        </AuthLayout>
    );
}
