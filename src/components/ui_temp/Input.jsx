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
                        fontFamily: 'var(--font-display), sans-serif',
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
                    disabled={props.disabled}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        paddingLeft: leftIcon ? '40px' : '14px',
                        paddingRight: rightIcon ? '40px' : '14px',
                        fontSize: '15px',
                        color: 'var(--text-primary)',
                        backgroundColor: props.disabled ? 'var(--border)' : 'var(--brand-surface)',
                        border: `1.5px solid ${error ? '#C0392B' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                        transition: 'all var(--transition-fast)',
                        opacity: props.disabled ? 0.6 : 1,
                        cursor: props.disabled ? 'not-allowed' : 'text'
                    }}
                    onFocus={(e) => {
                        if (!props.disabled) {
                            e.target.style.borderColor = error ? '#C0392B' : 'var(--brand-gold)';
                            e.target.style.boxShadow = error
                                ? '0 0 0 3px rgba(192, 57, 43, 0.2)'
                                : 'var(--shadow-gold)';
                        }
                    }}
                    onBlur={(e) => {
                        if (!props.disabled) {
                            e.target.style.borderColor = error ? '#C0392B' : 'var(--border)';
                            e.target.style.boxShadow = 'none';
                        }
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
                        color: error ? '#C0392B' : 'var(--text-secondary)',
                    }}
                >
                    {error || helperText}
                </span>
            )}
        </div>
    );
}
