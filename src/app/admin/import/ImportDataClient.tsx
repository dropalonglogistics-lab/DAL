'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileJson, FileSpreadsheet, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';
import styles from '../admin.module.css';

interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
}

export default function ImportDataClient() {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (f: File) => {
        setFile(f);
        setResult(null);
        setError(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/import-routes', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Import failed');
            } else {
                setResult(data);
            }
        } catch (err: any) {
            setError(err.message || 'Unexpected error');
        } finally {
            setImporting(false);
        }
    };

    const isJson = file?.name.endsWith('.json');
    const isCsv = file?.name.endsWith('.csv');

    return (
        <div className="animate-fade-in">
            <h1 className={styles.title}>Import Route Data</h1>
            <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
                Bulk-upload routes in CSV or JSON format. Imported routes are saved as <strong>approved</strong> and appear immediately in search.
            </p>

            {/* Format Guide */}
            <div className={styles.card} style={{ marginBottom: '28px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Expected Format</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-gold)' }}>
                            <FileJson size={16} /> <strong>JSON</strong>
                        </div>
                        <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.75rem', overflowX: 'auto', color: 'var(--text-secondary)' }}>{`[
  {
    "origin": "Mile 1",
    "destination": "Rumuola",
    "vehicle_type": "Keke",
    "duration_minutes": 20,
    "price_estimated": 200
  }
]`}</pre>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-gold)' }}>
                            <FileSpreadsheet size={16} /> <strong>CSV</strong>
                        </div>
                        <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.75rem', overflowX: 'auto', color: 'var(--text-secondary)' }}>{`origin,destination,vehicle_type,duration_minutes,price_estimated
Mile 1,Rumuola,Keke,20,200
Choba,UNIPORT,Bus,30,150`}</pre>
                    </div>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                className={styles.card}
                style={{
                    border: `2px dashed ${dragOver ? 'var(--color-gold)' : 'var(--border)'}`,
                    background: dragOver ? 'rgba(212,175,55,0.05)' : undefined,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    textAlign: 'center',
                    padding: '48px 24px',
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
            >
                <input
                    ref={fileRef}
                    type="file"
                    accept=".json,.csv"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {file ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        {isJson ? <FileJson size={28} color="var(--color-gold)" /> : <FileSpreadsheet size={28} color="var(--color-gold)" />}
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 700 }}>{file.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {(file.size / 1024).toFixed(1)} KB · {isJson ? 'JSON' : 'CSV'}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <>
                        <UploadCloud size={40} color="var(--text-secondary)" style={{ marginBottom: '12px' }} />
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            <strong>Click to upload</strong> or drag & drop<br />
                            <span style={{ fontSize: '0.85rem' }}>JSON or CSV files accepted</span>
                        </p>
                    </>
                )}
            </div>

            {/* Import Button */}
            {file && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        className={styles.saveBtn}
                        onClick={handleImport}
                        disabled={importing}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', width: 'auto' }}
                    >
                        {importing ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Importing...</> : <><UploadCloud size={16} /> Import Routes</>}
                    </button>
                </div>
            )}

            {/* Results */}
            {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px', marginTop: '20px', color: '#EF4444' }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}
            {result && (
                <div style={{ marginTop: '20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <CheckCircle size={20} color="#22C55E" />
                        <strong>Import Complete</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem' }}>
                        <span>✅ <strong>{result.success}</strong> routes imported</span>
                        {result.failed > 0 && <span>❌ <strong>{result.failed}</strong> failed</span>}
                    </div>
                    {result.errors.length > 0 && (
                        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {result.errors.map((e, i) => <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid var(--border)' }}>• {e}</div>)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
