import { Html, Head, Body, Container, Text, Button, Section } from '@react-email/components';

export default function DriverPremiumActivated() {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <div style={carIcon}>🏎️</div>
                        <Text style={logo}>DAL Driver Pro</Text>
                    </Section>
                    <Text style={heading}>You are now a DAL Pro Driver</Text>
                    <Text style={paragraph}>Congratulations! Your driver premium subscription has started. Enjoy zero commissions!</Text>
                    <ul>
                        <li style={listItem}><b>0% Commission:</b> Keep absolutely everything you earn.</li>
                        <li style={listItem}><b>Top tier matching:</b> Get prime requests before standard drivers.</li>
                        <li style={listItem}><b>Uncapped analytics:</b> View your full earning spectrum in dashboard.</li>
                    </ul>
                    <Section style={btnContainer}>
                        <Button style={button} href="https://dal.com/driver">Go to Driver Dashboard</Button>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', border: '1px solid #111' };
const header = { padding: '20px', textAlign: 'center' as const, backgroundColor: '#f5f5f5' };
const carIcon = { fontSize: '40px', margin: '0 0 10px' };
const logo = { fontSize: '28px', fontWeight: '900', color: '#111', margin: 0 };
const heading = { fontSize: '24px', fontWeight: 'bold', padding: '20px 20px 0', textAlign: 'center' as const };
const paragraph = { margin: '15px 0', fontSize: '15px', padding: '0 20px', textAlign: 'center' as const };
const listItem = { margin: '0 0 10px', fontSize: '15px' };
const btnContainer = { padding: '20px', textAlign: 'center' as const };
const button = { backgroundColor: '#111', borderRadius: '4px', color: '#fff', fontSize: '16px', textDecoration: 'none', padding: '12px 24px', fontWeight: 'bold' };
