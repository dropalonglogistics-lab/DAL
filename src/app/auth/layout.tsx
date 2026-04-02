import AuthLayout from '@/components/auth/AuthLayout';

export default function AuthSubLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthLayout brandHeadline="Port Harcourt moves smarter with DAL.">
            {children}
        </AuthLayout>
    );
}
