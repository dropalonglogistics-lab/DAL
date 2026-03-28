import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import CommunityClient from './CommunityClient';

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Show lock screen — no content for unauthenticated users
        return <LockScreen />;
    }

    // Pre-fetch competition and user rank for SSR
    const { data: activeComp } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

    const { data: lastEnded } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'ended')
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle();

    const competition = activeComp || lastEnded || null;
    const state = activeComp ? 'active' : lastEnded ? 'ended' : 'none';

    // Leaderboard top 25
    const { data: leaderboardRaw, count: totalCount } = await supabase
        .from('profiles')
        .select('id, full_name, points, city', { count: 'exact' })
        .order('points', { ascending: false })
        .limit(25);

    const leaderboard = (leaderboardRaw ?? []).map((u, i) => {
        const parts = (u.full_name || 'Anonymous').split(' ');
        const firstName = parts[0];
        const lastInitial = parts.length > 1 ? parts[1].charAt(0) + '.' : '';
        return {
            rank: i + 1,
            id: u.id,
            name: lastInitial ? `${firstName} ${lastInitial}` : firstName,
            points: u.points ?? 0,
            location: u.city || 'Port Harcourt',
        };
    });

    // User rank
    const { data: myProfile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
    const myPoints = myProfile?.points ?? 0;
    const { count: aboveMe } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('points', myPoints);
    const myRank = (aboveMe ?? 0) + 1;

    // Top 25 threshold
    const top25Threshold = leaderboard.length >= 25 ? leaderboard[24].points : 0;

    // Past competitions
    const { data: pastComps } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'ended')
        .order('end_date', { ascending: false })
        .limit(5);

    return (
        <CommunityClient
            competition={competition}
            competitionState={state}
            leaderboard={leaderboard}
            totalParticipants={totalCount ?? 0}
            myRank={myRank}
            myPoints={myPoints}
            top25Threshold={top25Threshold}
            pastCompetitions={pastComps ?? []}
        />
    );
}

function LockScreen() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 40%, #181818 0%, #000 100%)',
            flexDirection: 'column', gap: '24px', padding: '40px 20px', textAlign: 'center',
        }}>
            <div style={{ fontSize: '64px', lineHeight: 1 }}>🔒</div>
            <div>
                <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.2rem)', fontWeight: 900, background: 'linear-gradient(135deg, #fff 20%, #C9A227 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '12px', fontFamily: "'Syne', sans-serif" }}>
                    Join the Competition
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', maxWidth: '420px', lineHeight: 1.6 }}>
                    Sign in to see where you rank on DAL&apos;s leaderboard and compete for monthly prizes.
                </p>
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href="/login?next=/community" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'linear-gradient(135deg, #C9A227, #D97706)', color: '#000',
                    padding: '14px 32px', borderRadius: '100px', fontWeight: 800, fontSize: '1rem',
                    textDecoration: 'none', boxShadow: '0 10px 30px rgba(201,162,39,0.35)',
                    transition: 'transform 0.2s',
                }}>
                    Sign In
                </a>
                <a href="/signup?next=/community" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    border: '1.5px solid rgba(201,162,39,0.5)', color: '#C9A227',
                    padding: '14px 32px', borderRadius: '100px', fontWeight: 700, fontSize: '1rem',
                    textDecoration: 'none', transition: 'all 0.2s', background: 'transparent',
                }}>
                    Create Account
                </a>
            </div>
        </div>
    );
}
