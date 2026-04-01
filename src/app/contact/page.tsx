'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import styles from '@/app/content-pages.module.css';
import { Mail, MapPin, AtSign, CheckCircle } from 'lucide-react';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('General Inquiry');
    const [message, setMessage] = useState('');
    
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorText, setErrorText] = useState('');

    const supabase = createClient();

    const handleSubmit = async () => {
        if (!name || !email || !message) {
            setStatus('error');
            setErrorText('Please fill in all required fields.');
            return;
        }

        setStatus('loading');
        try {
            const { error } = await supabase
                .from('contact_submissions')
                .insert([{ name, email, subject, message }]);

            if (error) throw error;

            setStatus('success');
        } catch (err: any) {
            console.error('Contact error:', err);
            setStatus('error');
            setErrorText(err.message || 'Something went wrong. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <div className={styles.container}>
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle size={32} color="#4CAF50" />
                    </div>
                    <h1 className={styles.title}>Message Received</h1>
                    <p style={{ color: '#666', fontSize: '14px', maxWidth: '400px', margin: '0 auto 30px' }}>
                        Thank you for reaching out. A member of the DAL team will review your message and get back to you within 24 hours.
                    </p>
                    <button 
                        onClick={() => setStatus('idle')}
                        style={{ background: 'transparent', border: '0.5px solid #333', color: '#888', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Send another message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Get in Touch</h1>
            <span className={styles.lastUpdated}>We&apos;re here to help you move smarter.</span>
            
            <div className={styles.content}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', marginTop: '40px' }}>
                    
                    {/* FORM SECTION */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Full Name</label>
                            <input 
                                className={styles.input} 
                                style={{ background: '#1A1A1A', border: '0.5px solid #2A2A2A', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Email Address</label>
                            <input 
                                type="email"
                                className={styles.input} 
                                style={{ background: '#1A1A1A', border: '0.5px solid #2A2A2A', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Subject</label>
                            <select 
                                style={{ background: '#1A1A1A', border: '0.5px solid #2A2A2A', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            >
                                <option>General Inquiry</option>
                                <option>Support Request</option>
                                <option>Carrier Partnership</option>
                                <option>Report an Issue</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Message</label>
                            <textarea 
                                rows={5}
                                style={{ background: '#1A1A1A', border: '0.5px solid #2A2A2A', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'none' }}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        {status === 'error' && <p style={{ color: '#E57373', fontSize: '12px', margin: 0 }}>{errorText}</p>}

                        <button 
                            onClick={handleSubmit}
                            disabled={status === 'loading'}
                            style={{ background: '#C9A227', color: '#0D0D0D', padding: '14px', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                        >
                            {status === 'loading' ? 'Sending…' : 'Send Message'}
                        </button>
                    </div>

                    {/* CONTACT INFO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <Mail size={18} color="#C9A227" />
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Support Email</h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>hello@dropalonglogistics.com</p>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <MapPin size={18} color="#C9A227" />
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Office</h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Port Harcourt, Rivers State, Nigeria</p>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <AtSign size={18} color="#C9A227" />
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Social</h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>@dropalong on X and Instagram</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
