'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import styles from '@/app/content-pages.module.css';

export default function BlogPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const supabase = createClient();

    const handleSubscribe = async () => {
        if (!email || !email.includes('@')) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }

        setStatus('loading');
        try {
            const { error } = await supabase
                .from('blog_subscribers')
                .insert([{ email }]);

            if (error) throw error;

            setStatus('success');
            setEmail('');
            setMessage('Thank you! You are now subscribed to the DAL blog.');
        } catch (err: any) {
            console.error('Subscription error:', err);
            setStatus('error');
            setMessage(err.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>The Intelligence Layer</h1>
            <span className={styles.lastUpdated}>Insights on urban mobility, platform updates, and community stories.</span>
            
            <div className={styles.content}>
                <div style={{ background: '#111111', border: '0.5px solid #1E1E1E', borderRadius: '12px', padding: '48px 32px', textAlign: 'center', marginTop: '48px' }}>
                    <h2 style={{ margin: '0 0 12px', color: '#FFFFFF' }}>Coming Soon</h2>
                    <p style={{ color: '#555555', maxWidth: '400px', margin: '0 auto 24px', fontSize: '14px' }}>
                        We&apos;re currently preparing our first batch of insights. Subscribe to get notified.
                    </p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
                        <input 
                            type="email" 
                            placeholder="Your email address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ 
                                flex: 2, minWidth: '200px', padding: '12px 16px', borderRadius: '8px', 
                                background: '#1A1A1A', border: '0.5px solid #2A2A2A', color: '#FFFFFF',
                                fontSize: '14px', outline: 'none'
                            }} 
                        />
                        <button 
                            onClick={handleSubscribe}
                            disabled={status === 'loading'}
                            style={{ 
                                flex: 1, minWidth: '120px', padding: '12px 24px', borderRadius: '8px', 
                                background: '#C9A227', color: '#0D0D0D', fontWeight: 700, border: 'none',
                                fontSize: '14px', cursor: 'pointer', opacity: status === 'loading' ? 0.7 : 1
                            }}
                        >
                            {status === 'loading' ? 'Submitting…' : 'Subscribe'}
                        </button>
                    </div>

                    {status === 'success' && <p style={{ color: '#4CAF50', fontSize: '13px', marginTop: '16px' }}>{message}</p>}
                    {status === 'error' && <p style={{ color: '#E57373', fontSize: '13px', marginTop: '16px' }}>{message}</p>}
                </div>
            </div>
        </div>
    );
}
