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

interface DemoRequestEmailProps {
  name: string
  company: string
  email: string
  phone?: string
  teamSize?: string
  tier?: string
  date: string
}

export function DemoRequestEmail({
  name,
  company,
  email,
  phone,
  teamSize,
  tier,
  date,
}: DemoRequestEmailProps) {
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

          {/* Alert label */}
          <Section style={alertBand}>
            <Text style={alertText}>🔔 New Demo Request</Text>
          </Section>

          <Section style={cardBody}>

            <Text style={heading}>New Demo Request Received</Text>
            <Text style={subheading}>
              A new request has been submitted through the HeatGuard registration form. Review the details below and approve or reject it in the admin panel.
            </Text>

            <Hr style={divider} />

            {/* Details table */}
            <Section style={detailsSection}>
              <Text style={detailsTitle}>REQUESTER DETAILS</Text>

              <Row style={detailRow}>
                <Column style={detailLabel}>Full Name</Column>
                <Column style={detailValue}>{name}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>Company</Column>
                <Column style={detailValue}>{company}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>Email</Column>
                <Column style={detailValue}>{email}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>Phone</Column>
                <Column style={detailValue}>{phone ?? '—'}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>Team Size</Column>
                <Column style={detailValue}>{teamSize ?? '—'}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>Requested Tier</Column>
                <Column style={{ ...detailValue, color: '#00D15A', fontWeight: '700' }}>{tier ?? '—'}</Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailLabel}>Submitted</Column>
                <Column style={detailValue}>
                  {new Date(date).toLocaleString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Column>
              </Row>
            </Section>

            <Hr style={divider} />

            <Text style={ctaHint}>
              Log in to the HeatGuard Admin Panel to approve or reject this request. Approved Demo-tier users receive a 3-day access window.
            </Text>

            <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
              <Button
                href="https://dashboard.heatguard.ae/hq/demo-requests"
                style={ctaButton}
              >
                Review in Admin Panel →
              </Button>
            </Section>

          </Section>
        </Container>

        {/* Footer */}
        <Container style={footer}>
          <Text style={footerText}>
            This notification was sent by HeatGuard&apos;s automated request system.
            Please do not reply to this email.
          </Text>
          <Text style={footerText}>© 2026 HeatGuard · All rights reserved</Text>
        </Container>

      </Body>
    </Html>
  )
}

export default DemoRequestEmail

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

const detailsSection: React.CSSProperties = {
  backgroundColor: '#F8FAFC',
  borderRadius: '10px',
  padding: '20px 24px',
}

const detailsTitle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#94A3B8',
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
  paddingTop: '1px',
}

const detailValue: React.CSSProperties = {
  fontSize: '14px',
  color: '#1E293B',
  fontWeight: '500',
}

const ctaHint: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748B',
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
  padding: '14px 32px',
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
