import React from 'react';

export default function Card({ children, style = {}, hover = false, className = '', ...props }) {
    return (
        <div
            className={className}
            style={{
                backgroundColor: 'var(--brand-surface)',
                borderRadius: '10px',
                padding: 'var(--space-5, 20px)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid var(--border)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                ...(hover ? { cursor: 'pointer' } : {}),
                ...style,
            }}
            onMouseEnter={(e) => {
                if (hover) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.08)';
                }
            }}
            onMouseLeave={(e) => {
                if (hover) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }
            }}
            {...props}
        >
            {children}
        </div>
    );
}
