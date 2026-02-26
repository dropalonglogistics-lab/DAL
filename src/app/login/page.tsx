'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { login, signup, signOut } from './actions';
import { Lock, Mail, User, AlertCircle, LogOut, CheckCircle2 } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [user, setUser] = useState<any>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check for active session
        const checkUser = async () => {
            const { data: authData } = await supabase.auth.getUser();
            const user = authData?.user;
            if (user && !isSuccess) {
                router.push('/profile');
            }
        };
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user && !isSuccess) {
                router.push('/profile');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth, router, isSuccess]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        if (isSignUp) formData.append('fullName', fullName);

        try {
            if (isSignUp) {
                const result = await signup(formData);
                if (result?.error) throw new Error(result.error);
                setSuccessMsg('Verification email sent! Check your inbox.');
            } else {
                const result = await login(formData);
                if (result?.error) throw new Error(result.error);

                // Show success state and redirect
                setIsSuccess(true);
                setSuccessMsg('Access granted. Entry secured.');

                setTimeout(() => {
                    router.push('/profile');
                }, 1000);
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Login/Signup View
    return (
        <div className={styles.container}>
            <div className={`${styles.card} ${isSuccess ? styles.successExit : ''}`} key={isSignUp ? 'signup' : 'login'}>
                <div className={`${styles.header} ${styles.staggerEntry}`}>
                    <h1 className={styles.title}>{isSignUp ? 'Create Your Account' : 'Welcome to Drop Along'}</h1>
                    <p className={styles.subtitle}>
                        {isSignUp ? 'Join the community moving Port Harcourt smarter' : 'Sign into your intelligent road transit dashboard'}
                    </p>
                </div>

                {error && (
                    <div className={`${styles.error} ${styles.staggerEntry}`}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className={`${styles.success} ${styles.staggerEntry}`}>
                        <CheckCircle2 size={20} />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className={styles.form}>
                    {isSignUp && (
                        <div className={`${styles.inputGroup} ${styles.staggerEntry} ${styles.delay_1}`}>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required={isSignUp}
                                className={styles.input}
                            />
                            <User className={styles.icon} size={20} />
                        </div>
                    )}

                    <div className={`${styles.inputGroup} ${styles.staggerEntry} ${isSignUp ? styles.delay_2 : styles.delay_1}`}>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <Mail className={styles.icon} size={20} />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.staggerEntry} ${isSignUp ? styles.delay_3 : styles.delay_2}`}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <Lock className={styles.icon} size={20} />
                    </div>

                    {!isSignUp && (
                        <div className={`${styles.forgotPasswordLink} ${styles.staggerEntry} ${styles.delay_3}`}>
                            <Link href="/forgot-password">Trouble signing in?</Link>
                        </div>
                    )}

                    <button type="submit" className={`${styles.submitBtn} ${styles.staggerEntry} ${isSignUp ? styles.delay_4 : styles.delay_4}`} disabled={loading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div className="spinner-small"></div> Processing...
                            </span>
                        ) : (isSignUp ? 'Create Account' : 'Access Dashboard')}
                    </button>
                </form>

                <div className={`${styles.footer} ${styles.staggerEntry} ${styles.delay_5}`}>
                    <p>
                        {isSignUp ? 'Member already?' : 'New to Drop Along?'}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className={styles.toggleBtn}
                        >
                            {isSignUp ? 'Sign In' : 'Join Now'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
