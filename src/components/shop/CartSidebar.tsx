'use client';

import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import styles from './CartSidebar.module.css';

interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
}

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    // In a real app we'd get items from a CartProvider context
    items?: CartItem[];
}

// Mock Data if none provided
const MOCK_ITEMS: CartItem[] = [
    {
        id: '1',
        name: 'Jollof Rice & Turkey',
        price: 4500,
        qty: 2,
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=150'
    },
    {
        id: '5',
        name: 'Chilled Zobo (1L)',
        price: 1000,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?w=150'
    }
];

export default function CartSidebar({ isOpen, onClose, items = MOCK_ITEMS }: CartSidebarProps) {

    // Mock handlers
    const updateQty = (id: string, delta: number) => {
        // Handle qty update
    };

    const removeItem = (id: string) => {
        // Handle remove
    };

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const deliveryFee = 1500; // Flat or calc
    const total = subtotal + deliveryFee;

    return (
        <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`}>
            <div className={styles.backdrop} onClick={onClose} />

            <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <ShoppingBag size={20} className={styles.bagIcon} />
                        <h2>Your Cart</h2>
                        <span className={styles.itemCount}>{items.length}</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIconWrap}>
                                <ShoppingBag size={32} />
                            </div>
                            <h3>Your cart is empty</h3>
                            <p>Looks like you haven't added anything yet.</p>
                            <button className={styles.startShoppingBtn} onClick={onClose}>
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className={styles.itemsList}>
                            {items.map(item => (
                                <div key={item.id} className={styles.cartItem}>
                                    <div className={styles.itemImageWrap}>
                                        <img src={item.image} alt={item.name} className={styles.itemImage} />
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <h4 className={styles.itemName}>{item.name}</h4>
                                        <div className={styles.itemMeta}>
                                            <span className={styles.itemPrice}>₦{item.price.toLocaleString()}</span>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <div className={styles.qtyBox}>
                                                <button className={styles.qtyBtn} onClick={() => updateQty(item.id, -1)}>
                                                    <Minus size={14} />
                                                </button>
                                                <span>{item.qty}</span>
                                                <button className={styles.qtyBtn} onClick={() => updateQty(item.id, 1)}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₦{subtotal.toLocaleString()}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery Fee</span>
                            <span>₦{deliveryFee.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span className={styles.totalValue}>₦{total.toLocaleString()}</span>
                        </div>

                        <button className={styles.checkoutBtn} onClick={() => alert('Proceeding to checkout...')}>
                            Proceed to Checkout • ₦{total.toLocaleString()}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
