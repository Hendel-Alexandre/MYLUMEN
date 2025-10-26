import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  contractTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '35%',
    color: '#666',
    fontWeight: 'bold',
  },
  value: {
    width: '65%',
    color: '#000',
  },
  body: {
    marginTop: 20,
    marginBottom: 30,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  bodyParagraph: {
    marginBottom: 12,
  },
  signatureSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 5,
    paddingBottom: 20,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
  },
  signedIndicator: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: 'bold',
    marginTop: 5,
  },
  metadata: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  metadataLabel: {
    width: '40%',
    fontSize: 10,
    color: '#666',
  },
  metadataValue: {
    width: '60%',
    fontSize: 10,
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  badge: {
    display: 'inline-block',
    padding: '4 8',
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    fontSize: 9,
    color: '#666',
    marginLeft: 10,
  },
  statusBadge: {
    padding: '4 8',
    borderRadius: 3,
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusDraft: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusSent: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  statusSigned: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusExpired: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  statusTerminated: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
});

interface ContractPDFData {
  id: number;
  title: string;
  body: string;
  type?: string;
  status: string;
  value?: number;
  startDate?: string;
  endDate?: string;
  signedByClient: boolean;
  signedByUser: boolean;
  signedAt?: string;
  createdAt: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  logoUrl?: string;
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  clientAddress?: string;
}

interface ContractPDFProps {
  data: ContractPDFData;
}

export const ContractPDF = ({ data }: ContractPDFProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusStyle = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'draft') return styles.statusDraft;
    if (statusLower === 'sent') return styles.statusSent;
    if (statusLower === 'signed') return styles.statusSigned;
    if (statusLower === 'expired') return styles.statusExpired;
    if (statusLower === 'terminated') return styles.statusTerminated;
    return styles.badge;
  };

  const splitBodyIntoParagraphs = (body: string) => {
    return body.split('\n\n').filter(p => p.trim());
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>CONTRACT</Text>
            <Text style={styles.subtitle}>
              {data.businessName || 'Your Business'}
            </Text>
            {data.businessAddress && (
              <Text style={styles.subtitle}>{data.businessAddress}</Text>
            )}
            {data.businessPhone && (
              <Text style={styles.subtitle}>{data.businessPhone}</Text>
            )}
            {data.businessEmail && (
              <Text style={styles.subtitle}>{data.businessEmail}</Text>
            )}
          </View>
          <View>
            <Text style={[styles.statusBadge, getStatusStyle(data.status)]}>
              {data.status.toUpperCase()}
            </Text>
            <Text style={[styles.subtitle, { marginTop: 10 }]}>
              Contract #{data.id}
            </Text>
            <Text style={styles.subtitle}>
              Date: {formatDate(data.createdAt)}
            </Text>
          </View>
        </View>

        {/* Contract Title */}
        <Text style={styles.contractTitle}>{data.title}</Text>

        {/* Contract Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contract Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{data.type || 'Service Agreement'}</Text>
          </View>
          {data.value && (
            <View style={styles.row}>
              <Text style={styles.label}>Contract Value:</Text>
              <Text style={styles.value}>{formatCurrency(data.value)}</Text>
            </View>
          )}
          {data.startDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Start Date:</Text>
              <Text style={styles.value}>{formatDate(data.startDate)}</Text>
            </View>
          )}
          {data.endDate && (
            <View style={styles.row}>
              <Text style={styles.label}>End Date:</Text>
              <Text style={styles.value}>{formatDate(data.endDate)}</Text>
            </View>
          )}
        </View>

        {/* Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Service Provider:</Text>
            <Text style={styles.value}>{data.businessName || 'Your Business'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>
              {data.clientName || 'Client Name'}
              {data.clientCompany && ` - ${data.clientCompany}`}
            </Text>
          </View>
          {data.clientEmail && (
            <View style={styles.row}>
              <Text style={styles.label}>Client Email:</Text>
              <Text style={styles.value}>{data.clientEmail}</Text>
            </View>
          )}
          {data.clientAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>Client Address:</Text>
              <Text style={styles.value}>{data.clientAddress}</Text>
            </View>
          )}
        </View>

        {/* Contract Body */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          <View style={styles.body}>
            {splitBodyIntoParagraphs(data.body).map((paragraph, index) => (
              <Text key={index} style={styles.bodyParagraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          {data.signedAt && (
            <View style={styles.row}>
              <Text style={styles.label}>Signed On:</Text>
              <Text style={styles.value}>{formatDate(data.signedAt)}</Text>
            </View>
          )}
          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Service Provider Signature</Text>
              <Text style={styles.signatureLabel}>
                {data.businessName || 'Your Business'}
              </Text>
              {data.signedByUser && (
                <Text style={styles.signedIndicator}>✓ SIGNED</Text>
              )}
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Client Signature</Text>
              <Text style={styles.signatureLabel}>
                {data.clientName || 'Client Name'}
              </Text>
              {data.signedByClient && (
                <Text style={styles.signedIndicator}>✓ SIGNED</Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This contract was generated by LumenR • {formatDate(data.createdAt)}
        </Text>
      </Page>
    </Document>
  );
};
