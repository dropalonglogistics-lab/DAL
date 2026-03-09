'use client';

import toast, { Toaster } from 'react-hot-toast';

/* ─── Custom-styled Toaster ───────────────────────────────── */
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
                        primary: 'var(--success)',
                        secondary: '#FFFFFF',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--error)',
                        secondary: '#FFFFFF',
                    },
                },
            }}
        />
    );
}

/* ─── Helper functions ────────────────────────────────────── */
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
