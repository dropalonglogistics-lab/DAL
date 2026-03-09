'use client';

import React, { useId } from 'react';

export default function Input({
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    className = '',
    style = {},
    ...props
}) {
    const id = useId();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...style }} className={className}>
            {label && (
                <label
                    htmlFor={id}
                    style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-heading), sans-serif',
                    }}
                >
                    {label}
                </label>
            )}

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {leftIcon && (
                    <span
                        style={{
                            position: 'absolute',
                            left: '12px',
                            display: 'flex',
                            color: 'var(--text-secondary)',
                            pointerEvents: 'none',
                        }}
                    >
                        {leftIcon}
                    </span>
                )}

                <input
                    id={id}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        paddingLeft: leftIcon ? '40px' : '14px',
                        paddingRight: rightIcon ? '40px' : '14px',
                        fontSize: '15px',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--brand-surface)',
                        border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                        transition: 'all var(--transition-fast)',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = error ? 'var(--error)' : 'var(--brand-gold)';
                        e.target.style.boxShadow = error
                            ? '0 0 0 3px rgba(192, 57, 43, 0.2)'
                            : 'var(--shadow-gold)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)';
                        e.target.style.boxShadow = 'none';
                    }}
                    {...props}
                />

                {rightIcon && (
                    <span
                        style={{
                            position: 'absolute',
                            right: '12px',
                            display: 'flex',
                            color: 'var(--text-secondary)',
                            pointerEvents: 'none',
                        }}
                    >
                        {rightIcon}
                    </span>
                )}
            </div>

            {(helperText || error) && (
                <span
                    style={{
                        fontSize: '13px',
                        color: error ? 'var(--error)' : 'var(--text-secondary)',
                    }}
                >
                    {error || helperText}
                </span>
            )}
        </div>
    );
}
