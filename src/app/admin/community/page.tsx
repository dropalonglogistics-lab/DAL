'use client';

import { useState } from 'react';
import { Search, Trophy, Calendar, Plus, User, ArrowUpRight, ArrowDownRight, RefreshCw, X, Gift } from 'lucide-react';
import styles from './AdminCommunity.module.css';

// Mock Data
const MOCK_COMPETITIONS = [
    {
        id: 'CMP-004', title: 'Top Reporters of March',
        prize: '₦50,000 Cash + DAL Merch Kit',
        metric: 'Total Points',
        endDate: '2026-03-31', daysLeft: 15,
        status: 'active',
        topUsers: [
            { name: 'Emmanuel T.', points: 1250 },
            { name: 'Sarah M.', points: 980 },
            { name: 'Justice K.', points: 845 }
        ]
    }
];

const MOCK_HISTORY = [
    {
        id: 'LOG-882', user: 'emmanuel.t@gmail.com', action: 'added', amount: 50,
        reason: 'Exceptional detail on Aba Road accident report.',
        date: 'Today, 10:45 AM'
    },
    {
        id: 'LOG-881', user: 'john.d@example.com', action: 'deducted', amount: 15,
        reason: 'Spamming false alerts.',
        date: 'Yesterday, 2:10 PM'
    }
];

export default function AdminCommunityPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPointModalOpen, setIsPointModalOpen] = useState(false);
    const [pointAction, setPointAction] = useState<'add' | 'deduct'>('add');
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Form Config
    const [compForm, setCompForm] = useState({ title: '', prize: '', start: '', end: '', metric: 'points' });
    const [pointForm, setPointForm] = useState({ userEmail: '', amount: '', reason: '' });

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1500);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Community & Points</h1>
                    <p className={styles.subtitle}>Manage gamification, competitions, and manual point adjustments.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.btnSecondary} onClick={handleRefresh}>
                        <RefreshCw size={16} className={isRefreshing ? styles.spin : ''} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Leaderboard (Last: 5m ago)'}
                    </button>
                    <button className={styles.btnPrimary} onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={16} /> Create Competition
                    </button>
                </div>
            </div>

            <div className={styles.mainLayout}>
                {/* Left Col: Active Competitions & Controls */}
                <div className={styles.leftCol}>
                    <div className={styles.sectionHeader}>
                        <h2>Active Competitions</h2>
                    </div>

                    {MOCK_COMPETITIONS.length > 0 ? MOCK_COMPETITIONS.map(comp => (
                        <div key={comp.id} className={styles.compCard}>
                            <div className={styles.compHeader}>
                                <div className={styles.compTitleWrap}>
                                    <Trophy size={20} className={styles.compIcon} />
                                    <h3>{comp.title}</h3>
                                </div>
                                <div className={styles.badgeActive}>Active</div>
                            </div>

                            <div className={styles.compMeta}>
                                <div className={styles.metaBox}>
                                    <span>Prize Pool</span>
                                    <strong><Gift size={14} className={styles.inlineIcon} /> {comp.prize}</strong>
                                </div>
                                <div className={styles.metaBox}>
                                    <span>Time Left</span>
                                    <strong><Calendar size={14} className={styles.inlineIcon} /> {comp.daysLeft} Days</strong>
                                </div>
                                <div className={styles.metaBox}>
                                    <span>Scoring Metric</span>
                                    <strong>{comp.metric}</strong>
                                </div>
                            </div>

                            <div className={styles.leaderboardPreview}>
                                <h4>Current Top 3</h4>
                                {comp.topUsers.map((u, i) => (
                                    <div key={i} className={styles.lbRow}>
                                        <div className={styles.lbUser}>
                                            <span className={styles.lbRank}>#{i + 1}</span>
                                            {u.name}
                                        </div>
                                        <div className={styles.lbScore}>{u.points} pts</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )) : (
                        <div className={styles.emptyCard}>
                            <Trophy size={32} className={styles.emptyIcon} />
                            <p>No active competitions running right now.</p>
                        </div>
                    )}
                </div>

                {/* Right Col: Manual Adjustments & History */}
                <div className={styles.rightCol}>
                    <div className={styles.actionCard}>
                        <div className={styles.cardHeader}>
                            <h2>Manual Point Controls</h2>
                        </div>
                        <div className={styles.cardBody}>
                            <p className={styles.helpText}>Directly augment a user's points balance. Action is logged immutably under your admin account.</p>

                            <div className={styles.searchWrap}>
                                <Search size={16} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Find User by Email or ID..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className={styles.inputField}
                                />
                            </div>

                            {searchTerm.length > 3 && (
                                <div className={styles.userResultBadge}>
                                    <User size={16} /> Selected: emmanuel.t@gmail.com (Bal: 1250)
                                </div>
                            )}

                            <div className={styles.btnGroup}>
                                <button className={styles.btnAddMode} onClick={() => { setPointAction('add'); setIsPointModalOpen(true); }}>
                                    <ArrowUpRight size={18} /> Add Points
                                </button>
                                <button className={styles.btnDeductMode} onClick={() => { setPointAction('deduct'); setIsPointModalOpen(true); }}>
                                    <ArrowDownRight size={18} /> Deduct Points
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.historyCard}>
                        <div className={styles.cardHeader}>
                            <h2>My Action Log</h2>
                        </div>
                        <div className={styles.historyList}>
                            {MOCK_HISTORY.map(log => (
                                <div key={log.id} className={styles.historyRow}>
                                    <div className={styles.historyIconWrap}>
                                        {log.action === 'added' ? <ArrowUpRight className={styles.iconAdd} size={16} /> : <ArrowDownRight className={styles.iconDeduct} size={16} />}
                                    </div>
                                    <div className={styles.historyMain}>
                                        <div className={styles.historyTop}>
                                            <strong>{log.user}</strong>
                                            <span className={log.action === 'added' ? styles.ptsAdded : styles.ptsDeducted}>
                                                {log.action === 'added' ? '+' : '-'}{log.amount} pts
                                            </span>
                                        </div>
                                        <p className={styles.historyReason}>{log.reason}</p>
                                        <span className={styles.historyDate}>{log.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Competition Modal */}
            {isCreateModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Create New Competition</h2>
                            <button className={styles.closeBtn} onClick={() => setIsCreateModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalScrollBody}>
                            <div className={styles.formGroup}>
                                <label>Competition Title</label>
                                <input type="text" placeholder="e.g. April Route Hunt" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Prize Description</label>
                                <input type="text" placeholder="e.g. ₦100,000 for 1st Place" className={styles.inputField} />
                            </div>
                            <div className={styles.dateGrid}>
                                <div className={styles.formGroup}>
                                    <label>Start Date</label>
                                    <input type="date" className={styles.inputField} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>End Date</label>
                                    <input type="date" className={styles.inputField} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Scoring Metric</label>
                                <select className={styles.inputField}>
                                    <option value="points">Total Points (Global)</option>
                                    <option value="routes">Routes Verified Only</option>
                                    <option value="alerts">Alerts Confirmed Only</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnSecondary} onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                            <button className={styles.btnPrimary}>Launch Competition</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Point Adjustment Modal */}
            {isPointModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContentSmall}>
                        <div className={styles.modalHeader}>
                            <h2>{pointAction === 'add' ? 'Add Points' : 'Deduct Points'}</h2>
                            <button className={styles.closeBtn} onClick={() => setIsPointModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <p className={styles.targetLabel}>Target User: <strong>emmanuel.t@gmail.com</strong></p>

                            <div className={styles.formGroup}>
                                <label>Amount</label>
                                <input type="number" placeholder="0" min="1" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Reason (visible to user, min 10 chars)</label>
                                <textarea placeholder="Provide detailed justification..." className={styles.textArea} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnSecondary} onClick={() => setIsPointModalOpen(false)}>Cancel</button>
                            <button className={pointAction === 'add' ? styles.btnSuccess : styles.btnDanger}>
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
