import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    );
}
