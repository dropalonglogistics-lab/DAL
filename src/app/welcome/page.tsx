'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Map, Zap, ShoppingBag, ArrowRight, CheckCircle } from 'lucide-react';
import styles from './welcome.module.css';

export default function WelcomeWizard() {
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [mockSearching, setMockSearching] = useState(false);
    const [mockResult, setMockResult] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUserId(data.user.id);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', data.user.id)
                    .single();
                
                if (profile?.full_name) {
                    setName(profile.full_name.split(' ')[0]); // first name
                }
            }
        }
        fetchUser();
    }, [supabase]);

    const completeOnboarding = async (path: string) => {
        if (userId) {
            await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', userId);
        }
        router.push(path);
        // Force refresh to reload the dashboard state
        router.refresh();
    };

    const runMockSearch = () => {
        setMockSearching(true);
        setTimeout(() => {
            setMockSearching(false);
            setMockResult(true);
        }, 1200);
    };

    return (
        <div className={styles.root}>
            <div className={styles.progressContainer}>
                {[1, 2, 3].map(s => (
                    <div key={s} className={`${styles.stepDot} ${step >= s ? styles.stepActive : ''}`} />
                ))}
            </div>

            <div className={styles.contentWrapper} key={step}>
                {step === 1 && (
                    <>
                        <div className={styles.heroBox}>
                            <div className={styles.cityAnim} />
                        </div>
                        <h1 className={styles.title}>Welcome to DAL, {name || 'Explorer'}! 👋</h1>
                        <p className={styles.subtitle}>
                            Port Harcourt's fastest growing intelligence layer for urban mobility. Connect, ride, or order instantly.
                        </p>

                        <div className={styles.cardsGrid}>
                            <div className={styles.card}>
                                <Map size={24} className={styles.cardIcon} />
                                <span style={{fontSize: '0.9rem', fontWeight: 600}}>Route Search</span>
                            </div>
                            <div className={styles.card}>
                                <Zap size={24} className={styles.cardIcon} />
                                <span style={{fontSize: '0.9rem', fontWeight: 600}}>Express Delivery</span>
                            </div>
                            <div className={styles.card}>
                                <ShoppingBag size={24} className={styles.cardIcon} />
                                <span style={{fontSize: '0.9rem', fontWeight: 600}}>Personal Shopper</span>
                            </div>
                        </div>

                        <div className={styles.btnGroup}>
                            <button onClick={() => setStep(2)} className={styles.primaryBtn}>
                                Show Me Around <ArrowRight size={18} />
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h1 className={styles.title}>Find a Route instantly.</h1>
                        <p className={styles.subtitle}>
                            Stop guessing bus fares or keke routes. Search any destination and our validated community data guides you.
                        </p>

                        <div className={styles.searchMock}>
                            <div style={{color: '#888', marginBottom: 8, fontSize: '0.9rem'}}>Where to?</div>
                            <div className={styles.inputMock}>Waterlines Node</div>
                            <div style={{color: '#888', marginBottom: 8, fontSize: '0.9rem', marginTop: 16}}>From?</div>
                            <div className={styles.inputMock}>Choba Gate</div>
                            
                            {!mockResult && (
                                <button 
                                    onClick={runMockSearch} 
                                    className={styles.primaryBtn} 
                                    style={{width: '100%', marginTop: 24}}
                                    disabled={mockSearching}
                                >
                                    {mockSearching ? 'Searching...' : 'Try It'}
                                </button>
                            )}

                            {mockResult && (
                                <div className={styles.resultMock}>
                                    <CheckCircle size={20} />
                                    <span>Found 2 routes! Direct Keke (₦500)</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.btnGroup} style={{marginTop: mockResult ? 24 : 0}}>
                            <button onClick={() => setStep(3)} className={styles.primaryBtn}>
                                Next Step <ArrowRight size={18} />
                            </button>
                            <button onClick={() => setStep(3)} className={styles.ghostBtn}>
                                Skip for now
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h1 className={styles.title}>Earn Points, Unlock Rewards.</h1>
                        <p className={styles.subtitle}>
                            Our intelligence layer relies on you. Help map the city and earn perks, airtime, and premiums.
                        </p>

                        <div className={styles.pointsList}>
                            <div className={styles.pointItem}>
                                <div>📍</div>
                                <div>
                                    <h4 className={styles.pointTarget}>Suggest a new Route</h4>
                                    <span style={{fontSize: '0.85rem', color: '#888'}}>Every validated route gets approved.</span>
                                </div>
                                <div className={styles.pointVal}>+10 pts</div>
                            </div>
                            <div className={styles.pointItem}>
                                <div>⚠️</div>
                                <div>
                                    <h4 className={styles.pointTarget}>Submit a Road Alert</h4>
                                    <span style={{fontSize: '0.85rem', color: '#888'}}>Traffic or hazard warnings.</span>
                                </div>
                                <div className={styles.pointVal}>+5 pts</div>
                            </div>
                            <div className={styles.pointItem}>
                                <div>🤝</div>
                                <div>
                                    <h4 className={styles.pointTarget}>Refer a Friend</h4>
                                    <span style={{fontSize: '0.85rem', color: '#888'}}>When they make their first order.</span>
                                </div>
                                <div className={styles.pointVal}>+100 pts</div>
                            </div>
                        </div>

                        <div className={styles.btnGroup}>
                            <button onClick={() => completeOnboarding('/suggest-route')} className={styles.primaryBtn} style={{background: '#FFFFFF'}}>
                                Start Earning — Add your first route 
                            </button>
                            <button onClick={() => completeOnboarding('/dashboard')} className={styles.ghostBtn} style={{border: '1px solid rgba(255,255,255,0.3)'}}>
                                Go to Dashboard
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
