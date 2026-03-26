import { Html, Head, Body, Container, Text, Button, Section } from '@react-email/components';

export default function PremiumActivated() {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <div style={crownIcon}>👑</div>
                        <Text style={logo}>DAL Premium</Text>
                    </Section>
                    <Text style={heading}>Welcome to the Platinum Tier</Text>
                    <Text style={paragraph}>Your DAL Premium subscription is now fully active. Enjoy your exclusive benefits:</Text>
                    <ul>
                        <li style={listItem}><b>Priority Matching:</b> Skip the queue instantly.</li>
                        <li style={listItem}><b>Free Route Adjustments:</b> Never pay penalties on diversions.</li>
                        <li style={listItem}><b>Verified Badge:</b> Display your gold badge in the Community Hub.</li>
                    </ul>
                    <Section style={btnContainer}>
                        <Button style={button} href="https://dal.com/dashboard">Go to Dashboard</Button>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', border: '1px solid #C9A227' };
const header = { padding: '20px', textAlign: 'center' as const, backgroundColor: '#111' };
const crownIcon = { fontSize: '40px', margin: '0 0 10px' };
const logo = { fontSize: '28px', fontWeight: 'bold', color: '#C9A227', margin: 0 };
const heading = { fontSize: '24px', fontWeight: 'bold', padding: '20px 20px 0', textAlign: 'center' as const };
const paragraph = { margin: '15px 0', fontSize: '15px', padding: '0 20px', textAlign: 'center' as const };
const listItem = { margin: '0 0 10px', fontSize: '15px' };
const btnContainer = { padding: '20px', textAlign: 'center' as const };
const button = { backgroundColor: '#C9A227', borderRadius: '3px', color: '#000', fontSize: '16px', textDecoration: 'none', padding: '12px 24px', fontWeight: 'bold' };
