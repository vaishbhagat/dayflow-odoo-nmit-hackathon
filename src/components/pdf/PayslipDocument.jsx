import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { formatCurrency, getMonthName } from '@/lib/utils';

// Fonts for PDF (using standard Helvetica built-in, but styling appropriately)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#18181b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e4e4e7' },
  brand: { fontSize: 24, fontWeight: 'bold', color: '#4f46e5' },
  brandSub: { fontSize: 8, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  titleBox: { alignItems: 'flex-end' },
  title: { fontSize: 16, fontWeight: 'bold' },
  period: { fontSize: 10, color: '#71717a', marginTop: 4 },
  
  infoSection: { flexDirection: 'row', marginBottom: 40 },
  infoCol: { flex: 1, gap: 8 },
  infoRow: { flexDirection: 'row' },
  infoLabel: { width: 100, color: '#71717a', fontSize: 9 },
  infoValue: { fontWeight: 'bold', fontSize: 10 },
  
  tableHeader: { flexDirection: 'row', backgroundColor: '#f4f4f5', padding: 8, fontWeight: 'bold', fontSize: 9, color: '#52525b', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f4f4f5' },
  colDesc: { flex: 2 },
  colAmt: { flex: 1, textAlign: 'right' },
  
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#4f46e5' },
  
  totalsBox: { marginTop: 30, backgroundColor: '#f4f4f5', padding: 15, flexDirection: 'row', justifyContent: 'flex-end', gap: 20 },
  netLabel: { fontSize: 12, fontWeight: 'bold' },
  netValue: { fontSize: 16, fontWeight: 'bold', color: '#4f46e5' },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#a1a1aa', borderTopWidth: 1, borderTopColor: '#f4f4f5', paddingTop: 10 },
  watermark: { position: 'absolute', top: 300, left: 100, transform: 'rotate(-45deg)', fontSize: 80, color: '#f4f4f5', opacity: 0.5, zIndex: -1 }
});

export function PayslipDocument({ payroll, profile, month, year }) {
  if (!payroll || !profile) return null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>CONFIDENTIAL</Text>

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Dayflow</Text>
            <Text style={styles.brandSub}>HRMS Platform</Text>
          </View>
          <View style={styles.titleBox}>
            <Text style={styles.title}>SALARY SLIP</Text>
            <Text style={styles.period}>{getMonthName(month)} {year}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Employee Name:</Text><Text style={styles.infoValue}>{profile.full_name}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Employee ID:</Text><Text style={styles.infoValue}>{profile.employee_id}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Joining Date:</Text><Text style={styles.infoValue}>{profile.joining_date}</Text></View>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Department:</Text><Text style={styles.infoValue}>{profile.department}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Designation:</Text><Text style={styles.infoValue}>{profile.designation}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Status:</Text><Text style={styles.infoValue}>{profile.employment_status}</Text></View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>EARNINGS</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Component</Text>
          <Text style={styles.colAmt}>Amount</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>Basic Salary</Text>
          <Text style={styles.colAmt}>{formatCurrency(payroll.basic_salary)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>House Rent Allowance (HRA)</Text>
          <Text style={styles.colAmt}>{formatCurrency(payroll.hra)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>Other Allowances</Text>
          <Text style={styles.colAmt}>{formatCurrency(payroll.allowances)}</Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 30, color: '#ef4444' }]}>DEDUCTIONS</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Component</Text>
          <Text style={styles.colAmt}>Amount</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colDesc}>Total Deductions (Tax, PF, etc.)</Text>
          <Text style={styles.colAmt}>{formatCurrency(payroll.deductions)}</Text>
        </View>

        <View style={styles.totalsBox}>
          <Text style={styles.netLabel}>NET PAY:</Text>
          <Text style={styles.netValue}>{formatCurrency(payroll.net_salary)}</Text>
        </View>

        <Text style={styles.footer}>
          This is a computer-generated document and does not require a signature.
        </Text>
      </Page>
    </Document>
  );
}
