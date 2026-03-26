import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

async function requireSuperAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthenticated', user: null }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'superadmin') return { error: 'Forbidden', user: null }
    return { error: null, user: { id: user.id, full_name: profile.full_name } }
}

// GET /api/superadmin/roles — fetch all admins with their permissions
export async function GET() {
    const supabase = await createClient()
    const { error: authError } = await requireSuperAdmin(supabase)
    if (authError) return NextResponse.json({ error: authError }, { status: authError === 'Unauthenticated' ? 401 : 403 })

    // Fetch all admin/superadmin profiles
    const { data: admins, error: adminsError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role, is_admin, avatar_url, updated_at')
        .or('is_admin.eq.true,role.in.(admin,superadmin)')
        .order('updated_at', { ascending: false })

    if (adminsError) return NextResponse.json({ error: adminsError.message }, { status: 500 })

    // Fetch permissions for all admin users
    const adminIds = (admins || []).map(a => a.id)
    let permissionsMap: Record<string, string[]> = {}

    if (adminIds.length > 0) {
        const { data: perms } = await supabase
            .from('admin_permissions')
            .select('user_id, permissions')
            .in('user_id', adminIds)

        ;(perms || []).forEach(p => {
            permissionsMap[p.user_id] = p.permissions as string[]
        })
    }

    // Fetch role audit log
    const { data: auditLog } = await supabase
        .from('role_audit_log')
        .select('id, action, target_email, performed_by_name, permissions_before, permissions_after, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

    const result = (admins || []).map(a => ({
        ...a,
        permissions: a.role === 'superadmin'
            ? ['All Permissions']
            : (permissionsMap[a.id] || []),
        lastActive: a.updated_at
            ? new Date(a.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : 'Unknown',
    }))

    return NextResponse.json({ admins: result, auditLog: auditLog || [] })
}

// POST /api/superadmin/roles — create or update admin role + permissions
export async function POST(req: Request) {
    const supabase = await createClient()
    const { error: authError, user: caller } = await requireSuperAdmin(supabase)
    if (authError) return NextResponse.json({ error: authError }, { status: authError === 'Unauthenticated' ? 401 : 403 })

    const body = await req.json()
    const { userId, role, permissions, targetEmail } = body as {
        userId: string
        role: 'admin' | 'superadmin'
        permissions: string[]
        targetEmail: string
    }

    if (!userId || !role) return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 })

    // Get current state for audit log
    const { data: existingPerm } = await supabase
        .from('admin_permissions')
        .select('permissions')
        .eq('user_id', userId)
        .single()

    // Update profile role + is_admin
    const { error: profileErr } = await supabase
        .from('profiles')
        .update({ role, is_admin: true, updated_at: new Date().toISOString() })
        .eq('id', userId)

    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

    // Upsert admin_permissions (superadmin gets all permissions)
    const finalPerms = role === 'superadmin' ? ['All Permissions'] : permissions
    const { error: permErr } = await supabase
        .from('admin_permissions')
        .upsert({
            user_id: userId,
            permissions: finalPerms,
            assigned_by: caller!.id,
            assigned_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

    if (permErr) return NextResponse.json({ error: permErr.message }, { status: 500 })

    // Write to role_audit_log
    await supabase.from('role_audit_log').insert({
        action: existingPerm ? `Updated role to ${role}` : `Assigned ${role} role`,
        target_user_id: userId,
        target_email: targetEmail,
        performed_by: caller!.id,
        performed_by_name: caller!.full_name || 'Super Admin',
        permissions_before: existingPerm?.permissions || [],
        permissions_after: finalPerms,
    })

    return NextResponse.json({ success: true })
}

// DELETE /api/superadmin/roles — revoke admin access
export async function DELETE(req: Request) {
    const supabase = await createClient()
    const { error: authError, user: caller } = await requireSuperAdmin(supabase)
    if (authError) return NextResponse.json({ error: authError }, { status: authError === 'Unauthenticated' ? 401 : 403 })

    const { userId, targetEmail } = await req.json() as { userId: string; targetEmail: string }
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    // Get current permissions for audit
    const { data: existingPerm } = await supabase
        .from('admin_permissions')
        .select('permissions')
        .eq('user_id', userId)
        .single()

    // Revoke: set role back to 'user', is_admin false
    await supabase.from('profiles').update({ role: 'user', is_admin: false, updated_at: new Date().toISOString() }).eq('id', userId)

    // Remove permissions row
    await supabase.from('admin_permissions').delete().eq('user_id', userId)

    // Audit log
    await supabase.from('role_audit_log').insert({
        action: 'Revoked admin access',
        target_user_id: userId,
        target_email: targetEmail,
        performed_by: caller!.id,
        performed_by_name: caller!.full_name || 'Super Admin',
        permissions_before: existingPerm?.permissions || [],
        permissions_after: [],
    })

    return NextResponse.json({ success: true })
}
