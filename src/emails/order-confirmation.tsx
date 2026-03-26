import { Html, Head, Body, Container, Text, Button, Section, Row, Column } from '@react-email/components';

export default function OrderConfirmation({ refCode = 'EXP-123', from = '', to = '', item = '', fee = '₦0' }: any) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>DAL</Text>
                    </Section>
                    <Text style={heading}>Order Confirmation</Text>
                    <Text style={paragraph}>Your request has been placed securely.</Text>
                    
                    <Section style={summaryBox}>
                        <Text style={refText}>REF: {refCode}</Text>
                        <Row style={row}>
                            <Column><b>From:</b></Column><Column>{from}</Column>
                        </Row>
                        <Row style={row}>
                            <Column><b>To:</b></Column><Column>{to}</Column>
                        </Row>
                        <Row style={row}>
                            <Column><b>Item/Details:</b></Column><Column>{item}</Column>
                        </Row>
                        <Row style={row}>
                            <Column><b>Total Fee:</b></Column><Column>{fee}</Column>
                        </Row>
                    </Section>

                    <Section style={btnContainer}>
                        <Button style={button} href={`https://dal.com/tracking/${refCode}`}>Track Your Order</Button>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px' };
const header = { padding: '20px', textAlign: 'center' as const };
const logo = { fontSize: '28px', fontWeight: 'bold' };
const heading = { fontSize: '24px', fontWeight: 'bold', padding: '17px 20px 0' };
const paragraph = { margin: '0 0 15px', fontSize: '15px', padding: '0 20px' };
const summaryBox = { padding: '20px', backgroundColor: '#f9f9f9', margin: '0 20px', borderRadius: '8px' };
const refText = { fontSize: '20px', color: '#C9A227', fontWeight: 'bold', marginBottom: '16px' };
const row = { marginBottom: '8px' };
const btnContainer = { padding: '20px' };
const button = { backgroundColor: '#111', color: '#fff', padding: '12px 20px', borderRadius: '4px', textDecoration: 'none' };
