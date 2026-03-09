import AuthLayout from '@/components/layout/AuthLayout';

export default function AuthSubLayout({ children }: { children: React.ReactNode }) {
    return <AuthLayout>{children}</AuthLayout>;
}
