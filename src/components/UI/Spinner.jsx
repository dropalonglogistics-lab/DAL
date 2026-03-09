import React from 'react';

const sizeMap = {
    sm: '16px',
    md: '32px',
    lg: '48px',
};

export default function Spinner({ size = 'md', style = {}, className = '' }) {
    const s = sizeMap[size] || sizeMap.md;
    const borderSize = size === 'sm' ? '2px' : size === 'lg' ? '4px' : '3px';

    return (
        <span
            className={className}
            role="status"
            aria-label="Loading"
            style={{
                display: 'inline-block',
                width: s,
                height: s,
                border: `${borderSize} solid #F5E6A3`,
                borderTopColor: '#C9A227',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                flexShrink: 0,
                ...style,
            }}
        />
    );
}
