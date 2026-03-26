import { Html, Head, Body, Container, Text, Section } from '@react-email/components';

export default function DeliveryUpdate({ refCode = 'EXP-123', status = 'In Progress', steps = ['Requested', 'Finding Worker', 'Assigned', 'In Progress'] }: any) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Text style={logo}>DAL Tracking</Text>
                    </Section>
                    <Text style={heading}>Update on Order {refCode}</Text>
                    
                    <Section style={statusBox}>
                        <Text style={statusText}>Current Status:</Text>
                        <Text style={statusHighlight}>{status}</Text>
                    </Section>

                    <Text style={paragraph}>Timeline Check:</Text>
                    <Section style={timeline}>
                        {steps.map((stage: string, idx: number) => {
                            const isCurrent = stage === status;
                            return (
                                <Text key={idx} style={isCurrent ? timelineCurrent : timelineDef}>
                                    {idx + 1}. {stage} {isCurrent && '📍'}
                                </Text>
                            );
                        })}
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
const heading = { fontSize: '20px', fontWeight: 'bold', padding: '0 20px' };
const paragraph = { margin: '20px 0 10px', fontSize: '15px', padding: '0 20px', fontWeight: 'bold' };
const statusBox = { padding: '20px', backgroundColor: '#fffbe6', margin: '0 20px', borderRadius: '8px', borderLeft: '4px solid #C9A227' };
const statusText = { fontSize: '14px', margin: 0, color: '#666' };
const statusHighlight = { fontSize: '22px', fontWeight: 'bold', margin: '8px 0 0', color: '#C9A227' };
const timeline = { padding: '0 20px' };
const timelineDef = { margin: '8px 0', color: '#666' };
const timelineCurrent = { margin: '8px 0', color: '#000', fontWeight: 'bold' as const };
