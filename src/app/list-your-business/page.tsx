'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    CheckCircle2, ArrowRight, Store, TrendingUp,
    ShieldCheck, Smartphone, MapPin, UploadCloud,
    CreditCard, Check
} from 'lucide-react';
import styles from './ListBusiness.module.css';

const BENEFITS = [
    {
        icon: Store,
        title: 'Reach More Customers',
        desc: 'Get discovered by thousands of active users looking for local products and services.'
    },
    {
        icon: TrendingUp,
        title: 'Grow Your Revenue',
        desc: 'Increase sales with our powerful delivery network and easy-to-use storefront.'
    },
    {
        icon: ShieldCheck,
        title: 'Secure Payments',
        desc: 'Fast, secure payouts directly to your bank account with easy tracking.'
    },
    {
        icon: Smartphone,
        title: 'Manage Anywhere',
        desc: 'Run your business on the go with our mobile-friendly merchant dashboard.'
    }
];

const CATEGORIES = ['Food', 'Fashion', 'Electronics', 'Health', 'Home', 'Auto', 'Laundry', 'Other'];
const PH_AREAS = ['GRA Phase 1-3', 'Peter Odili Road', 'Trans Amadi', 'D-Line', 'Diobu', 'Rumuola', 'Rumuigbo', 'Choba', 'Woji', 'Elelenwo'];

export default function ListBusinessPage() {
    const router = useRouter();
    const supabase = createClient();
    const [isApplying, setIsApplying] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1
        businessName: '',
        businessType: 'Products', /* Products, Services, Both */
        category: '',
        address: '',
        operatingAreas: [] as string[],
        openingTime: '09:00',
        closingTime: '17:00',
        // Step 2
        ownerName: '',
        phone: '',
        email: '',
        whatsapp: '',
        logoFile: null as File | null,
        logoPreview: '',
        galleryFiles: [] as File[],
        galleryPreviews: [] as string[],
        // Step 3
        deliveryZones: [] as string[],
        minOrder: '',
        fulfilmentTime: '30 mins',
        // Step 4
        accountName: '',
        accountNumber: '',
        bankName: '',
        termsAccepted: false
    });

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleAreaToggle = (area: string, field: 'operatingAreas' | 'deliveryZones') => {
        setFormData(prev => {
            const current = prev[field];
            const updated = current.includes(area)
                ? current.filter(a => a !== area)
                : [...current, area];
            return { ...prev, [field]: updated };
        });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            updateForm('logoFile', file);
            const reader = new FileReader();
            reader.onloadend = () => updateForm('logoPreview', reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, 3);
        updateForm('galleryFiles', files);

        const previews: string[] = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result as string);
                if (previews.length === files.length) {
                    updateForm('galleryPreviews', previews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock submission delay
        setTimeout(() => {
            setIsLoading(false);
            router.push('/business');
        }, 1500);
    };

    const renderLanding = () => (
        <div className={styles.landingWrap}>
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>Merchant Partnership</div>
                    <h1 className={styles.heroTitle}>Reach Every Customer in Port Harcourt.</h1>
                    <p className={styles.heroSubtitle}>
                        Join the fastest growing delivery network. Open your storefront,
                        manage orders, and expand your reach across the city.
                    </p>
                    <div className={styles.pricingCard}>
                        <div className={styles.pricingPrice}>Free for 3 months</div>
                        <div className={styles.pricingNote}>then from ₦5,000/month</div>
                    </div>
                    <button
                        className={styles.ctaButton}
                        onClick={() => setIsApplying(true)}
                    >
                        Start Your Application <ArrowRight size={18} />
                    </button>
                    <p className={styles.heroSmall}>Takes about 5 minutes to complete.</p>
                </div>
            </div>

            <div className={styles.benefitsSection}>
                <h2 className={styles.sectionTitle}>Why Partner with DAL?</h2>
                <div className={styles.benefitsGrid}>
                    {BENEFITS.map((benefit, i) => (
                        <div key={i} className={styles.benefitCard}>
                            <div className={styles.benefitIconWrap}>
                                <benefit.icon size={28} className={styles.benefitIcon} />
                            </div>
                            <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                            <p className={styles.benefitDesc}>{benefit.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFormStep1 = () => (
        <div className={styles.formStep}>
            <h2 className={styles.stepTitle}>Business Details</h2>
            <p className={styles.stepDesc}>Tell us about your business and what you offer.</p>

            <div className={styles.inputGroup}>
                <label>Business Name</label>
                <input
                    type="text"
                    placeholder="e.g. Genesis Fast Food"
                    value={formData.businessName}
                    onChange={e => updateForm('businessName', e.target.value)}
                    required
                />
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label>Business Type</label>
                    <select
                        value={formData.businessType}
                        onChange={e => updateForm('businessType', e.target.value)}
                    >
                        <option>Products</option>
                        <option>Services</option>
                        <option>Both</option>
                    </select>
                </div>
                <div className={styles.inputGroup}>
                    <label>Primary Category</label>
                    <select
                        value={formData.category}
                        onChange={e => updateForm('category', e.target.value)}
                        required
                    >
                        <option value="">Select a category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Physical Address</label>
                <input
                    type="text"
                    placeholder="Full street address in PH"
                    value={formData.address}
                    onChange={e => updateForm('address', e.target.value)}
                    required
                />
            </div>

            <div className={styles.inputGroup}>
                <label>Operating Areas</label>
                <div className={styles.chipGrid}>
                    {PH_AREAS.map(area => (
                        <button
                            key={area}
                            type="button"
                            className={`${styles.chip} ${formData.operatingAreas.includes(area) ? styles.chipActive : ''}`}
                            onClick={() => handleAreaToggle(area, 'operatingAreas')}
                        >
                            {area}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label>Opening Time</label>
                    <input
                        type="time"
                        value={formData.openingTime}
                        onChange={e => updateForm('openingTime', e.target.value)}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Closing Time</label>
                    <input
                        type="time"
                        value={formData.closingTime}
                        onChange={e => updateForm('closingTime', e.target.value)}
                        required
                    />
                </div>
            </div>
        </div>
    );

    const renderFormStep2 = () => (
        <div className={styles.formStep}>
            <h2 className={styles.stepTitle}>Contact & Media</h2>
            <p className={styles.stepDesc}>How can we reach you and how should your store look?</p>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label>Owner Full Name</label>
                    <input
                        type="text"
                        value={formData.ownerName}
                        onChange={e => updateForm('ownerName', e.target.value)}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Primary Phone</label>
                    <input
                        type="tel"
                        placeholder="e.g. 08012345678"
                        value={formData.phone}
                        onChange={e => updateForm('phone', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => updateForm('email', e.target.value)}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>WhatsApp Number</label>
                    <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={e => updateForm('whatsapp', e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Business Logo (min 400x400)</label>
                <div className={styles.uploadBox}>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className={styles.fileInput} id="logo-upload" />
                    <label htmlFor="logo-upload" className={styles.uploadLabel}>
                        {formData.logoPreview ? (
                            <img src={formData.logoPreview} alt="Logo preview" className={styles.logoPreviewImg} />
                        ) : (
                            <>
                                <UploadCloud size={32} className={styles.uploadIcon} />
                                <span>Click to upload logo</span>
                            </>
                        )}
                    </label>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Gallery Photos (Max 3)</label>
                <div className={styles.uploadBox}>
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className={styles.fileInput} id="gallery-upload" />
                    <label htmlFor="gallery-upload" className={styles.uploadLabel}>
                        {formData.galleryPreviews.length > 0 ? (
                            <div className={styles.galleryPreviewGrid}>
                                {formData.galleryPreviews.map((src, i) => (
                                    <img key={i} src={src} alt={`Gallery ${i + 1}`} className={styles.galleryPreviewImg} />
                                ))}
                            </div>
                        ) : (
                            <>
                                <UploadCloud size={32} className={styles.uploadIcon} />
                                <span>Click to upload up to 3 photos</span>
                            </>
                        )}
                    </label>
                </div>
            </div>
        </div>
    );

    const renderFormStep3 = () => (
        <div className={styles.formStep}>
            <h2 className={styles.stepTitle}>Operations</h2>
            <p className={styles.stepDesc}>Set up your delivery and service parameters.</p>

            <div className={styles.inputGroup}>
                <label>Delivery Zones Supported</label>
                <div className={styles.chipGrid}>
                    {PH_AREAS.map(area => (
                        <button
                            key={area}
                            type="button"
                            className={`${styles.chip} ${formData.deliveryZones.includes(area) ? styles.chipActive : ''}`}
                            onClick={() => handleAreaToggle(area, 'deliveryZones')}
                        >
                            {area}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label>Minimum Order Value (₦)</label>
                    <input
                        type="number"
                        placeholder="e.g. 1000"
                        value={formData.minOrder}
                        onChange={e => updateForm('minOrder', e.target.value)}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Avg. Fulfilment Time</label>
                    <select
                        value={formData.fulfilmentTime}
                        onChange={e => updateForm('fulfilmentTime', e.target.value)}
                    >
                        <option>15 mins</option>
                        <option>30 mins</option>
                        <option>45 mins</option>
                        <option>1 hour</option>
                        <option>2+ hours</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderFormStep4 = () => (
        <div className={styles.formStep}>
            <h2 className={styles.stepTitle}>Financials & Setup</h2>
            <p className={styles.stepDesc}>Where should we send your payouts?</p>

            <div className={styles.verifyCard}>
                <ShieldCheck size={24} className={styles.verifyIcon} />
                <div>
                    <h4 className={styles.verifyTitle}>Secure Bank Verification</h4>
                    <p className={styles.verifyDesc}>Your bank details are securely verified to ensure seamless payouts.</p>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Bank Name</label>
                <select
                    value={formData.bankName}
                    onChange={e => updateForm('bankName', e.target.value)}
                    required
                >
                    <option value="">Select Bank</option>
                    <option>Access Bank</option>
                    <option>Guaranty Trust Bank (GTB)</option>
                    <option>Zenith Bank</option>
                    <option>First Bank</option>
                    <option>United Bank for Africa (UBA)</option>
                </select>
            </div>

            <div className={styles.inputGroup}>
                <label>Account Number</label>
                <input
                    type="text"
                    maxLength={10}
                    placeholder="10 digit account number"
                    value={formData.accountNumber}
                    onChange={e => updateForm('accountNumber', e.target.value)}
                    required
                />
            </div>

            <div className={styles.inputGroup}>
                <label>Account Name</label>
                <input
                    type="text"
                    placeholder="Exact name on account"
                    value={formData.accountName}
                    onChange={e => updateForm('accountName', e.target.value)}
                    required
                />
            </div>

            <div className={styles.termsWrap}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={e => updateForm('termsAccepted', e.target.checked)}
                        required
                    />
                    <span className={styles.checkboxText}>
                        I agree to the <Link href="/terms" className={styles.linkText}>Merchant Terms of Service</Link> and
                        <Link href="/privacy" className={styles.linkText}>Privacy Policy</Link>.
                    </span>
                </label>
            </div>
        </div>
    );

    return (
        <div className={styles.pageWrap}>
            {!isApplying ? renderLanding() : (
                <div className={styles.appWrap}>
                    <button className={styles.backBtn} onClick={() => setIsApplying(false)}>
                        &larr; Back
                    </button>

                    <div className={styles.appContainer}>
                        {/* Progress Stepper */}
                        <div className={styles.stepper}>
                            {[1, 2, 3, 4].map(step => (
                                <div key={step} className={`${styles.stepIndicator} ${currentStep >= step ? styles.stepActive : ''}`}>
                                    <div className={styles.stepCircle}>
                                        {currentStep > step ? <Check size={14} /> : step}
                                    </div>
                                    <span className={styles.stepLabel}>
                                        {step === 1 ? 'Details' : step === 2 ? 'Media' : step === 3 ? 'Operations' : 'Setup'}
                                    </span>
                                    {step < 4 && <div className={styles.stepLine} />}
                                </div>
                            ))}
                        </div>

                        {/* Form Area */}
                        <form className={styles.formArea} onSubmit={handleSubmit}>
                            {currentStep === 1 && renderFormStep1()}
                            {currentStep === 2 && renderFormStep2()}
                            {currentStep === 3 && renderFormStep3()}
                            {currentStep === 4 && renderFormStep4()}

                            <div className={styles.formActions}>
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        className={styles.btnSecondary}
                                        onClick={() => setCurrentStep(p => p - 1)}
                                    >
                                        Previous
                                    </button>
                                )}

                                {currentStep < 4 ? (
                                    <button
                                        type="button"
                                        className={styles.btnPrimary}
                                        onClick={() => setCurrentStep(p => p + 1)}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        Next Step
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className={styles.btnPrimary}
                                        disabled={isLoading || !formData.termsAccepted}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        {isLoading ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
