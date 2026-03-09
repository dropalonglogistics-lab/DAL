'use client';

import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

export function DALToaster() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--brand-black)',
                    color: '#FFFFFF',
                    borderLeft: '4px solid var(--brand-gold)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    fontSize: '14px',
                    boxShadow: 'var(--shadow-lg)',
                    maxWidth: '420px',
                },
                success: {
                    iconTheme: {
                        primary: '#1A8C4E',
                        secondary: '#FFFFFF',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#C0392B',
                        secondary: '#FFFFFF',
                    },
                },
            }}
        />
    );
}

export function showToast(message, type = 'default') {
    switch (type) {
        case 'success':
            return toast.success(message);
        case 'error':
            return toast.error(message);
        default:
            return toast(message);
    }
}

export { toast };
