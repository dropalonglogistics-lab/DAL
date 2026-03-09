import React from 'react';

const variantStyles = {
    gold: {
        background: 'linear-gradient(135deg, var(--brand-gold), var(--brand-gold-light))',
        color: 'var(--brand-black)',
    },
    green: {
        background: 'rgba(26, 140, 78, 0.12)',
        color: 'var(--success)',
    },
    amber: {
        background: 'rgba(217, 119, 6, 0.12)',
        color: 'var(--warning)',
    },
    red: {
        background: 'rgba(192, 57, 43, 0.12)',
        color: 'var(--error)',
    },
    grey: {
        background: 'var(--border)',
        color: 'var(--text-secondary)',
    },
};

export default function Badge({ children, variant = 'gold', style = {}, className = '' }) {
    const v = variantStyles[variant] || variantStyles.gold;

    return (
        <span
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.03em',
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                ...v,
                ...style,
            }}
        >
            {children}
        </span>
    );
}
