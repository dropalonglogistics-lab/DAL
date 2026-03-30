import styles from './CityGrid.module.css';

export default function CityGrid() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.grid}></div>
            <div className={styles.dots}>
                <div className={`${styles.dot} ${styles.dot1}`}>
                    <div className={styles.pulse}></div>
                </div>
                <div className={`${styles.dot} ${styles.dot2}`}>
                    <div className={styles.pulse}></div>
                </div>
                <div className={`${styles.dot} ${styles.dot3}`}>
                    <div className={styles.pulse}></div>
                </div>
            </div>
        </div>
    );
}
