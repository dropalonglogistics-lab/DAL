'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
    MapPin, AlertTriangle, Users, 
    ArrowRight, Box, ShoppingCart, 
    Check, Zap, MessageCircle, Star,
    Search, Loader2
} from 'lucide-react';

export default function HomePage() {
    const [counts, setCounts] = useState({ routeCount: 0, alertCount: 0, memberCount: 0 });
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [searchError, setSearchError] = useState('');
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [waitlistStatus, setWaitlistStatus] = useState<{ type: 'success' | 'error' | 'duplicate' | null, message: string }>({ type: null, message: '' });
    const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const { count: routeCount } = await supabase
                    .from('routes')
                    .select('*', { count: 'exact', head: true });

                const { count: alertCount } = await supabase
                    .from('alerts')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'active');

                const { count: memberCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                setCounts({ 
                    routeCount: routeCount || 0, 
                    alertCount: alertCount || 0, 
                    memberCount: memberCount || 0 
                });
            } catch (error) {
                console.error('Error fetching Supabase counts:', error);
            }
        };

        fetchCounts();
    }, [supabase]);

    const handleRouteSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!origin || !destination) {
            setSearchError('Please enter both a starting point and destination.');
            return;
        }
        setSearchError('');
        router.push(`/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
    };

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!waitlistEmail) return;
        
        setIsSubmittingWaitlist(true);
        setWaitlistStatus({ type: null, message: '' });

        try {
            const { error } = await supabase
                .from('waitlist')
                .insert([{ email: waitlistEmail }]);

            if (error) {
                if (error.code === '23505') {
                    setWaitlistStatus({ type: 'duplicate', message: "You're already on the list!" });
                } else {
                    setWaitlistStatus({ type: 'error', message: 'Something went wrong. Try again.' });
                }
            } else {
                setWaitlistStatus({ type: 'success', message: "You're on the list. We'll reach out first." });
                setWaitlistEmail('');
            }
        } catch (err) {
            setWaitlistStatus({ type: 'error', message: 'Something went wrong. Try again.' });
        } finally {
            setIsSubmittingWaitlist(false);
        }
    };

    return (
        <main className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-300">
            {/* SECTION A: HERO */}
            <section className="relative min-h-[80vh] lg:min-h-screen flex flex-col items-center justify-center py-20 px-6 overflow-hidden">
                {/* Radial Gradient Background */}
                <div className="absolute inset-0 z-0 pointer-events-none
                    dark:bg-[radial-gradient(circle_at_center,#111118_0%,#0A0A0F_100%)]
                    bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#F4F4F5_100%)]" />

                <div className="relative z-10 max-w-[760px] w-full flex flex-col items-center text-center">
                    {/* OVERLINE BADGE */}
                    <span className="mb-6 px-4 py-1.5 rounded-full border font-body text-xs font-semibold tracking-widest uppercase transition-colors
                        dark:bg-accent-subtle dark:border-[#D4A84340] dark:text-accent
                        bg-accent-subtle border-[#D4A84340] text-accent">
                        PORT HARCOURT · RIVERS STATE · NIGERIA
                    </span>

                    {/* HEADLINE (H1) */}
                    <h1 className="mb-6 font-heading font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight max-w-[680px]">
                        The <span className="text-accent">Intelligence</span> Layer That Moves Port Harcourt.
                    </h1>

                    {/* SUBHEADLINE (P) */}
                    <p className="mb-10 font-body text-lg sm:text-xl text-text-secondary max-w-[560px]">
                        Real-time routes, same-hour delivery, and community-powered road intelligence — built from the ground up in Port Harcourt.
                    </p>

                    {/* CTA BUTTONS */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/search" className="px-6 py-3 rounded-lg font-body font-semibold text-sm transition-all duration-200 shadow-lg hover:brightness-110 active:scale-95
                            bg-accent text-[#09090B]">
                            Search Routes Now
                        </Link>
                        <a href="#how-it-works" className="px-6 py-3 rounded-lg border font-body font-medium text-sm transition-all duration-200
                            dark:border-border dark:text-text-secondary dark:hover:border-accent dark:hover:text-accent
                            border-border text-text-secondary hover:border-accent hover:text-accent">
                            How It Works
                        </a>
                    </div>
                </div>
            </section>

            {/* SECTION B: LIVE DATA STRIP */}
            <section className="full-width bg-bg-secondary border-y border-border py-5 px-6 transition-colors">
                <div className="max-w-6xl mx-auto flex flex-row flex-wrap justify-center items-center gap-8 sm:gap-16">
                    {/* Stat 1 */}
                    <div className="flex flex-col items-center">
                        <span className="font-heading font-bold text-2xl sm:text-3xl text-text-primary">
                            {counts.routeCount.toLocaleString()}+
                        </span>
                        <span className="font-body text-[10px] sm:text-xs text-text-muted uppercase tracking-widest mt-1">
                            Mapped Routes
                        </span>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-border" />

                    {/* Stat 2 */}
                    <div className="flex flex-col items-center">
                        <span className="font-heading font-bold text-2xl sm:text-3xl text-text-primary">
                            Rivers State
                        </span>
                        <span className="font-body text-[10px] sm:text-xs text-text-muted uppercase tracking-widest mt-1">
                            Coverage Area
                        </span>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-border" />

                    {/* Stat 3 */}
                    <div className="flex flex-col items-center">
                        <span className="font-heading font-bold text-2xl sm:text-3xl text-text-primary text-accent">
                            {counts.alertCount}
                        </span>
                        <span className="font-body text-[10px] sm:text-xs text-text-muted uppercase tracking-widest mt-1">
                            Active Alerts
                        </span>
                    </div>
                </div>
            </section>

            {/* SECTION C: F1 ROUTING FEATURE BLOCK */}
            <section className="py-20 px-6 max-w-6xl mx-auto">
                <div className="mb-10">
                    <span className="inline-block mb-4 px-4 py-1.5 rounded-full border font-body text-[10px] font-bold tracking-widest uppercase
                        dark:bg-[#22C55E15] dark:border-[#22C55E40] dark:text-[#22C55E]
                        bg-[#16A34A15] border-[#16A34A40] text-[#16A34A]">
                        LIVE NOW
                    </span>
                    <h2 className="font-heading font-bold text-3xl sm:text-4xl text-text-primary mb-4 leading-tight">
                        Find Your Route Across Port Harcourt
                    </h2>
                    <p className="font-body text-base text-text-secondary max-w-[520px]">
                        Keke, Taxi, Shuttle, Bus, Bike — every route mapped, every fare estimated. Search once, move smarter every day.
                    </p>
                </div>

                <div className="bg-bg-secondary border border-border rounded-2xl p-6 sm:p-8 shadow-sm transition-colors overflow-hidden">
                    <form onSubmit={handleRouteSearch} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                        <div className="w-full space-y-2">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider pl-1">Starting point</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="e.g. Rumuola"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-accent-subtle transition-all
                                        bg-bg-primary border-border text-text-primary placeholder:text-text-muted focus:border-accent"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full space-y-2">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider pl-1">Destination</label>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="e.g. Mile 1 Market"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-accent-subtle transition-all
                                        bg-bg-primary border-border text-text-primary placeholder:text-text-muted focus:border-accent"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full md:w-auto h-[46px] px-8 rounded-xl bg-accent hover:brightness-110 active:scale-95 transition-all
                            text-[#09090B] font-bold text-sm shadow-md flex items-center justify-center gap-2">
                            Find Route <ArrowRight size={16} />
                        </button>
                    </form>
                    
                    {searchError && (
                        <p className="mt-4 text-xs font-semibold text-red-500 animate-pulse underline decoration-red-500/30 underline-offset-4">
                            {searchError}
                        </p>
                    )}

                    <div className="mt-8 pt-8 border-t border-border/50">
                        <div className="flex flex-wrap gap-2">
                            {["🛺 Keke", "🚕 Taxi", "🚌 Shuttle", "🚐 Bus", "🏍 Bike"].map(tag => (
                                <span key={tag} className="px-3 py-1.5 rounded-full border font-body text-xs font-medium transition-colors
                                    dark:bg-bg-elevated dark:text-text-secondary dark:border-border
                                    bg-bg-elevated text-text-secondary border-border">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION D: HOW IT WORKS */}
            <section id="how-it-works" className="py-24 px-6 transition-colors bg-bg-primary">
                <div className="max-w-6xl mx-auto">
                    <span className="mb-4 px-4 py-1.5 rounded-full border border-accent/30 bg-accent-subtle text-accent font-body text-[10px] font-bold tracking-widest uppercase">
                        HOW IT WORKS
                    </span>
                    <h2 className="mt-3 mb-16 font-heading font-bold text-3xl sm:text-4xl text-text-primary">
                        Three steps. That&apos;s all.
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Search Your Route", desc: "Enter your starting point and destination. DAL matches you to the best transport options across Port Harcourt — with live fare estimates." },
                            { step: "02", title: "Navigate With Intelligence", desc: "Get real-time road alerts reported by your community. Know before you go — which roads are clear, which are flooded, which to avoid." },
                            { step: "03", title: "Report. Earn. Repeat.", desc: "Every alert you submit earns you DAL points. The more you contribute, the more the platform improves for everyone in your city." }
                        ].map((item, i) => (
                            <div key={i} className="bg-bg-secondary border border-border rounded-2xl p-8 shadow-sm group hover:border-accent/40 transition-all">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm mb-6
                                    dark:bg-accent-subtle dark:text-accent
                                    bg-accent-subtle text-accent">
                                    {item.step}
                                </div>
                                <h3 className="font-heading font-semibold text-xl text-text-primary mb-3">
                                    {item.title}
                                </h3>
                                <p className="font-body text-sm text-text-secondary leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION E: FOUNDER VOICE */}
            <section className="py-24 px-6 bg-bg-secondary transition-colors">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                    <span className="mb-6 px-4 py-1.5 rounded-full border border-accent/30 bg-accent-subtle text-accent font-body text-[10px] font-bold tracking-widest uppercase">
                        WHY WE BUILT THIS
                    </span>
                    <blockquote className="mt-6 mb-8 font-heading font-medium text-xl sm:text-2xl italic leading-relaxed text-text-primary max-w-[680px]">
                        &quot;Port Harcourt&apos;s roads are impossible to navigate without local knowledge. Millions of people move through this city every day on routes that have never been properly mapped. DAL is changing that — one route at a time.&quot;
                    </blockquote>
                    <p className="font-body text-sm text-text-secondary">
                        — Bel, Founder & CEO, Drop Along Logistics
                    </p>
                </div>
            </section>

            {/* SECTION F: PREMIUM UPGRADE */}
            <section className="py-24 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <span className="mb-4 px-4 py-1.5 rounded-full border border-accent/30 bg-accent-subtle text-accent font-body text-[10px] font-bold tracking-widest uppercase">
                        DAL PREMIUM
                    </span>
                    <h2 className="mt-3 mb-4 font-heading font-bold text-3xl sm:text-4xl text-text-primary">
                        Unlock the Full Intelligence Layer
                    </h2>
                    <p className="font-body text-lg text-text-secondary">
                        Everything DAL offers, with no limits. ₦700/month.
                    </p>
                </div>

                <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-sm transition-colors">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-bg-elevated border-b border-border">
                                <th className="px-6 py-4 text-left font-body font-semibold text-sm text-text-primary">Feature</th>
                                <th className="px-6 py-4 text-center font-body font-semibold text-sm text-text-primary">Free</th>
                                <th className="px-6 py-4 text-center font-body font-semibold text-sm text-accent">Premium</th>
                            </tr>
                        </thead>
                        <tbody className="font-body text-sm divide-y divide-border/30">
                            {[
                                { name: "Route Search", free: "Basic", premium: "Priority Results", isCheck: true },
                                { name: "Road Intelligence", free: "3 per day", premium: "Unlimited" },
                                { name: "Road Alerts", free: "View Only", premium: "Post + View" },
                                { name: "WhatsApp Bot", free: "—", premium: "Full Access" },
                                { name: "Earning Multiplier", free: "1×", premium: "1.5×" },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-bg-elevated/20 transition-colors">
                                    <td className="px-6 py-4 text-text-secondary font-medium tracking-wide">{row.name}</td>
                                    <td className="px-6 py-4 text-center text-text-muted">{row.isCheck && <span className="mr-1">✓</span>}{row.free}</td>
                                    <td className="px-6 py-4 text-center text-[#22C55E] font-bold">{row.premium}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center mt-8">
                    <Link href="/premium" className="w-full max-w-xs text-center px-6 py-4 rounded-xl font-body font-bold text-sm transition-all duration-200 shadow-lg hover:brightness-110 active:scale-95
                        bg-accent text-[#09090B]">
                        Get Premium — ₦700/month
                    </Link>
                </div>
            </section>

            {/* SECTION G: COMING SOON STRIP */}
            <section className="py-20 px-6 border-t border-border
                dark:bg-gradient-to-b dark:from-bg-secondary dark:to-[#1A1A24]
                bg-gradient-to-b from-[#F4F4F5] to-bg-primary transition-colors">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                    <h2 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary max-w-[580px] mb-4">
                        Express delivery and personal shopping are coming to Port Harcourt.
                    </h2>
                    <p className="font-body text-base text-text-secondary max-w-[480px] mb-8">
                        F2 Express and F3 Shopper — same-hour delivery and personal shopping powered by DAL&apos;s growing city network. Be the first to know.
                    </p>

                    {waitlistStatus.type === 'success' ? (
                        <div className="flex items-center gap-2 text-[#22C55E] bg-[#22C55E10] px-6 py-3 rounded-xl border border-[#22C55E20] animate-bounce-short">
                            <Check size={20} />
                            <span className="font-body font-semibold">{waitlistStatus.message}</span>
                        </div>
                    ) : (
                        <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-md">
                            <input
                                type="email"
                                placeholder="Your email address"
                                required
                                className="px-4 py-3 rounded-lg border font-body text-sm w-full focus:outline-none focus:ring-2 focus:ring-accent-subtle transition-all
                                    dark:bg-[#0A0A0F] dark:border-border dark:text-text-primary dark:placeholder:text-text-muted dark:focus:border-accent
                                    bg-white border-border text-text-primary placeholder:text-text-muted focus:border-accent"
                                value={waitlistEmail}
                                onChange={(e) => setWaitlistEmail(e.target.value)}
                            />
                            <button 
                                type="submit" 
                                disabled={isSubmittingWaitlist}
                                className="px-6 py-3 rounded-lg bg-accent text-[#09090B] font-body font-bold text-sm whitespace-nowrap hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmittingWaitlist ? <Loader2 className="animate-spin" size={18} /> : "Join Waitlist"}
                            </button>
                        </form>
                    )}
                    
                    {waitlistStatus.type && waitlistStatus.type !== 'success' && (
                        <p className={`mt-4 text-xs font-semibold ${waitlistStatus.type === 'duplicate' ? 'text-text-muted' : 'text-red-500'}`}>
                            {waitlistStatus.message}
                        </p>
                    )}
                </div>
            </section>

            {/* SECTION H: FOOTER LOGO STRIP / WHATSAPP NOTICE */}
            <section className="py-8 px-6 text-center border-t border-border/30 opacity-70">
                <p className="font-body text-xs text-text-muted">
                    WhatsApp Bot — Premium Feature. Unlock at <Link href="/premium" className="text-accent underline decoration-accent/30 underline-offset-4">/premium</Link>
                </p>
            </section>
        </main>
    );
}

// Add a simple animation to globals.css if needed, but let's stick to standard Tailwind for now.
