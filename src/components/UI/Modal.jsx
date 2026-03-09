'use client';

import React, { useEffect, useCallback } from 'react';

export default function Modal({ isOpen, onClose, title, children, style = {} }) {
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Escape') onClose?.();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-4)',
            }}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                }}
            />

            {/* Panel */}
            <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    backgroundColor: 'var(--brand-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-6)',
                    maxWidth: '520px',
                    width: '100%',
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'fadeInUp 0.25s ease-out',
                    ...style,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-4)',
                    }}
                >
                    {title && (
                        <h3
                            style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-heading), sans-serif',
                                margin: 0,
                            }}
                        >
                            {title}
                        </h3>
                    )}
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            background: 'var(--brand-off-white)',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: 'var(--text-secondary)',
                            transition: 'all var(--transition-fast)',
                            marginLeft: 'auto',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--border)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--brand-off-white)';
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                {children}
            </div>
        </div>
    );
}
