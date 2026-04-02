import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Map, Zap, Award } from 'lucide-react';
import styles from '../invite.module.css';

export default async function InvitePage({ params }: { params: { code: string } }) {
    const supabase = await createClient();
    
    // Attempt to lookup the referrer gracefully
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, referral_code')
        .eq('referral_code', params.code)
        .maybeSingle();

    if (!profile) {
        // Not a valid referral code or DB error
        notFound();
    }

    const firstName = profile.full_name?.split(' ')[0] || 'A friend';

    return (
        <div className={styles.container}>
            <div className={styles.gradientBg} />
            
            <div className={styles.card}>
                <div className={styles.avatar}>
                    {firstName.charAt(0).toUpperCase()}
                </div>
                
                <h1 className={styles.title}>
                    {firstName} invited you to DAL!
                </h1>
                <p className={styles.subtitle}>
                    Join the smartest mobility community in Port Harcourt and unlock faster, cheaper ways to move.
                </p>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <div className={styles.iconWrap}><Map size={24} /></div>
                        <div>
                            <strong style={{display: 'block'}}>Live Routing Details</strong>
                            <span style={{fontSize: '0.9rem', color: '#888'}}>Know the exact keke bus fare before leaving the house.</span>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.iconWrap}><Zap size={24} /></div>
                        <div>
                            <strong style={{display: 'block'}}>Express Logistics</strong>
                            <span style={{fontSize: '0.9rem', color: '#888'}}>Connect directly with verified dispatch riders near you.</span>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.iconWrap}><Award size={24} /></div>
                        <div>
                            <strong style={{display: 'block'}}>Earn 100 Bonus Points</strong>
                            <span style={{fontSize: '0.9rem', color: '#888'}}>Use {firstName}'s code when signing up to jumpstart your rank.</span>
                        </div>
                    </div>
                </div>

                <Link href={`/auth/register?ref=${params.code}`} className={styles.primaryBtn}>
                    Accept Invite & Sign Up
                </Link>
                
                <Link href="/" style={{color: '#888', marginTop: 24, fontSize: '0.9rem', textDecoration: 'none'}}>
                    Learn more about DAL
                </Link>
            </div>
        </div>
    );
}
