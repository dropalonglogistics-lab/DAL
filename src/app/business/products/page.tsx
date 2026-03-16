'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Search, Filter, Image as ImageIcon, X, Package } from 'lucide-react';
import styles from './Products.module.css';

export default function BusinessProductsPage() {
    const [products, setProducts] = useState([
        { id: 1, name: 'Spicy Chicken Burger', price: 3500, compareAt: 4000 as number | null, stock: true, delivery: true, image: null as string | null },
        { id: 2, name: 'Yam Porridge (Special)', price: 2800, compareAt: null as number | null, stock: true, delivery: true, image: null as string | null },
        { id: 3, name: 'Chilled Zobo Drink (1L)', price: 1000, compareAt: null as number | null, stock: false, delivery: true, image: null as string | null },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        compareAt: '',
        inStock: true,
        deliveryEligible: true,
        images: [] as string[] // mock base64/urls
    });

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const newProduct = {
            id: Date.now(),
            name: formData.name,
            price: Number(formData.price),
            compareAt: formData.compareAt ? Number(formData.compareAt) : null,
            stock: formData.inStock,
            delivery: formData.deliveryEligible,
            image: formData.images[0] || null
        };
        setProducts([newProduct, ...products]);
        setIsAddModalOpen(false);
        setFormData({ name: '', description: '', price: '', compareAt: '', inStock: true, deliveryEligible: true, images: [] });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>My Products</h1>
                    <p className={styles.subtitle}>Manage your menu, catalogue, and inventory.</p>
                </div>
                <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <button className={styles.filterBtn}>
                    <Filter size={18} /> Filter
                </button>
            </div>

            {filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrap}>
                        <Package size={32} className={styles.emptyIcon} />
                    </div>
                    <h3>No products found</h3>
                    <p>Get started by adding your first product.</p>
                </div>
            ) : (
                <div className={styles.productGrid}>
                    {filteredProducts.map(product => (
                        <div key={product.id} className={styles.productCard}>
                            <div className={styles.productImageWrap}>
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className={styles.productImage} />
                                ) : (
                                    <div className={styles.productImagePlaceholder}>
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                                {!product.stock && <div className={styles.outOfStockBadge}>Out of Stock</div>}
                            </div>
                            <div className={styles.productInfo}>
                                <div className={styles.productHeader}>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                    <button className={styles.moreBtn}><MoreVertical size={16} /></button>
                                </div>
                                <div className={styles.productPricing}>
                                    <span className={styles.price}>₦{product.price.toLocaleString()}</span>
                                    {product.compareAt && (
                                        <span className={styles.comparePrice}>₦{product.compareAt.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className={styles.productTags}>
                                    <span className={`${styles.tag} ${product.stock ? styles.tagSuccess : styles.tagDanger}`}>
                                        {product.stock ? 'In Stock' : 'Unavailable'}
                                    </span>
                                    {product.delivery && <span className={styles.tag}>Delivery Eligible</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Add New Product</h2>
                            <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form className={styles.modalForm} onSubmit={handleSaveProduct}>
                            <div className={styles.formScroll}>
                                <div className={styles.inputGroup}>
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Signature Burger"
                                        value={formData.name}
                                        onChange={e => updateForm('name', e.target.value)}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Brief description of the product..."
                                        value={formData.description}
                                        onChange={e => updateForm('description', e.target.value)}
                                    />
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label>Price (₦)</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={e => updateForm('price', e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Compare-at Price (₦) <span className={styles.optional}>(Optional)</span></label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.compareAt}
                                            onChange={e => updateForm('compareAt', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Product Images</label>
                                    <div className={styles.imageUploadGrid}>
                                        {formData.images.map((img, i) => (
                                            <div key={i} className={styles.uploadedImagePreview}>
                                                <img src={img} alt="Product preview" />
                                            </div>
                                        ))}
                                        <label className={styles.uploadBox}>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                                            <Plus size={24} />
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.togglesGroup}>
                                    <label className={styles.toggleRow}>
                                        <div>
                                            <span className={styles.toggleLabel}>In Stock</span>
                                            <p className={styles.toggleDesc}>Show product as available for purchase</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className={styles.toggleInput}
                                            checked={formData.inStock}
                                            onChange={e => updateForm('inStock', e.target.checked)}
                                        />
                                    </label>

                                    <div className={styles.divider} />

                                    <label className={styles.toggleRow}>
                                        <div>
                                            <span className={styles.toggleLabel}>Eligible for Delivery</span>
                                            <p className={styles.toggleDesc}>Can our riders deliver this item?</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className={styles.toggleInput}
                                            checked={formData.deliveryEligible}
                                            onChange={e => updateForm('deliveryEligible', e.target.checked)}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.btnCancel} onClick={() => setIsAddModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.btnSave}>
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
