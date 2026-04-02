'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }) {
    const pathname = usePathname();
    const isWelcome = pathname?.startsWith('/welcome');

    return (
        <>
            {!isWelcome && <Navbar />}
            <main>{children}</main>
            {!isWelcome && <Footer />}
        </>
    );
}
