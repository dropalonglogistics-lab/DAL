'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Clock, Star, Filter } from 'lucide-react';
import styles from './Shop.module.css';
import Navbar from '@/components/Navbar/Navbar';

// Mock Data
const BUSINESS = {
    name: "Mama Joy's Kitchen",
    type: "Restaurant",
    rating: 4.8,
    reviews: 124,
    address: "14 Woji Way, Port Harcourt",
    time: "30-45 min",
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200"
};

const CATEGORIES = ['All', 'Rice Dishes', 'Swallow', 'Proteins', 'Drinks'];

const PRODUCTS = [
    { id: '1', name: 'Jollof Rice & Turkey', price: 4500, category: 'Rice Dishes', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=600' },
    { id: '2', name: 'Yam Porridge (Special)', price: 3200, category: 'Swallow', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=600' },
    { id: '3', name: 'Fried Rice & Beef', price: 4000, category: 'Rice Dishes', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600' },
    { id: '4', name: 'Pounded Yam & Egusi', price: 5000, category: 'Swallow', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600' },
    { id: '5', name: 'Chilled Zobo (1L)', price: 1000, category: 'Drinks', image: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?auto=format&fit=crop&q=80&w=600' },
];

export default function ShopPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [activeCat, setActiveCat] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = PRODUCTS.filter(p =>
        (activeCat === 'All' || p.category === activeCat) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.pageWrap}>
            <Navbar />

            {/* Header Banner */}
            <div className={styles.coverBanner} style={{ backgroundImage: `url(${BUSINESS.coverImage})` }}>
                <div className={styles.coverOverlay} />
            </div>

            <main className={styles.mainContainer}>
                {/* Business Info */}
                <div className={styles.businessCard}>
                    <div className={styles.businessHeader}>
                        <h1 className={styles.businessName}>{BUSINESS.name}</h1>
                        <span className={styles.businessType}>{BUSINESS.type}</span>
                    </div>

                    <div className={styles.businessMeta}>
                        <div className={styles.metaItem}>
                            <Star size={16} className={styles.starIcon} />
                            <span>{BUSINESS.rating} ({BUSINESS.reviews}+)</span>
                        </div>
                        <div className={styles.metaItem}>
                            <MapPin size={16} />
                            <span>{BUSINESS.address}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <Clock size={16} />
                            <span>{BUSINESS.time}</span>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <button className={styles.filterBtn}>
                        <Filter size={18} /> Filters
                    </button>
                </div>

                {/* Categories */}
                <div className={styles.categories}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.catBtn} ${activeCat === cat ? styles.catActive : ''}`}
                            onClick={() => setActiveCat(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className={styles.productGrid}>
                    {filteredProducts.map(product => (
                        <Link href={`/shop/${slug}/${product.id}`} key={product.id} className={styles.productCard}>
                            <div className={styles.productImageWrap}>
                                <Image src={product.image} alt={product.name} width={400} height={300} placeholder="empty" className={styles.productImage} />
                            </div>
                            <div className={styles.productInfo}>
                                <h3 className={styles.productTitle}>{product.name}</h3>
                                <p className={styles.productPrice}>₦{product.price.toLocaleString()}</p>
                            </div>
                        </Link>
                    ))}

                    {filteredProducts.length === 0 && (
                        <div className={styles.noResults}>
                            <p>No items found matching your search.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
