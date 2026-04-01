'use client';

import React, { useEffect, useCallback } from 'react';

const sizeMap = {
    sm: '400px',
    md: '520px',
    lg: '720px',
    xl: '960px'
};

export default function Modal({ isOpen, onClose, title, children, size = 'md', style = {} }) {
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
                padding: '16px',
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
                    borderRadius: '16px',
                    padding: '24px',
                    maxWidth: sizeMap[size] || sizeMap.md,
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
                        marginBottom: '16px',
                    }}
                >
                    {title && (
                        <h3
                            style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-display), sans-serif',
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
                            borderRadius: '50%',
                            border: 'none',
                            background: 'var(--brand-off-white)',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.2s',
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
