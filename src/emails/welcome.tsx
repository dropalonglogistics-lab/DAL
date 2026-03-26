import { Html, Head, Body, Container, Text, Button, Section } from '@react-email/components';

export default function WelcomeEmail({ name = 'User' }: { name?: string }) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>DAL</Text>
                    </Section>
                    <Text style={heading}>Welcome to DAL, {name}!</Text>
                    <Text style={paragraph}>We are thrilled to have you with Drop Along Logistics. Here is what you can do:</Text>
                    <ul>
                        <li style={listItem}><b>Track Routes:</b> Avoid traffic with real-time community alerts.</li>
                        <li style={listItem}><b>Book Express:</b> Send packages quickly via verified riders.</li>
                        <li style={listItem}><b>Errand Workers:</b> Get personal shoppers to handle market runs and tasks.</li>
                    </ul>
                    <Section style={btnContainer}>
                        <Button style={button} href="https://dal.com/dashboard">Start Exploring</Button>
                    </Section>
                    <Text style={paragraph}>Welcome aboard!</Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = { backgroundColor: '#f6f9fc', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px' };
const header = { padding: '20px', textAlign: 'center' as const };
const logo = { fontSize: '28px', fontWeight: 'bold', color: '#111', margin: '0' };
const heading = { fontSize: '24px', letterSpacing: '-0.5px', lineHeight: '1.3', fontWeight: '400', color: '#484848', padding: '17px 20px 0' };
const paragraph = { margin: '0 0 15px', fontSize: '15px', lineHeight: '1.4', color: '#3c4149', padding: '0 20px' };
const listItem = { margin: '0 0 10px', fontSize: '15px', color: '#3c4149' };
const btnContainer = { padding: '20px' };
const button = { backgroundColor: '#C9A227', borderRadius: '3px', color: '#000', fontSize: '16px', textDecoration: 'none', textAlign: 'center' as const, display: 'block', padding: '12px' };
