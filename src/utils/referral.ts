import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Validates whether a user is eligible for a referral bonus, and if so,
 * awards 100 points to both the referrer and the referee.
 *
 * This should be called directly after a successful "First Order" or "First Route Search"
 * is created on the backend.
 *
 * @param supabase An authenticated Supabase server client (Service Role or regular logic with proper RLS)
 * @param userId The ID of the user who just placed their first order
 */
export async function awardReferralBonus(supabase: SupabaseClient, userId: string) {
    try {
        // 1. Check if the user has a referred_by code and hasn't claimed a reward yet
        const { data: profile } = await supabase
            .from('profiles')
            .select('referred_by, referral_reward_claimed')
            .eq('id', userId)
            .single();

        if (!profile || !profile.referred_by || profile.referral_reward_claimed) {
            return { success: false, message: 'Ineligible or already claimed.' };
        }

        // 2. Find the Referrer's profile based on the code
        const { data: referrer } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', profile.referred_by)
            .single();

        if (!referrer) {
            return { success: false, message: 'Invalid referrer code mapped.' };
        }

        const BONUS_POINTS = 100;

        // 3. Award Points to Referee (The new user)
        await supabase.from('points_ledger').insert({
            user_id: userId,
            action: 'REFERRAL_BONUS_RECEIVED',
            points: BONUS_POINTS,
            description: 'Signed up using a referral code and triggered first action'
        });

        // 4. Award Points to Referrer (The one who invited)
        await supabase.from('points_ledger').insert({
            user_id: referrer.id,
            action: 'REFERRAL_BONUS_GIVEN',
            points: BONUS_POINTS,
            description: 'A referred user completed their first action'
        });

        // 5. Update BOTH profiles to reflect the new points totals
        // Note: Assuming you have a total_points column or an RPC function to increment.
        // It's highly recommended to use an RPC (Remote Procedure Call) to increment safely:
        await supabase.rpc('increment_points', { row_id: userId, amount: BONUS_POINTS });
        await supabase.rpc('increment_points', { row_id: referrer.id, amount: BONUS_POINTS });

        // 6. Mark the referral as claimed so it doesn't run twice
        await supabase
            .from('profiles')
            .update({ referral_reward_claimed: true })
            .eq('id', userId);

        return { success: true, message: 'Referral bonuses successfully awarded.' };

    } catch (error) {
        console.error('Referral Bonus Error:', error);
        return { success: false, message: 'Internal error processing referral.' };
    }
}
