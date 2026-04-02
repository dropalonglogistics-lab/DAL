'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    MapPin, 
    ArrowRight, MessageCircle 
} from 'lucide-react';
import CityGrid from '@/components/Visuals/CityGrid';
import styles from './page.module.css';

export default function HomePage() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const router = useRouter();
    
        const handleSearch = () => {
        if (!from && !to) return;
        router.push(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    };

    return (
        <div className={styles.container}>
            {/* SECTION 1 — HERO + SEARCH */}
            <section className={styles.heroSection}>
                <div className={styles.heroVisual}>
                    <CityGrid />
                </div>
                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>PORT HARCOURT&apos;S INTELLIGENCE LAYER</span>
                    <h1 className={styles.h1}>Move Smarter.<br />Deliver Faster.<br />Stress Less.</h1>
                    <p className={styles.subText}>
                        Intelligent road transit routing. Community-powered intelligence.
                        Fare estimates, live alerts, and real-time navigation — all free.
                    </p>
                </div>

                {/* Search Card — right side of hero */}
                <div className={styles.heroSearchCard}>
                    <h3 className={styles.heroSearchTitle}>Where to?</h3>
                    <div className={styles.inputGroup}>
                        <label>Starting point</label>
                        <input
                            className={styles.darkInput}
                            placeholder="e.g. Mile 1 Market"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Destination</label>
                        <input
                            className={styles.darkInput}
                            placeholder="e.g. Garrison Junction"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                    <button className={styles.findBtn} onClick={handleSearch}>Find Route</button>
                    <p className={styles.heroSearchVehicles}>
                        🛺 Keke &nbsp; 🚐 Keke Bus &nbsp; 🚌 Bus &nbsp; 🚕 Taxi &nbsp; 🏍️ Bike
                    </p>
                </div>
            </section>

            {/* SECTION 4 — FOR BUSINESSES */}
            <section className={styles.splitSection}>
                <div className={styles.splitGrid}>
                    <div>
                        <h2 className={styles.sectionTitle}>Your Digital Storefront.<br />PH-Wide Reach.</h2>
                        <p className={styles.subText} style={{ marginBottom: '32px' }}>List your business on DAL and access our fleet for deliveries, logistics, and visibility.</p>
                        <Link href="/list-your-business" className={styles.ctaGold} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            List Your Business Free <ArrowRight size={18} />
                        </Link>
                    </div>
                    </div>
                </div>
            </section>

                        {/* SECTION 7 — WHATSAPP STRIP */}
            <section className={styles.whatsappStrip}>
                <div>
                    <h3 className={styles.sectionTitle} style={{ fontSize: '24px', marginBottom: '8px' }}>DAL is also on WhatsApp</h3>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Access everything in one chat. <span style={{ color: 'var(--color-gold)', fontWeight: '700' }}>Full access — Premium feature.</span></p>
                </div>
                <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                    <MessageCircle size={24} fill="currentColor" /> Chat Now
                </a>
            </section>
        </div>
    );
}
