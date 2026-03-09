'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { CheckCircle2, Loader2 } from 'lucide-react';

// Common Nigerian banks for the dropdown
const BANKS = [
    { name: 'Access Bank', code: '044' },
    { name: 'Access Bank (Diamond)', code: '063' },
    { name: 'ALAT by WEMA', code: '035A' },
    { name: 'ASO Savings and Loans', code: '401' },
    { name: 'Bowen Microfinance Bank', code: '50931' },
    { name: 'Cemcs Microfinance Bank', code: '50823' },
    { name: 'Citibank Nigeria', code: '023' },
    { name: 'Ecobank Nigeria', code: '050' },
    { name: 'Ekondo Microfinance Bank', code: '562' },
    { name: 'Fidelity Bank', code: '070' },
    { name: 'First Bank of Nigeria', code: '011' },
    { name: 'First City Monument Bank', code: '214' },
    { name: 'Globus Bank', code: '00103' },
    { name: 'Guaranty Trust Bank', code: '058' },
    { name: 'Hasal Microfinance Bank', code: '50383' },
    { name: 'Heritage Bank', code: '030' },
    { name: 'Jaiz Bank', code: '301' },
    { name: 'Keystone Bank', code: '082' },
    { name: 'Kuda Bank', code: '50211' },
    { name: 'Moniepoint MFB', code: '50515' },
    { name: 'Opay / Paycom', code: '999992' },
    { name: 'Palmpay', code: '999991' },
    { name: 'Parallex Bank', code: '526' },
    { name: 'Polaris Bank', code: '076' },
    { name: 'Providus Bank', code: '101' },
    { name: 'Rubies MFB', code: '125' },
    { name: 'Stanbic IBTC Bank', code: '221' },
    { name: 'Standard Chartered Bank', code: '068' },
    { name: 'Sterling Bank', code: '232' },
    { name: 'Suntrust Bank', code: '100' },
    { name: 'TAJ Bank', code: '302' },
    { name: 'Titan Bank', code: '102' },
    { name: 'Union Bank of Nigeria', code: '032' },
    { name: 'United Bank For Africa', code: '033' },
    { name: 'Unity Bank', code: '215' },
    { name: 'VFD Microfinance Bank', code: '566' },
    { name: 'Wema Bank', code: '035' },
    { name: 'Zenith Bank', code: '057' }
].sort((a, b) => a.name.localeCompare(b.name));


interface BankAccountVerifierProps {
    bankCode: string;
    accountNumber: string;
    onBankChange: (code: string, name: string) => void;
    onAccountChange: (account: string) => void;
    onResolved: (accountName: string) => void;
}

export default function BankAccountVerifier({
    bankCode,
    accountNumber,
    onBankChange,
    onAccountChange,
    onResolved
}: BankAccountVerifierProps) {
    const [resolving, setResolving] = useState(false);
    const [resolvedName, setResolvedName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Auto-resolve when exactly 10 digits are entered and a bank is selected
        if (accountNumber.length === 10 && bankCode) {
            resolveAccount();
        } else {
            setResolvedName('');
            setError('');
            onResolved('');
        }
    }, [accountNumber, bankCode]);

    const resolveAccount = async () => {
        setResolving(true);
        setError('');
        setResolvedName('');
        onResolved('');

        try {
            const res = await fetch(`/api/verify-bank?account_number=${accountNumber}&bank_code=${bankCode}`);
            const data = await res.json();

            if (res.ok && data.status) {
                setResolvedName(data.data.account_name);
                onResolved(data.data.account_name);
            } else {
                setError(data.message || 'Could not verify account');
            }
        } catch (err) {
            setError('Service unavailable');
        } finally {
            setResolving(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Bank Name
                </label>
                <select
                    value={bankCode}
                    onChange={(e) => {
                        const code = e.target.value;
                        const name = BANKS.find(b => b.code === code)?.name || '';
                        onBankChange(code, name);
                    }}
                    style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--brand-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '15px',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option value="" disabled>Select Bank</option>
                    {BANKS.map(bank => (
                        <option key={bank.code} value={bank.code}>
                            {bank.name}
                        </option>
                    ))}
                </select>
            </div>

            <Input
                label="Account Number"
                placeholder="0123456789"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => onAccountChange(e.target.value.replace(/\D/g, ''))}
                error={error}
                disabled={!bankCode}
                rightIcon={
                    resolving ? <Loader2 size={16} className="animate-spin" /> :
                        resolvedName ? <CheckCircle2 color="var(--success)" size={16} /> : null
                }
            />

            {resolvedName && (
                <div style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(26, 140, 78, 0.1)',
                    border: '1px solid rgba(26, 140, 78, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--success)',
                    fontSize: '14px',
                    fontWeight: 600
                }}>
                    <CheckCircle2 size={18} />
                    {resolvedName}
                </div>
            )}
        </div>
    );
}
