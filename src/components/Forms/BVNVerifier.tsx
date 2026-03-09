'use client';

import React, { useState } from 'react';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { showToast } from '@/components/UI/Toast';
interface BVNVerifierProps {
    value: string;
    onChange: (value: string) => void;
    onVerified: (isValid: boolean) => void;
}

export default function BVNVerifier({ value, onChange, onVerified }: BVNVerifierProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const verifyBVN = async () => {
        if (!value || value.length !== 11) {
            setStatus('error');
            setErrorMsg('BVN must be 11 digits');
            onVerified(false);
            return;
        }

        setLoading(true);
        setStatus('idle');
        setErrorMsg('');

        try {
            const res = await fetch('/api/verify-bvn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bvn: value })
            });

            const data = await res.json();

            if (res.ok && data.status) {
                setStatus('success');
                onVerified(true);
                showToast('BVN Verified Successfully', 'success');
            } else {
                setStatus('error');
                setErrorMsg(data.message || 'Verification failed');
                onVerified(false);
                showToast(data.message || 'Verification failed', 'error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMsg('Unable to reach verification service');
            onVerified(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
                <Input
                    label="Bank Verification Number (BVN)"
                    placeholder="Enter your 11-digit BVN"
                    type="text"
                    maxLength={11}
                    value={value}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        onChange(val);
                        if (status !== 'idle') {
                            setStatus('idle');
                            onVerified(false);
                        }
                    }}
                    error={status === 'error' ? errorMsg : undefined}
                    rightIcon={
                        status === 'success' ? (
                            <CheckCircle2 color="var(--success)" size={18} />
                        ) : status === 'error' ? (
                            <XCircle color="var(--error)" size={18} />
                        ) : null
                    }
                />
            </div>
            <Button
                type="button"
                variant={status === 'success' ? 'ghost' : 'secondary'}
                onClick={verifyBVN}
                loading={loading}
                disabled={value.length !== 11 || status === 'success'}
                style={{ marginTop: '24px' }}
            >
                {status === 'success' ? 'Verified' : 'Verify'}
            </Button>
        </div>
    );
}
