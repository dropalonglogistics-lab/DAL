import { createClient } from '@/utils/supabase/server'
import styles from '../admin.module.css'
import { MapPin, Clock, MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { deleteRoute, updateRouteStatus } from '../actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AllRoutesPage() {
    const supabase = await createClient()
    const { data: routes } = await supabase
        .from('community_routes')
        .select(`
            *,
            profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved':
                return { background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)' }
            case 'rejected':
                return { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }
            case 'pending':
            default:
                return { background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }
        }
    }

    async function handleDelete(formData: FormData) {
        'use server'
        await deleteRoute(formData)
    }

    async function handleStatusUpdate(formData: FormData) {
        'use server'
        await updateRouteStatus(formData)
    }

    return (
        <div className="animate-fade-in">
            <h1 className={styles.title}>All Community Routes</h1>
            <p className={styles.subtitle} style={{ marginBottom: '24px' }}>
                View and manage the entire database of suggested routes regardless of their approval status.
            </p>

            <div className={styles.grid}>
                {(!routes || routes.length === 0) ? (
                    <div className={styles.emptyState} style={{ gridColumn: '1 / -1', padding: '40px', background: 'var(--card-bg)' }}>
                        <MoreHorizontal size={40} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
                        <h3>No Routes Found</h3>
                        <p>The community route database is currently empty.</p>
                    </div>
                ) : (
                    routes.map((route) => {
                        const statusStyle = getStatusStyle(route.status)

                        return (
                            <div key={route.id} className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{route.origin} to {route.destination}</h3>
                                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            Suggested by: {route.profiles?.full_name || 'Unknown User'}
                                        </p>
                                    </div>
                                    <span className={styles.badge} style={statusStyle}>
                                        {route.status ? route.status.charAt(0).toUpperCase() + route.status.slice(1) : 'Pending'}
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
                                        ₦{route.price_estimated || route.fare_min || '?'}
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '0.85rem', margin: '0 0 8px', color: 'var(--text-primary)' }}>Stops ({route.itinerary?.length || 0})</h4>
                                    <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                                        {route.itinerary?.map((stop: any, idx: number) => (
                                            <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                                                <strong>{stop.location}</strong> - <span>{stop.instruction}</span>
                                                {stop.fare && <span style={{ marginLeft: '4px', color: 'var(--color-primary)' }}>(₦{stop.fare})</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'auto', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                                    Submitted on: {new Date(route.created_at).toLocaleDateString()}
                                </div>

                                {/* Quick Actions */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>

                                    <Link href={`/admin/routes/${route.id}/edit`} className={styles.secondaryBtn} style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.85rem', textDecoration: 'none', background: 'var(--button-secondary-bg)', color: 'var(--text-primary)', borderRadius: '8px', fontWeight: '500', border: '1px solid var(--border)' }}>
                                        <Edit size={14} /> Edit
                                    </Link>

                                    {route.status !== 'approved' && (
                                        <form action={handleStatusUpdate} style={{ flex: '1' }}>
                                            <input type="hidden" name="routeId" value={route.id} />
                                            <input type="hidden" name="status" value="approved" />
                                            <button type="submit" className={styles.saveBtn} style={{ width: '100%', padding: '8px', fontSize: '0.85rem', background: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                        </form>
                                    )}

                                    {route.status !== 'rejected' && (
                                        <form action={handleStatusUpdate} style={{ flex: '1' }}>
                                            <input type="hidden" name="routeId" value={route.id} />
                                            <input type="hidden" name="status" value="rejected" />
                                            <button type="submit" className={styles.signOutBtn} style={{ width: '100%', padding: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </form>
                                    )}

                                    <form action={handleDelete} style={{ flex: 'none' }}>
                                        <input type="hidden" name="routeId" value={route.id} />
                                        <button type="submit" className={styles.signOutBtn} style={{ padding: '8px', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)' }} title="Delete Route permanently">
                                            <Trash2 size={16} />
                                        </button>
                                    </form>
                                </div>

                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
