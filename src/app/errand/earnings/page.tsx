'use client';

import React from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { BarChart, DollarSign, ArrowUpRight, ShoppingCart, Download } from 'lucide-react';

export default function ErrandEarnings() {
    const EARNINGS_HISTORY = [
        { date: 'Today, Mar 9', tasks: 4, earnings: '₦9,100', status: 'Pending Payout' },
        { date: 'Yesterday, Mar 8', tasks: 6, earnings: '₦12,450', status: 'Paid' },
        { date: 'Sat, Mar 7', tasks: 8, earnings: '₦18,900', status: 'Paid' },
        { date: 'Fri, Mar 6', tasks: 2, earnings: '₦5,050', status: 'Paid' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '32px', margin: 0 }}>Earnings</h1>
                    <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Track your daily income from completed tasks.</p>
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
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>₦9,100</h2>
                    <Button size="sm" style={{ width: '100%' }}>Withdraw Now</Button>
                </Card>

                <Card style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(26,140,78,0.1)', borderRadius: '8px' }}>
                            <BarChart size={20} color="var(--success)" />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>This Week</span>
                    </div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>₦45,500</h2>
                    <span style={{ color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowUpRight size={14} /> +8% vs last week
                    </span>
                </Card>

                <Card style={{ padding: '24px', gridColumn: 'span 2', backgroundColor: 'var(--brand-black)', color: 'white' }}>
                    <h3 style={{ margin: '0 0 16px', color: 'var(--brand-gold)' }}>Next Scheduled Payout</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <span style={{ display: 'block', color: '#888', marginBottom: '4px' }}>Amount to bank</span>
                            <span style={{ fontSize: '36px', fontWeight: 700 }}>₦45,500</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', color: '#888', marginBottom: '4px' }}>Date</span>
                            <span style={{ fontSize: '20px', fontWeight: 600 }}>Wednesday, Mar 11</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Warning about customer payments */}
            <Card style={{ padding: '16px 24px', backgroundColor: 'rgba(201,162,39,0.05)', borderColor: 'var(--brand-gold)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ShoppingCart size={32} color="var(--brand-gold)" />
                <div>
                    <h4 style={{ margin: '0 0 4px', color: 'var(--brand-gold)' }}>Important Notice re: Item Costs</h4>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        These earnings reflect your <strong>DAL Service Fee (70%)</strong> only. Any funds transferred directly to your bank account by the customer for the actual purchase of goods (e.g. Market Runs) are not tracked here.
                    </span>
                </div>
            </Card>

            {/* History Table */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Daily History</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Date</th>
                            <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Completed Tasks</th>
                            <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Net Earnings (70%)</th>
                            <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {EARNINGS_HISTORY.map((row, i) => (
                            <tr key={i} style={{ borderBottom: i !== EARNINGS_HISTORY.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <td style={{ padding: '16px 20px', fontWeight: 500 }}>{row.date}</td>
                                <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{row.tasks}</td>
                                <td style={{ padding: '16px 20px', fontWeight: 600 }}>{row.earnings}</td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                                        backgroundColor: row.status === 'Paid' ? 'rgba(26,140,78,0.1)' : 'rgba(245,158,11,0.1)',
                                        color: row.status === 'Paid' ? 'var(--success)' : 'var(--warning)'
                                    }}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
