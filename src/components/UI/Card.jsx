import React from 'react';

export default function Card({ children, style = {}, className = '', ...props }) {
    return (
        <div
            className={className}
            style={{
                backgroundColor: 'var(--brand-surface)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-5)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border)',
                transition: 'box-shadow var(--transition-fast)',
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
}
