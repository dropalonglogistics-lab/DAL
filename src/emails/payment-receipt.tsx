import { Html, Head, Body, Container, Text, Section, Row, Column } from '@react-email/components';

export default function PaymentReceipt({ amount = '₦0', refCode = 'TX-123', date = 'Today', description = 'Service Fee' }: any) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>DAL Finance</Text>
                    </Section>
                    <Text style={heading}>Payment Receipt</Text>
                    <Text style={paragraph}>Thank you for your payment securely processed with DAL.</Text>
                    
                    <Section style={receiptBox}>
                        <Text style={amountText}>{amount}</Text>
                        <Row style={row}>
                            <Column style={label}>Reference:</Column><Column>{refCode}</Column>
                        </Row>
                        <Row style={row}>
                            <Column style={label}>Date Paid:</Column><Column>{date}</Column>
                        </Row>
                        <Row style={row}>
                            <Column style={label}>For:</Column><Column>{description}</Column>
                        </Row>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px' };
const header = { padding: '20px', textAlign: 'center' as const };
const logo = { fontSize: '24px', fontWeight: 'bold' };
const heading = { fontSize: '24px', fontWeight: 'bold', padding: '0 20px' };
const paragraph = { margin: '10px 0 20px', fontSize: '15px', padding: '0 20px' };
const receiptBox = { padding: '24px', backgroundColor: '#f9f9f9', margin: '0 20px', borderRadius: '8px', textAlign: 'center' as const };
const amountText = { fontSize: '32px', color: '#111', fontWeight: '900', margin: '0 0 24px' };
const row = { marginBottom: '12px', textAlign: 'left' as const, fontSize: '15px' };
const label = { fontWeight: 'bold', color: '#666', width: '100px' };
