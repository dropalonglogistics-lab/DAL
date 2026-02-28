import { createClient } from '@/utils/supabase/server'
import styles from '../admin.module.css'
import { approveRoute, rejectRoute } from '../actions'
import { CheckCircle, XCircle, MapPin, Clock } from 'lucide-react'

export default async function RouteApprovals() {
    const supabase = await createClient()
    const { data: routes } = await supabase
        .from('community_routes')
        .select(`
            *,
            profiles(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    async function handleApprove(formData: FormData) {
        'use server'
        await approveRoute(formData)
    }

    async function handleReject(formData: FormData) {
        'use server'
        await rejectRoute(formData)
    }

    return (
        <div className="animate-fade-in">
            <h1 className={styles.title}>Route Approvals</h1>
            <p className={styles.subtitle} style={{ marginBottom: '24px' }}>
                Review routes suggested by the community before they appear in public search.
            </p>

            <div className={styles.grid}>
                {(!routes || routes.length === 0) ? (
                    <div className={styles.emptyState} style={{ gridColumn: '1 / -1', padding: '40px', background: 'var(--card-bg)' }}>
                        <CheckCircle size={40} color="var(--color-success)" style={{ marginBottom: '16px' }} />
                        <h3>All Caught Up!</h3>
                        <p>There are no pending routes to review at this time.</p>
                    </div>
                ) : (
                    routes.map((route) => (
                        <div key={route.id} className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{route.origin} to {route.destination}</h3>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        Suggested by: {route.profiles?.full_name || 'Unknown User'}
                                    </p>
                                </div>
                                <span className={styles.badge} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
                                    Pending
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={14} /> {route.vehicle_type || 'Various'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={14} /> {route.duration_minutes || '?'} mins
                                </div>
                                <div>
                                    ₦{route.price_estimated || '?'}
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.85rem', margin: '0 0 8px', color: 'var(--text-primary)' }}>Stops ({route.itinerary?.length || 0})</h4>
                                <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {route.itinerary?.map((stop: any, idx: number) => (
                                        <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                                            <strong>{stop.location}</strong> - <span>{stop.instruction}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                                <form action={handleApprove} style={{ flex: 1 }}>
                                    <input type="hidden" name="routeId" value={route.id} />
                                    <button type="submit" className={styles.saveBtn} style={{ padding: '8px', fontSize: '0.9rem', width: '100%', background: 'var(--color-success)' }}>
                                        Approve
                                    </button>
                                </form>
                                <form action={handleReject} style={{ flex: 1 }}>
                                    <input type="hidden" name="routeId" value={route.id} />
                                    <button type="submit" className={styles.signOutBtn} style={{ padding: '8px', fontSize: '0.9rem', width: '100%' }}>
                                        Reject
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
