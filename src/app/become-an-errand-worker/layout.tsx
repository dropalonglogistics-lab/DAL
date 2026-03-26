import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Become an Errand Worker | DAL',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
