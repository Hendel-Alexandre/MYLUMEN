import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

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
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    color: '#666',
  },
  value: {
    width: '70%',
    color: '#000',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 10,
  },
  tableCol: {
    fontSize: 10,
  },
  tableColDesc: {
    width: '40%',
  },
  tableColQty: {
    width: '15%',
    textAlign: 'center',
  },
  tableColPrice: {
    width: '20%',
    textAlign: 'right',
  },
  tableColTotal: {
    width: '25%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 11,
    color: '#666',
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    padding: 10,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 10,
    color: '#666',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

interface LineItem {
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface QuoteData {
  quoteNumber: string;
  date: string;
  expiryDate?: string;
  status: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientAddress?: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  logoUrl?: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  footer?: string;
}

export const QuotePDF = ({ data }: { data: QuoteData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          {data.logoUrl && <Image src={data.logoUrl} style={styles.logo} />}
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>{data.businessName}</Text>
          {data.businessAddress && <Text style={{ fontSize: 9, color: '#666', marginTop: 5 }}>{data.businessAddress}</Text>}
          {data.businessPhone && <Text style={{ fontSize: 9, color: '#666' }}>{data.businessPhone}</Text>}
          {data.businessEmail && <Text style={{ fontSize: 9, color: '#666' }}>{data.businessEmail}</Text>}
        </View>
        <View>
          <Text style={styles.title}>QUOTE</Text>
          <Text style={styles.subtitle}>#{data.quoteNumber}</Text>
        </View>
      </View>

      {/* Quote Info */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{data.date}</Text>
        </View>
        {data.expiryDate && (
          <View style={styles.row}>
            <Text style={styles.label}>Valid Until:</Text>
            <Text style={styles.value}>{data.expiryDate}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{data.status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Client Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quote To:</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 3 }}>{data.clientName}</Text>
        {data.clientCompany && <Text style={{ fontSize: 10, color: '#666' }}>{data.clientCompany}</Text>}
        <Text style={{ fontSize: 10, color: '#666' }}>{data.clientEmail}</Text>
        {data.clientAddress && <Text style={{ fontSize: 10, color: '#666', marginTop: 3 }}>{data.clientAddress}</Text>}
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, styles.tableColDesc]}>Description</Text>
          <Text style={[styles.tableCol, styles.tableColQty]}>Qty</Text>
          <Text style={[styles.tableCol, styles.tableColPrice]}>Price</Text>
          <Text style={[styles.tableCol, styles.tableColTotal]}>Total</Text>
        </View>
        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableColDesc}>
              <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>{item.name}</Text>
              {item.description && <Text style={[styles.tableCol, { color: '#666', marginTop: 2 }]}>{item.description}</Text>}
            </View>
            <Text style={[styles.tableCol, styles.tableColQty]}>{item.quantity}</Text>
            <Text style={[styles.tableCol, styles.tableColPrice]}>${item.price.toFixed(2)}</Text>
            <Text style={[styles.tableCol, styles.tableColTotal]}>${item.total.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>${data.subtotal.toFixed(2)}</Text>
        </View>
        {data.tax > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalValue}>${data.tax.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>${data.total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Notes */}
      {data.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text style={styles.notesText}>{data.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        {data.footer || 'Thank you for your business!'}
      </Text>
    </Page>
  </Document>
);
