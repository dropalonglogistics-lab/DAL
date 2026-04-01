'use client';

import React, { useState } from 'react';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Badge from '@/components/UI/Badge';
import Card from '@/components/UI/Card';
import Modal from '@/components/UI/Modal';
import Spinner from '@/components/UI/Spinner';
import Avatar from '@/components/UI/Avatar';
import { DALToaster, showToast } from '@/components/UI/Toast';

export default function TestUIPage() {
    const [modalOpen, setModalOpen] = useState(false);

    const sectionTitle = {
        fontSize: '22px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-display), sans-serif',
        borderBottom: '2px solid var(--brand-gold)',
        paddingBottom: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
        marginTop: 'var(--space-7)',
    };

    const row = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        alignItems: 'center',
        marginBottom: 'var(--space-4)',
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <DALToaster />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <img src="/dal-logo-dark.png" alt="DAL" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                <div>
                    <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display), sans-serif', margin: 0 }}>
                        DAL Design System
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                        Component test page — all 8 UI components
                    </p>
                </div>
            </div>

            {/* ─── Buttons ─────────────────────────────────── */}
            <h2 style={sectionTitle}>Buttons</h2>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Variants
            </p>
            <div style={row}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Sizes
            </p>
            <div style={row}>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                States
            </p>
            <div style={row}>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
            </div>

            {/* ─── Inputs ──────────────────────────────────── */}
            <h2 style={sectionTitle}>Inputs</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
                <Input label="Name" placeholder="Enter your name" helperText="Your full legal name" />
                <Input label="Email" placeholder="you@example.com" error="Invalid email address" />
                <Input label="Search" placeholder="Search routes…" leftIcon={<span>🔍</span>} />
            </div>

            {/* ─── Badges ──────────────────────────────────── */}
            <h2 style={sectionTitle}>Badges</h2>
            <div style={row}>
                <Badge variant="gold">Premium</Badge>
                <Badge variant="green">Verified</Badge>
                <Badge variant="amber">Pending</Badge>
                <Badge variant="red">Alert</Badge>
                <Badge variant="grey">Inactive</Badge>
            </div>

            {/* ─── Cards ───────────────────────────────────── */}
            <h2 style={sectionTitle}>Card</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
                <Card>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Route Info</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                        Lagos → Abuja express route. Estimated 8h drive time.
                    </p>
                </Card>
                <Card>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Pricing</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                        ₦12,500 per parcel. Next-day delivery guaranteed.
                    </p>
                </Card>
            </div>

            {/* ─── Modal ───────────────────────────────────── */}
            <h2 style={sectionTitle}>Modal</h2>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
                Open Modal
            </Button>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Action">
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 var(--space-4)' }}>
                    Are you sure you want to schedule this delivery? This action will notify the driver.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => { setModalOpen(false); showToast('Delivery scheduled!', 'success'); }}>
                        Confirm
                    </Button>
                </div>
            </Modal>

            {/* ─── Spinners ────────────────────────────────── */}
            <h2 style={sectionTitle}>Spinners</h2>
            <div style={row}>
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
            </div>

            {/* ─── Avatars ─────────────────────────────────── */}
            <h2 style={sectionTitle}>Avatars</h2>
            <div style={row}>
                <Avatar name="DAL Admin" size="sm" online />
                <Avatar name="Jane Doe" size="md" online={false} />
                <Avatar name="Olumide" size="lg" online />
                <Avatar src="/dal-logo-dark.png" alt="DAL" size="md" />
            </div>

            {/* ─── Toasts ──────────────────────────────────── */}
            <h2 style={sectionTitle}>Toasts</h2>
            <div style={row}>
                <Button variant="primary" size="sm" onClick={() => showToast('Route created successfully!', 'success')}>
                    Success Toast
                </Button>
                <Button variant="danger" size="sm" onClick={() => showToast('Something went wrong', 'error')}>
                    Error Toast
                </Button>
                <Button variant="ghost" size="sm" onClick={() => showToast('This is an info message')}>
                    Default Toast
                </Button>
            </div>

            {/* ─── Logo Showcase ───────────────────────────── */}
            <h2 style={sectionTitle}>Brand Assets</h2>
            <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                    <img src="/dal-logo-dark.png" alt="DAL Full Logo" style={{ height: 80, objectFit: 'contain' }} />
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Full Logo</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <img src="/dal-logo-dark.png" alt="DAL Icon" style={{ height: 60, objectFit: 'contain' }} />
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Icon</p>
                </div>
            </div>

            <div style={{ height: 'var(--space-9)' }} />
        </div>
    );
}
