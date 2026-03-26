'use client';

import { useState } from 'react';
import { Search, Filter, Check, X, Clock, MapPin, Phone, MessageSquare, ChevronRight, PackageCheck } from 'lucide-react';
import styles from './Orders.module.css';

const MOCK_ORDERS = [
    {
        id: 'ORD-9021',
        customer: 'Joy Okafor',
        phone: '08123456789',
        date: 'Today, 2:15 PM',
        status: 'pending',
        total: 5500,
        payment: 'Paid (Paystack)',
        address: '14 Woji Way, Port Harcourt',
        instructions: 'Call when you are at the gate.',
        items: [
            { name: 'Spicy Chicken Burger', qty: 1, price: 3500 },
            { name: 'Chilled Zobo Drink (1L)', qty: 2, price: 2000 }
        ]
    },
    {
        id: 'ORD-9018',
        customer: 'Kingsley E.',
        phone: '08098765432',
        date: 'Today, 1:30 PM',
        status: 'preparing',
        total: 8200,
        payment: 'Paid (Wallet)',
        address: 'Phase 2 GRA, Port Harcourt',
        instructions: '',
        items: [
            { name: 'Yam Porridge (Special)', qty: 2, price: 5600 },
            { name: 'Water', qty: 2, price: 600 }
        ]
    },
    {
        id: 'ORD-8995',
        customer: 'Sarah M.',
        phone: '09011223344',
        date: 'Yesterday, 6:45 PM',
        status: 'completed',
        total: 3500,
        payment: 'Paid (Paystack)',
        address: 'Rumuola Road',
        instructions: '',
        items: [
            { name: 'Signature Burger', qty: 1, price: 3500 }
        ]
    }
];

export default function BusinessOrdersPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orders, setOrders] = useState(MOCK_ORDERS);

    const tabs = [
        { id: 'all', label: 'All Orders' },
        { id: 'pending', label: 'Pending (1)' },
        { id: 'preparing', label: 'Preparing (1)' },
        { id: 'ready', label: 'Ready for Pickup' },
        { id: 'completed', label: 'Completed' },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return styles.statusPending;
            case 'preparing': return styles.statusPreparing;
            case 'ready': return styles.statusReady;
            case 'completed': return styles.statusCompleted;
            case 'cancelled': return styles.statusCancelled;
            default: return '';
        }
    };

    const handleAction = (id: string, newStatus: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        setSelectedOrder(null);
    };

    const filteredOrders = orders.filter(o =>
        (activeTab === 'all' || o.status === activeTab) &&
        (o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Orders</h1>
                    <p className={styles.subtitle}>Review and manage incoming customer orders.</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.tabsWrap}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={styles.actionsWrap}>
                    <div className={styles.searchBox}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search order ID or name"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date & Time</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? filteredOrders.map(order => (
                            <tr key={order.id} className={styles.trHover} onClick={() => setSelectedOrder(order)}>
                                <td className={styles.cellId}>{order.id}</td>
                                <td>{order.date}</td>
                                <td className={styles.cellCustomer}>{order.customer}</td>
                                <td>{order.items.reduce((acc, item) => acc + item.qty, 0)} items</td>
                                <td className={styles.cellTotal}>₦{order.total.toLocaleString()}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusStyle(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </td>
                                <td className={styles.cellAction}>
                                    <ChevronRight size={18} className={styles.actionIcon} />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className={styles.emptyTable}>No orders found matching this criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Slide-in Order Details Panel */}
            <div className={`${styles.panelOverlay} ${selectedOrder ? styles.panelOpen : ''}`} onClick={() => setSelectedOrder(null)}>
                <div className={`${styles.panel} ${selectedOrder ? styles.panelSlideIn : ''}`} onClick={e => e.stopPropagation()}>
                    {selectedOrder && (
                        <>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2 className={styles.panelId}>{selectedOrder.id}</h2>
                                    <span className={styles.panelDate}>{selectedOrder.date}</span>
                                </div>
                                <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className={styles.panelContent}>
                                <div className={styles.detailSection}>
                                    <span className={`${styles.statusBadge} ${getStatusStyle(selectedOrder.status)}`}>
                                        Status: {selectedOrder.status.toUpperCase()}
                                    </span>
                                    <p className={styles.paymentStatus}>
                                        <Check size={14} className={styles.checkIcon} />
                                        {selectedOrder.payment}
                                    </p>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3 className={styles.sectionTitle}>Customer Details</h3>
                                    <div className={styles.contactRow}>
                                        <div className={styles.contactInfo}>
                                            <p className={styles.customerName}>{selectedOrder.customer}</p>
                                            <p className={styles.customerPhone}><Phone size={12} /> {selectedOrder.phone}</p>
                                        </div>
                                    </div>
                                    <div className={styles.addressBox}>
                                        <MapPin size={16} className={styles.pinIcon} />
                                        <p>{selectedOrder.address}</p>
                                    </div>
                                    {selectedOrder.instructions && (
                                        <div className={styles.instructionBox}>
                                            <MessageSquare size={16} className={styles.msgIcon} />
                                            <p><strong>Note:</strong> {selectedOrder.instructions}</p>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.detailSection}>
                                    <h3 className={styles.sectionTitle}>Order Items</h3>
                                    <div className={styles.itemsList}>
                                        {selectedOrder.items.map((item: any, i: number) => (
                                            <div key={i} className={styles.itemRow}>
                                                <div className={styles.itemMain}>
                                                    <span className={styles.itemQty}>{item.qty}x</span>
                                                    <span className={styles.itemName}>{item.name}</span>
                                                </div>
                                                <span className={styles.itemPrice}>₦{item.price.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.totalRow}>
                                        <span>Total</span>
                                        <span className={styles.totalAmount}>₦{selectedOrder.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.panelFooter}>
                                {selectedOrder.status === 'pending' && (
                                    <>
                                        <button className={styles.btnReject} onClick={() => handleAction(selectedOrder.id, 'cancelled')}>
                                            <X size={16} /> Reject Order
                                        </button>
                                        <button className={styles.btnAccept} onClick={() => handleAction(selectedOrder.id, 'preparing')}>
                                            <Check size={16} /> Accept & Prepare
                                        </button>
                                    </>
                                )}
                                {selectedOrder.status === 'preparing' && (
                                    <button className={styles.btnReady} onClick={() => handleAction(selectedOrder.id, 'ready')}>
                                        <PackageCheck size={16} /> Mark as Ready
                                    </button>
                                )}
                                {selectedOrder.status === 'ready' && (
                                    <button className={styles.btnComplete} onClick={() => handleAction(selectedOrder.id, 'completed')}>
                                        <Check size={16} /> Mark Handed to Rider
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
