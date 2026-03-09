'use client';

import React from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { BarChart, DollarSign, HandCoins, ArrowUpRight, Download } from 'lucide-react';

export default function DriverEarnings() {
    const EARNINGS_HISTORY = [
        { date: 'Today, Mar 9', trips: 3, earnings: '₦12,500', premiumSaved: '₦1,400' },
        { date: 'Yesterday, Mar 8', trips: 1, earnings: '₦4,200', premiumSaved: '₦300' },
        { date: 'Sat, Mar 7', trips: 4, earnings: '₦18,900', premiumSaved: '₦2,100' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '32px', margin: 0 }}>Errand Earnings</h1>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Track the extra income you make accepting errands while driving.</p>
                </div>
                <Button variant="secondary" rightIcon={<Download size={18} />}>
                    Export Statement
                </Button>
            </div>

            {/* Top Level Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <Card style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(201,162,39,0.1)', borderRadius: '8px' }}>
                            <DollarSign size={20} color="var(--brand-gold)" />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Available Balance</span>
                    </div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>₦12,500</h2>
                    <Button size="sm" style={{ width: '100%' }}>Withdraw Now</Button>
                </Card>

                <Card style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(26,140,78,0.1)', borderRadius: '8px' }}>
                            <HandCoins size={20} color="var(--success)" />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>This Week</span>
                    </div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>₦35,600</h2>
                    <span style={{ color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowUpRight size={14} /> +4% vs last week
                    </span>
                </Card>

                <Card style={{ padding: '24px', gridColumn: 'span 2', backgroundColor: '#F8FAFC', border: '1px solid var(--brand-gold)' }}>
                    <h3 style={{ margin: '0 0 16px', color: 'var(--brand-gold)' }}>Premium Advantage</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '14px' }}>Extra money kept from 20% reduced fee (vs standard 30%)</span>
                            <span style={{ fontSize: '36px', fontWeight: 700, color: 'var(--success)' }}>₦3,800 saved</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* History Table */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Daily History</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Date</th>
                            <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Errands Completed</th>
                            <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Net Earnings (80%)</th>
                            <th style={{ padding: '16px 20px', color: 'var(--success)', fontWeight: 600, fontSize: '14px' }}>Premium Saved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {EARNINGS_HISTORY.map((row, i) => (
                            <tr key={i} style={{ borderBottom: i !== EARNINGS_HISTORY.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <td style={{ padding: '16px 20px', fontWeight: 500 }}>{row.date}</td>
                                <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{row.trips}</td>
                                <td style={{ padding: '16px 20px', fontWeight: 600 }}>{row.earnings}</td>
                                <td style={{ padding: '16px 20px', color: 'var(--success)', fontWeight: 600 }}>{row.premiumSaved}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
