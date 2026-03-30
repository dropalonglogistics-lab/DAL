'use client';

import styles from '@/app/page.module.css';

export default function AnimatedCityGrid() {
    return (
        <div className={styles.cityGridContainer}>
            <div className={styles.gridLines}></div>
            
            {/* Moving Rider 1 */}
            <div className={`${styles.riderDot} ${styles.rider1}`}>
                <div className={styles.pulseRing}></div>
                <div className={styles.pulseRing}></div>
            </div>

            {/* Moving Rider 2 */}
            <div className={`${styles.riderDot} ${styles.rider2}`}>
                <div className={styles.pulseRing}></div>
                <div className={styles.pulseRing}></div>
            </div>

            {/* Moving Rider 3 */}
            <div className={`${styles.riderDot} ${styles.rider3}`}>
                <div className={styles.pulseRing}></div>
                <div className={styles.pulseRing}></div>
            </div>
        </div>
    );
}
