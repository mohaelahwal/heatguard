import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Row,
  Column,
} from '@react-email/components'

interface DemoApprovedEmailProps {
  name: string
  email: string
  password: string
  expiresAt: string
  loginUrl: string
}

export function DemoApprovedEmail({
  name,
  email,
  password,
  expiresAt,
  loginUrl,
}: DemoApprovedEmailProps) {
  const expiryDisplay = new Date(expiresAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <Html lang="en">
      <Head />
      <Body style={body}>

        {/* Header */}
        <Section style={header}>
          <Container style={headerInner}>
            <Text style={logoText}>HeatGuard®</Text>
            <Text style={headerSub}>Workforce Heat Safety Platform</Text>
          </Container>
        </Section>

        {/* Body card */}
        <Container style={card}>

          {/* Alert band */}
          <Section style={alertBand}>
            <Text style={alertText}>✅ Your Demo Access is Ready</Text>
          </Section>

          <Section style={cardBody}>

            <Text style={heading}>Welcome, {name}!</Text>
            <Text style={subheading}>
              Your HeatGuard demo account has been approved. Use the credentials below to log in and explore the platform. Your access is valid until <strong>{expiryDisplay}</strong>.
            </Text>

            <Hr style={divider} />

            {/* Credentials box */}
            <Section style={credentialsSection}>
              <Text style={credentialsTitle}>YOUR LOGIN CREDENTIALS</Text>

              <Row style={detailRow}>
                <Column style={detailLabel}>Email</Column>
                <Column style={{ ...detailValue, color: '#0F172A' }}>{email}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>Password</Column>
                <Column style={passwordValue}>{password}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>Access Expires</Column>
                <Column style={{ ...detailValue, color: '#DC2626', fontWeight: '700' }}>{expiryDisplay}</Column>
              </Row>
            </Section>

            <Hr style={divider} />

            <Text style={notice}>
              For security, please change your password after your first login. This is a temporary demo account — your data will not persist after the trial period.
            </Text>

            <Section style={{ textAlign: 'center' as const, marginTop: '28px' }}>
              <Button href={loginUrl} style={ctaButton}>
                Access Dashboard →
              </Button>
            </Section>

          </Section>
        </Container>

        {/* Footer */}
        <Container style={footer}>
          <Text style={footerText}>
            If you did not request this demo, please ignore this email.
          </Text>
          <Text style={footerText}>© 2026 HeatGuard · All rights reserved</Text>
        </Container>

      </Body>
    </Html>
  )
}

export default DemoApprovedEmail

// ─── Styles ──────────────────────────────────────────────
const body: React.CSSProperties = {
  backgroundColor: '#F1F5F9',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: '32px 0',
}

const header: React.CSSProperties = {
  backgroundColor: '#0B281F',
  padding: '28px 0',
}

const headerInner: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  textAlign: 'center',
}

const logoText: React.CSSProperties = {
  color: '#00D15A',
  fontSize: '22px',
  fontWeight: '800',
  letterSpacing: '-0.5px',
  margin: 0,
}

const headerSub: React.CSSProperties = {
  color: 'rgba(255,255,255,0.45)',
  fontSize: '12px',
  margin: '4px 0 0',
  letterSpacing: '0.5px',
}

const card: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '0 0 16px 16px',
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
}

const alertBand: React.CSSProperties = {
  backgroundColor: '#00D15A',
  padding: '10px 32px',
}

const alertText: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '700',
  margin: 0,
  letterSpacing: '0.3px',
}

const cardBody: React.CSSProperties = {
  padding: '32px 40px 36px',
}

const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#0F172A',
  margin: '0 0 10px',
  letterSpacing: '-0.4px',
}

const subheading: React.CSSProperties = {
  fontSize: '14px',
  color: '#64748B',
  margin: '0',
  lineHeight: '1.6',
}

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #E2E8F0',
  margin: '24px 0',
}

const credentialsSection: React.CSSProperties = {
  backgroundColor: '#F0FDF4',
  border: '1px solid #BBF7D0',
  borderRadius: '10px',
  padding: '20px 24px',
}

const credentialsTitle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#16A34A',
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
  margin: '0 0 16px',
}

const detailRow: React.CSSProperties = {
  marginBottom: '10px',
}

const detailLabel: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#94A3B8',
  width: '120px',
  verticalAlign: 'top',
  paddingTop: '2px',
}

const detailValue: React.CSSProperties = {
  fontSize: '14px',
  color: '#1E293B',
  fontWeight: '500',
}

const passwordValue: React.CSSProperties = {
  fontSize: '15px',
  color: '#0B281F',
  fontWeight: '800',
  fontFamily: '"Courier New", Courier, monospace',
  backgroundColor: '#DCFCE7',
  padding: '2px 8px',
  borderRadius: '4px',
  letterSpacing: '1px',
}

const notice: React.CSSProperties = {
  fontSize: '12px',
  color: '#94A3B8',
  lineHeight: '1.6',
  margin: '0',
  textAlign: 'center',
}

const ctaButton: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#00D15A',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  padding: '14px 36px',
  borderRadius: '10px',
  textDecoration: 'none',
  letterSpacing: '0.2px',
}

const footer: React.CSSProperties = {
  maxWidth: '560px',
  margin: '20px auto 0',
  textAlign: 'center',
}

const footerText: React.CSSProperties = {
  fontSize: '11px',
  color: '#94A3B8',
  margin: '0 0 4px',
  lineHeight: '1.5',
}
