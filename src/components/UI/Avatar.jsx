import React from 'react';

const sizeMap = {
    sm: 32,
    md: 42,
    lg: 56,
    xl: 72,
};

function getInitials(name = '') {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function Avatar({
    src,
    alt = '',
    name = '',
    size = 'md',
    online,
    style = {},
    className = '',
}) {
    const px = sizeMap[size] || sizeMap.md;
    const initials = getInitials(name || alt);

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                width: px,
                height: px,
                flexShrink: 0,
                ...style,
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt || name}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--brand-gold)',
                    }}
                />
            ) : (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--brand-gold) 0%, var(--brand-gold-light) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--brand-black)',
                        fontWeight: 700,
                        fontSize: px * 0.38,
                        fontFamily: 'var(--font-display), sans-serif',
                        letterSpacing: '0.03em',
                    }}
                    aria-label={name || alt}
                >
                    {initials || '?'}
                </div>
            )}

            {typeof online === 'boolean' && (
                <span
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: Math.max(10, px * 0.24),
                        height: Math.max(10, px * 0.24),
                        borderRadius: '50%',
                        backgroundColor: online ? '#1A8C4E' : 'var(--text-secondary)',
                        border: '2px solid var(--brand-surface)',
                    }}
                />
            )}
        </div>
    );
}
