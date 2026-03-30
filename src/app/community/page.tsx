import { createClient } from '@/utils/supabase/server';
import CommunityClient from './CommunityClient';

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <LockScreen />;
    }

    // 1. Fetch Real-time Stats
    // Active Members
    const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // Reports Today (Unique areas in last 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: alertsData } = await supabase
        .from('alerts')
        .select('area')
        .gt('created_at', yesterday);
    const uniqueAreas = new Set(alertsData?.map(a => a.area) || []);
    const reportsToday = uniqueAreas.size;

    // Routes Verified
    const { count: verifiedCount } = await supabase
        .from('routes')
        .select('*', { count: 'exact', head: true });
        // NOTE: If there's a 'verified' column, add .eq('verified', true)

    // 2. Competition Data
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

    // 3. Leaderboard (Top 25)
    const { data: leaderboardRaw } = await supabase
        .from('profiles')
        .select('id, full_name, points, city')
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

    // 4. User Standing
    const { data: myProfile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
    const myPoints = myProfile?.points ?? 0;
    const { count: aboveMe } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('points', myPoints);
    const myRank = (aboveMe ?? 0) + 1;

    const top25Threshold = leaderboard.length >= 25 ? leaderboard[24].points : 0;

    // 5. Past Competitions
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
            totalParticipants={memberCount ?? 0}
            reportsToday={reportsToday}
            verifiedCount={verifiedCount ?? 0}
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
            background: '#0D0D0D',
            flexDirection: 'column', gap: '24px', padding: '40px 20px', textAlign: 'center',
        }}>
            <div style={{ fontSize: '64px', lineHeight: 1 }}>🔒</div>
            <div>
                <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.2rem)', fontWeight: 900, color: '#FFFFFF', marginBottom: '12px', fontFamily: "'Syne', sans-serif" }}>
                    Join the Community
                </h1>
                <p style={{ color: '#555555', fontSize: '1.05rem', maxWidth: '420px', lineHeight: 1.6, margin: '0 auto' }}>
                    Sign in to see where you rank on DAL&apos;s leaderboard and contribute to Port Harcourt&apos;s intelligence layer.
                </p>
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href="/login?next=/community" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    backgroundColor: '#C9A227', color: '#0D0D0D',
                    padding: '14px 32px', borderRadius: '8px', fontWeight: 800, fontSize: '1rem',
                    textDecoration: 'none', transition: 'opacity 0.2s',
                }}>
                    Sign In
                </a>
            </div>
        </div>
    );
}
