import React from 'react';

const variantStyles = {
    gold: {
        background: 'var(--brand-gold)',
        color: 'var(--brand-black)',
    },
    green: {
        background: 'rgba(26, 140, 78, 0.12)',
        color: '#1A8C4E',
    },
    amber: {
        background: 'rgba(217, 119, 6, 0.12)',
        color: '#D97706',
    },
    red: {
        background: 'rgba(192, 57, 43, 0.12)',
        color: '#C0392B',
    },
    grey: {
        background: 'var(--border)',
        color: 'var(--text-secondary)',
    },
    blue: {
        background: 'rgba(59, 130, 246, 0.12)',
        color: '#3B82F6',
    }
};

export default function Badge({ children, variant = 'grey', style = {}, className = '' }) {
    const v = variantStyles[variant] || variantStyles.grey;

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
