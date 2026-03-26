import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Become a Rider | Earn with DAL',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
