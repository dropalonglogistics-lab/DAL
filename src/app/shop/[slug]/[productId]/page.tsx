'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ProductDetail.module.css';
import Navbar from '@/components/Navbar/Navbar';

const MOCK_PRODUCT = {
    id: '1',
    name: 'Jollof Rice & Turkey',
    businessName: "Mama Joy's Kitchen",
    price: 4500,
    description: "Our signature party jollof rice served with heavily spiced, double-fried turkey and a side of golden plantains. Cooked with authentic firewood flavor to give you the real Nigerian party experience.",
    images: [
        'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800'
    ]
};

export default function ProductDetailPage() {
    const router = useRouter();
    const [qty, setQty] = useState(1);
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    const nextImage = () => setCurrentImageIdx(i => (i + 1) % MOCK_PRODUCT.images.length);
    const prevImage = () => setCurrentImageIdx(i => (i - 1 + MOCK_PRODUCT.images.length) % MOCK_PRODUCT.images.length);

    const handleAddToCart = () => {
        // We'll just alert for now, in reality this would use a Cart Context
        alert(`Added ${qty}x ${MOCK_PRODUCT.name} to cart!`);
    };

    return (
        <div className={styles.pageWrap}>
            <Navbar />

            <main className={styles.mainContainer}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    <ArrowLeft size={20} /> Back to menu
                </button>

                <div className={styles.productLayout}>
                    {/* Image Carousel */}
                    <div className={styles.carouselSection}>
                        <div className={styles.mainImageWrap}>
                            <img
                                src={MOCK_PRODUCT.images[currentImageIdx]}
                                alt={MOCK_PRODUCT.name}
                                className={styles.mainImage}
                            />
                            {MOCK_PRODUCT.images.length > 1 && (
                                <>
                                    <button className={styles.carouselBtnLeft} onClick={prevImage}><ChevronLeft size={24} /></button>
                                    <button className={styles.carouselBtnRight} onClick={nextImage}><ChevronRight size={24} /></button>
                                    <div className={styles.carouselDots}>
                                        {MOCK_PRODUCT.images.map((_, i) => (
                                            <span key={i} className={`${styles.dot} ${i === currentImageIdx ? styles.dotActive : ''}`} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Details Info */}
                    <div className={styles.detailsSection}>
                        <div className={styles.businessBadge}>{MOCK_PRODUCT.businessName}</div>
                        <h1 className={styles.productTitle}>{MOCK_PRODUCT.name}</h1>
                        <p className={styles.productPrice}>₦{MOCK_PRODUCT.price.toLocaleString()}</p>

                        <div className={styles.descriptionBox}>
                            <p>{MOCK_PRODUCT.description}</p>
                        </div>

                        <div className={styles.actionSection}>
                            <div className={styles.qtySelector}>
                                <button
                                    className={styles.qtyBtn}
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    disabled={qty <= 1}
                                ><Minus size={18} /></button>
                                <span className={styles.qtyValue}>{qty}</span>
                                <button
                                    className={styles.qtyBtn}
                                    onClick={() => setQty(qty + 1)}
                                ><Plus size={18} /></button>
                            </div>

                            <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                                <ShoppingBag size={20} />
                                Add to Cart • ₦{(MOCK_PRODUCT.price * qty).toLocaleString()}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
