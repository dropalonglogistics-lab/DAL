import styles from './CityGrid.module.css';

export default function CityGrid() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.grid}></div>
            <div className={styles.lines}>
                <div className={`${styles.line} ${styles.hLine}`} style={{ top: '25%', animationDelay: '0s' }}></div>
                <div className={`${styles.line} ${styles.hLine}`} style={{ top: '50%', animationDelay: '1s' }}></div>
                <div className={`${styles.line} ${styles.hLine}`} style={{ top: '75%', animationDelay: '2s' }}></div>
                <div className={`${styles.line} ${styles.vLine}`} style={{ left: '25%', animationDelay: '0.5s' }}></div>
                <div className={`${styles.line} ${styles.vLine}`} style={{ left: '50%', animationDelay: '1.5s' }}></div>
                <div className={`${styles.line} ${styles.vLine}`} style={{ left: '75%', animationDelay: '2.5s' }}></div>
            </div>
            <div className={styles.glow}></div>
        </div>
    );
}
