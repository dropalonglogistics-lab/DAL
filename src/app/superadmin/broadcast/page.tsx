'use client';

import { useState } from 'react';
import { Megaphone, Mail, MessageCircle, Bell, History, Send, Users } from 'lucide-react';
import styles from './Broadcast.module.css';

const TARGETS = [
    'All Users', 'Premium Users', 'Riders', 'Errand Workers',
    'Drivers', 'Businesses', 'F2 Express Waitlist', 'F3 Shopper Waitlist', 'Custom Segment'
];

const CHANNELS = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'push', label: 'Push', icon: Bell },
    { id: 'all', label: 'All Channels', icon: Send },
];

const RECIPIENT_COUNTS: Record<string, number> = {
    'All Users': 12483, 'Premium Users': 2410, 'Riders': 384, 'Errand Workers': 201,
    'Drivers': 1280, 'Businesses': 97, 'F2 Express Waitlist': 1245, 'F3 Shopper Waitlist': 802,
    'Custom Segment': 0,
};

const HISTORY = [
    { id: 1, title: 'Welcome to DAL 2.0!', target: 'All Users', channels: 'Email + Push', recipients: 10421, date: '2026-03-10' },
    { id: 2, title: 'Your Premium trial is ending', target: 'Premium Users', channels: 'Email', recipients: 340, date: '2026-03-08' },
    { id: 3, title: 'New ride-share feature live', target: 'Riders', channels: 'WhatsApp + Push', recipients: 376, date: '2026-03-05' },
];

export default function BroadcastPage() {
    const [target, setTarget] = useState('All Users');
    const [channels, setChannels] = useState<string[]>(['email']);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [scheduleNow, setScheduleNow] = useState(true);
    const [scheduledAt, setScheduledAt] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const toggleChannel = (id: string) => {
        if (id === 'all') { setChannels(['email', 'whatsapp', 'push']); return; }
        setChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };

    const handleSend = () => {
        if (!title || !body) return alert('Please fill in the message title and body.');
        setShowConfirm(true);
    };

    const confirmSend = () => {
        setShowConfirm(false);
        alert(`Broadcast sent to ${RECIPIENT_COUNTS[target].toLocaleString()} ${target}!`);
        setTitle('');
        setBody('');
        setChannels(['email']);
    };

    const MAX_CHARS = 500;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Broadcast Center</h1>
                <p className={styles.subtitle}>Send targeted messages to any user segment across all channels.</p>
            </div>

            <div className={styles.layout}>
                {/* Compose Panel */}
                <div className={styles.composeCard}>
                    <div className={styles.composeHeader}>
                        <Megaphone size={20} /> Compose Message
                    </div>
                    <div className={styles.composeBody}>
                        {/* Target */}
                        <div className={styles.formGroup}>
                            <label>Target Audience</label>
                            <select className={styles.select} value={target} onChange={e => setTarget(e.target.value)}>
                                {TARGETS.map(t => (
                                    <option key={t} value={t}>{t} {RECIPIENT_COUNTS[t] ? `(${RECIPIENT_COUNTS[t].toLocaleString()})` : ''}</option>
                                ))}
                            </select>
                        </div>

                        {/* Channels */}
                        <div className={styles.formGroup}>
                            <label>Delivery Channels</label>
                            <div className={styles.channelGroup}>
                                {CHANNELS.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        className={`${styles.channelBtn} ${channels.includes(id) || (id === 'all' && channels.length === 3) ? styles.active : ''}`}
                                        onClick={() => toggleChannel(id)}
                                    >
                                        <Icon size={14} /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div className={styles.formGroup}>
                            <label>Message Title</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="e.g. DAL Express is now LIVE!"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Body */}
                        <div className={styles.formGroup}>
                            <label>Message Body <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(500 char max for WhatsApp)</span></label>
                            <div className={styles.textareaWrap}>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Write your announcement here..."
                                    value={body}
                                    maxLength={MAX_CHARS}
                                    onChange={e => setBody(e.target.value)}
                                />
                                <div className={styles.charCount} style={{ color: body.length > 450 ? 'var(--color-warning)' : undefined }}>
                                    {body.length} / {MAX_CHARS}
                                </div>
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className={styles.formGroup}>
                            <label>Schedule</label>
                            <div className={styles.scheduleRow}>
                                <div className={styles.radioGroup}>
                                    <label className={styles.radioLabel}>
                                        <input type="radio" checked={scheduleNow} onChange={() => setScheduleNow(true)} />
                                        Send Now
                                    </label>
                                    <label className={styles.radioLabel}>
                                        <input type="radio" checked={!scheduleNow} onChange={() => setScheduleNow(false)} />
                                        Schedule
                                    </label>
                                </div>
                                {!scheduleNow && (
                                    <input
                                        type="datetime-local"
                                        className={styles.dateTimeInput}
                                        value={scheduledAt}
                                        onChange={e => setScheduledAt(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.formActions}>
                            <button className={styles.previewBtn} onClick={() => alert(`PREVIEW\n\nTitle: ${title}\n\nBody: ${body}\n\nTo: ${target} (${RECIPIENT_COUNTS[target]} recipients)`)}>
                                Preview
                            </button>
                            <button className={styles.sendBtn} onClick={handleSend}>
                                <Send size={16} /> {scheduleNow ? 'Send Now' : 'Schedule Blast'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sent History */}
                <div className={styles.historyCard}>
                    <div className={styles.historyHeader}>
                        <History size={18} /> Sent History
                    </div>
                    {HISTORY.map(item => (
                        <div key={item.id} className={styles.historyItem}>
                            <div className={styles.historyTitle}>{item.title}</div>
                            <div className={styles.historyMeta}>
                                <span><Users size={12} /> {item.recipients.toLocaleString()}</span>
                                <span>{item.channels}</span>
                                <span>{item.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>📡 Confirm Broadcast</h2>
                        <p>You are about to send <strong>"{title}"</strong> via <strong>{channels.join(', ')}</strong> to:</p>
                        <div className={styles.recipientCount}>
                            {RECIPIENT_COUNTS[target].toLocaleString()} {target}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {scheduleNow ? 'This will be sent immediately.' : `Scheduled for: ${scheduledAt}`}
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowConfirm(false)}>Go Back</button>
                            <button className={styles.confirmSendBtn} onClick={confirmSend}>Confirm & Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
