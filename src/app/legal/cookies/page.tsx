import React from 'react';
import styles from '../legal.module.css';

export const metadata = {
    title: 'Cookie Policy | DAL',
};

export default function CookiePolicy() {
    return (
        <div className={styles.header}>
            <h1 className={styles.title}>Cookie Policy</h1>
            <span className={styles.updatedDate}>Last Revised: April 2026</span>

            <h2>1. Identifying Technologies</h2>
            <p>
                Drop Along Logistics (DAL) relies on web cookies, local storage solutions (like the `localStorage` object handling your theme choice), and similar passive technologies. These instruments allow us to memorize authenticated sessions, configure rapid page transitions, and maintain your custom routing preferences seamlessly between visits.
            </p>

            <h2>2. Varieties of Cookies Deployed</h2>
            <p>
                To provide ultimate transparency, review the three core categories our mobile and web applications use below:
            </p>

            <div className={styles.tableContainer}>
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Functionality</th>
                            <th>Duration / Behavior</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Essential (Strictly Required)</strong></td>
                            <td>Enables core security components, routing API authorization (Supabase Auth sessions), and load balancing across server endpoints. Disabling these halts your ability to sign into the DAL Dashboard.</td>
                            <td>Session length (expires exactly when the browser runtime concludes) to up to 12 months for securely hashing ongoing user profiles.</td>
                        </tr>
                        <tr>
                            <td><strong>Analytics & Performance</strong></td>
                            <td>We passively monitor how Port Harcourt maps are navigated and loaded. Tools like PostHog collect anonymous structural data identifying UI bottlenecks and 404 dead ends.</td>
                            <td>Persistent objects (up to 2 years) unless regularly expunged by user OS settings. Doesn't harvest personal identity metrics.</td>
                        </tr>
                        <tr>
                            <td><strong>Preferences (Customization)</strong></td>
                            <td>Stores front-end interface adjustments locally. (e.g. Setting UI `dark-mode` rendering, verifying your initial cookie consent, caching recent searches).</td>
                            <td>Persistent until completely overwritten, cleared actively, or reaching manual expiration thresholds.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2>3. Consent & Governance</h2>
            <p>
                Upon your first visit to the DAL hub, a localized consent banner allowed you to selectively opt into analytical matrices or limit deployment purely to the "Essential Only" category. You maintain absolute rights to revoke permission or purge active tokens via your browser environments.
            </p>

            <h2>4. Disabling Local Storage</h2>
            <p>
                Please note that entirely suppressing first-party data via restrictive browser measures will corrupt or completely interrupt DAL's core mapping interface and personal dashboard synchronization. 
            </p>
        </div>
    );
}
