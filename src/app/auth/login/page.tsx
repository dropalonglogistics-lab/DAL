import { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
    title: 'Sign In to DAL | Drop Along Logistics',
    description: 'Sign in to access your DAL account.',
};

export default function LoginPage() {
    return <LoginForm />;
}
