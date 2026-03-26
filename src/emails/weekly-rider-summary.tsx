import { Html, Head, Body, Container, Text, Section, Row, Column } from '@react-email/components';

export default function WeeklyRiderSummary({ name = 'Driver', totalEarnings = '₦0', totalTrips = 0, topDay = 'Monday' }: any) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>DAL Weekly Review</Text>
                    </Section>
                    <Text style={heading}>Great working with you this week, {name}!</Text>
                    <Text style={paragraph}>Here is a quick snapshot of your earnings and activity on the DAL platform this past week.</Text>
                    
                    <Section style={statsBox}>
                        <Row style={row}>
                            <Column style={label}>Total Earnings:</Column>
                            <Column style={valGreen}>{totalEarnings}</Column>
                        </Row>
                        <Row style={row}>
                            <Column style={label}>Total Trips/Errands:</Column>
                            <Column style={val}>{totalTrips}</Column>
                        </Row>
                        <Row style={row}>
                            <Column style={label}>Top Earning Day:</Column>
                            <Column style={valTop}>{topDay}</Column>
                        </Row>
                    </Section>

                    <Text style={footer}>Keep up the incredible hustle! Next week brings fresh opportunities.</Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px' };
const header = { padding: '20px', textAlign: 'center' as const };
const logo = { fontSize: '24px', fontWeight: 'bold' };
const heading = { fontSize: '20px', fontWeight: 'bold', padding: '0 20px', textAlign: 'center' as const };
const paragraph = { margin: '15px 0', fontSize: '15px', padding: '0 20px', textAlign: 'center' as const };
const statsBox = { padding: '24px', backgroundColor: '#f3f4f6', margin: '0 20px', borderRadius: '12px' };
const row = { marginBottom: '16px', fontSize: '16px' };
const label = { fontWeight: '600', color: '#6b7280', width: '150px' };
const val = { fontWeight: 'bold', color: '#111', fontSize: '18px' };
const valGreen = { fontWeight: '900', color: '#10b981', fontSize: '22px' };
const valTop = { fontWeight: 'bold', color: '#f59e0b', fontSize: '18px' };
const footer = { padding: '30px 20px 0', fontSize: '14px', color: '#666', textAlign: 'center' as const };
