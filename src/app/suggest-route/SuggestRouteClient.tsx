'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import styles from './suggest-route.module.css';

export default function SuggestRouteClient() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [vehicleType, setVehicleType] = useState('Keke');
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const supabase = createClient();

    const handleSubmit = async () => {
        const newErrors: { [key: string]: string } = {};
        if (!from.trim()) newErrors.from = 'This field is required.';
        if (!to.trim()) newErrors.to = 'This field is required.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Insert to route_suggestions
            const { error: suggestError } = await supabase
                .from('route_suggestions')
                .insert({
                    from_location: from,
                    to_location: to,
                    vehicle_type: vehicleType,
                    description: description,
                    submitted_by: name || (user?.id ?? 'Anonymous'),
                    status: 'pending'
                });

            if (suggestError) throw suggestError;

            // 2. If user is logged in, insert to community_points
            if (user) {
                const { error: pointsError } = await supabase
                    .from('community_points')
                    .insert({
                        user_id: user.id,
                        points: 10,
                        reason: 'route_suggestion'
                    });
                if (pointsError) console.error('Points error:', pointsError);
            }

            setIsSuccess(true);
        } catch (err: any) {
            console.error('Submission error:', err);
            setErrorMsg(err.message || 'Failed to submit route suggestion.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFrom('');
        setTo('');
        setVehicleType('Keke');
        setDescription('');
        setName('');
        setErrors({});
        setIsSuccess(false);
        setErrorMsg('');
    };

    if (isSuccess) {
        return (
            <div className={styles.container}>
                <div className={styles.successState}>
                    <div className={styles.checkCircle}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h1 className={styles.successTitle}>Route submitted!</h1>
                    <p className={styles.successSub}>You&apos;ve earned 10 community points. Thank you for building the Port Harcourt network.</p>
                    <button className={styles.resetBtn} onClick={resetForm}>Suggest another route</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Suggest a Route</h1>
                <p className={styles.subtitle}>Help grow Port Harcourt&apos;s most accurate route network. Earn 10 community points per approved suggestion.</p>
            </div>

            <div className={styles.formContainer}>
                {/* FROM */}
                <div className={styles.field}>
                    <label className={styles.formLabel}>FROM</label>
                    <input
                        className={`${styles.input} ${errors.from ? styles.inputError : ''}`}
                        placeholder="Starting point — e.g. Mile 1, Rumuola, Choba"
                        value={from}
                        onChange={(e) => { setFrom(e.target.value); setErrors({ ...errors, from: '' }); }}
                    />
                    {errors.from && <span className={styles.errorMessage}>{errors.from}</span>}
                </div>

                {/* TO */}
                <div className={styles.field}>
                    <label className={styles.formLabel}>TO</label>
                    <input
                        className={`${styles.input} ${errors.to ? styles.inputError : ''}`}
                        placeholder="Destination — e.g. UniPort Gate, GRA, Mile 3"
                        value={to}
                        onChange={(e) => { setTo(e.target.value); setErrors({ ...errors, to: '' }); }}
                    />
                    {errors.to && <span className={styles.errorMessage}>{errors.to}</span>}
                </div>

                {/* VEHICLE TYPE */}
                <div className={styles.field}>
                    <label className={styles.formLabel}>VEHICLE TYPE</label>
                    <div className={styles.selectWrapper}>
                        <select
                            className={styles.input}
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                        >
                            <option>Keke</option>
                            <option>Bus</option>
                            <option>Motorcycle</option>
                            <option>Walking</option>
                        </select>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div className={styles.field}>
                    <label className={styles.formLabel}>DESCRIBE THE ROUTE (OPTIONAL)</label>
                    <textarea
                        className={styles.input}
                        rows={4}
                        placeholder="Key stops, landmarks, anything that helps riders find this route"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* YOUR NAME */}
                <div className={styles.field}>
                    <label className={styles.formLabel}>YOUR NAME (OPTIONAL)</label>
                    <input
                        className={styles.input}
                        placeholder="For attribution in the community hub"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {errorMsg && <div className={styles.globalError}>{errorMsg}</div>}

                <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting…' : 'Submit Route Suggestion'}
                </button>
            </div>
        </div>
    );
}
