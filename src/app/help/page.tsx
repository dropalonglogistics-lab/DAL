'use client';

import { useState } from 'react';
import styles from '@/app/content-pages.module.css';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

const FAQ_ITEMS = [
    {
        question: 'How do I earn community points?',
        answer: 'You earn points by contributing to the DAL Intelligence Layer. Suggesting a new route (10 pts), reporting a road alert (5 pts), or participating in verification (2 pts). Points determine your rank on the Monthly Leaderboard.'
    },
    {
        question: 'Is DAL a ride-hailing app?',
        answer: 'Not in the traditional sense. DAL is an Intelligence Layer. While our F2 Express Delivery service uses our own riders, our F1 Route Search empowers you to use the existing informal transit network (Keke, Bus, Taxi) more efficiently.'
    },
    {
        question: 'What does "Verified" mean?',
        answer: 'A "Verified" badge on a route or alert means it has been cross-referenced by our community moderators or confirmed by multiple independent user reports within a short timeframe.'
    },
    {
        question: 'How do I report a false alert?',
        answer: 'If you see an alert that is no longer accurate, click the "Clear" or "Flag" button on the alert card. Our system uses these reports to maintain real-time accuracy for everyone.'
    }
];

function AccordionItem({ item }: { item: typeof FAQ_ITEMS[0] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div 
            style={{ 
                borderBottom: '0.5px solid #1E1E1E', 
                padding: '20px 0',
                cursor: 'pointer'
            }}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: isOpen ? '#C9A227' : '#FFFFFF' }}>
                    {item.question}
                </h3>
                {isOpen ? <ChevronUp size={18} color="#C9A227" /> : <ChevronDown size={18} color="#555" />}
            </div>
            {isOpen && (
                <p style={{ marginTop: '12px', fontSize: '14px', color: '#666666', lineHeight: 1.6 }}>
                    {item.answer}
                </p>
            )}
        </div>
    );
}

export default function HelpPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Help Center</h1>
            <span className={styles.lastUpdated}>Everything you need to know about DAL.</span>
            
            <div className={styles.content}>
                <div style={{ marginTop: '40px' }}>
                    {FAQ_ITEMS.map((item, i) => (
                        <AccordionItem key={i} item={item} />
                    ))}
                </div>

                <div style={{ marginTop: '80px', padding: '40px 32px', background: '#111111', border: '0.5px solid #1E1E1E', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(201, 162, 39, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <MessageCircle size={24} color="#C9A227" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Still have questions?</h3>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>Our support team is active on WhatsApp and Email 24/7.</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="/contact" style={{ background: '#C9A227', color: '#0D0D0D', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>Contact Support</a>
                        <a href="https://wa.me/2348000000000" style={{ border: '0.5px solid #333', color: '#FFFFFF', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>Chat on WhatsApp</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
