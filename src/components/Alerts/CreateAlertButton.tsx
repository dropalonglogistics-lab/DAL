'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Plus, X, MapPin } from 'lucide-react';
import styles from './CreateAlertButton.module.css';

export default function CreateAlertButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState('traffic');
    const [description, setDescription] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || null;

            const { error } = await supabase.from('alerts').insert({
                user_id: userId,
                type,
                description,
                latitude: 9.0765, // Hardcoded for MVP (Abuja)
                longitude: 7.3986,
            });

            if (error) throw error;

            setIsOpen(false);
            setDescription('');
            router.refresh();

            if (!userId) {
                alert('Alert posted successfully! Consider signing up to track your contributions.');
            } else {
                alert('Alert posted successfully!');
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button onClick={handleOpen} className={styles.fab} aria-label="Create Alert">
                <Plus size={24} />
            </button>

            {isOpen && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <h3>Report Incident</h3>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <label>Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="traffic">Traffic Jam</option>
                                    <option value="checkpoint">Police Checkpoint</option>
                                    <option value="accident">Accident</option>
                                    <option value="construction">Road Work</option>
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label>Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What's happening? (e.g. VIO checking papers)"
                                    required
                                    rows={3}
                                />
                            </div>

                            {/* Location Placeholder */}
                            <div className={styles.locationPreview}>
                                <MapPin size={16} />
                                <span>Using current location (Simulated: Abuja)</span>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'Posting...' : 'Post Alert'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
