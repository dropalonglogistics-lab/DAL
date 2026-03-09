'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import { AlertTriangle, Clock, MapPin, RefreshCw, ShieldAlert } from 'lucide-react';

export default function DriverHome() {
    const [refreshing, setRefreshing] = useState(false);

    // In a real app we'd fetch the user's operating areas, let's mock two
    const operatingAreas = ['Trans-Amadi', 'Old GRA'];

    // Mock live alerts feed
    const ALERTS = [
        { id: 1, type: 'Checkpoint', title: 'Police Checkpoint', location: 'Peter Odili Road junction', area: 'Trans-Amadi', time: '2 mins ago', severity: 'amber' },
        { id: 2, type: 'Traffic', title: 'Heavy Standstill', location: 'Garrison roundabout', area: 'Port Harcourt City', time: '14 mins ago', severity: 'red' },
        { id: 3, type: 'Taskforce', title: 'VIO Taskforce Active', location: 'Aba Road by Waterlines', area: 'Old GRA', time: '26 mins ago', severity: 'amber' },
        { id: 4, type: 'Flooding', title: 'Road Flooded', location: 'Nkpogu road', area: 'Trans-Amadi', time: '1 hr ago', severity: 'red' },
    ];

    const refreshAlerts = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '32px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        Road Intelligence
                        <Badge variant="gold">Premium Active</Badge>
                    </h1>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
                        Live alerts personalized for <strong>{operatingAreas.join(', ')}</strong>
                    </p>
                </div>

                <Button variant="secondary" onClick={refreshAlerts} disabled={refreshing} rightIcon={<RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />}>
                    Refresh Feed
                </Button>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>

                {/* Main Alerts Feed */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '20px', margin: 0 }}>Latest Alerts ({ALERTS.length})</h2>
                        <span style={{ fontSize: '13px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                            Live
                        </span>
                    </div>

                    {ALERTS.map(alert => (
                        <Card key={alert.id} style={{ borderLeft: `4px solid ${alert.severity === 'red' ? 'var(--error)' : 'var(--warning)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {alert.severity === 'red' ? <ShieldAlert color="var(--error)" /> : <AlertTriangle color="var(--warning)" />}
                                    <strong style={{ fontSize: '18px' }}>{alert.title}</strong>
                                </div>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={14} /> {alert.time}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '12px' }}>
                                <MapPin size={16} color="var(--brand-gold)" />
                                <span>{alert.location}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Badge variant="grey">{alert.type}</Badge>
                                <Badge variant="grey">{alert.area}</Badge>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Sidebar Widgets */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Subscription Status */}
                    <Card style={{ padding: '24px', backgroundColor: 'var(--brand-black)', color: 'white' }}>
                        <h3 style={{ margin: '0 0 16px', color: 'var(--brand-gold)' }}>Subscription</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '4px' }}>Current Plan</span>
                            <strong>DAL Driver Premium</strong>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '4px' }}>Renews On</span>
                            <strong>March 16, 2026</strong>
                        </div>
                        <Button style={{ width: '100%' }}>Manage Plan</Button>
                    </Card>

                    {/* Quick Route Status */}
                    <Card style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px' }}>Quick Search</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
                            Check a specific route before heading out to avoid surprises.
                        </p>
                        <input
                            placeholder="Enter destination e.g. Choba"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '12px' }}
                        />
                        <Button variant="secondary" style={{ width: '100%' }}>Check Route</Button>
                    </Card>

                </div>

            </div>
        </div>
    );
}
