'use client';

import React from 'react';

const sizeMap = {
    sm: { padding: '6px 14px', fontSize: '13px', height: '32px', iconSize: 14 },
    md: { padding: '10px 22px', fontSize: '15px', height: '40px', iconSize: 16 },
    lg: { padding: '14px 30px', fontSize: '17px', height: '48px', iconSize: 18 },
};

const variantStyles = {
    primary: {
        background: 'linear-gradient(135deg, var(--brand-gold) 0%, var(--brand-gold-light) 100%)',
        color: 'var(--brand-black)',
        border: 'none',
        fontWeight: 700,
    },
    secondary: {
        background: 'var(--brand-black)',
        color: 'var(--brand-gold)',
        border: 'none',
        fontWeight: 600,
    },
    ghost: {
        background: 'transparent',
        color: 'var(--brand-gold)',
        border: '1.5px solid var(--brand-gold)',
        fontWeight: 600,
    },
    danger: {
        background: 'var(--error)',
        color: '#FFFFFF',
        border: 'none',
        fontWeight: 600,
    },
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    style = {},
    className = '',
    ...props
}) {
    const s = sizeMap[size] || sizeMap.md;
    const v = variantStyles[variant] || variantStyles.primary;
    const isDisabled = disabled || loading;

    return (
        <button
            className={className}
            disabled={isDisabled}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: s.padding,
                fontSize: s.fontSize,
                height: s.height,
                borderRadius: 'var(--radius-md)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.55 : 1,
                transition: 'all var(--transition-fast)',
                letterSpacing: '0.01em',
                lineHeight: 1,
                ...v,
                ...style,
            }}
            onMouseEnter={(e) => {
                if (!isDisabled) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
            {...props}
        >
            {loading ? (
                <span
                    style={{
                        width: s.iconSize,
                        height: s.iconSize,
                        border: '2px solid currentColor',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                        flexShrink: 0,
                    }}
                />
            ) : (
                leftIcon && <span style={{ display: 'flex', flexShrink: 0 }}>{leftIcon}</span>
            )}
            {children}
            {rightIcon && !loading && (
                <span style={{ display: 'flex', flexShrink: 0 }}>{rightIcon}</span>
            )}
        </button>
    );
}
