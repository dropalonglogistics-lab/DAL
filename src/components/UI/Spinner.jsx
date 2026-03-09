import React from 'react';

const sizeMap = {
    sm: { width: '18px', height: '18px', border: '2px' },
    md: { width: '28px', height: '28px', border: '3px' },
    lg: { width: '40px', height: '40px', border: '4px' },
};

export default function Spinner({ size = 'md', style = {}, className = '' }) {
    const s = sizeMap[size] || sizeMap.md;

    return (
        <span
            className={className}
            role="status"
            aria-label="Loading"
            style={{
                display: 'inline-block',
                width: s.width,
                height: s.height,
                border: `${s.border} solid var(--brand-gold-muted)`,
                borderTopColor: 'var(--brand-gold)',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                flexShrink: 0,
                ...style,
            }}
        />
    );
}
