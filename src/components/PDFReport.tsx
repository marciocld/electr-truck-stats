import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0ea5e9',
  },
  logo: {
    width: 120,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  period: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e293b',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  cardUnit: {
    fontSize: 10,
    color: '#94a3b8',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    minHeight: 35,
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    justifyContent: 'center',
  },
  tableCellHeader: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    justifyContent: 'center',
  },
  tableCellSerie: {
    flex: 0.8,
  },
  tableCellData: {
    flex: 1,
  },
  tableCellNumeric: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
});

interface ReportData {
  companyLogo?: string;
  period: string;
  summary: {
    totalConsumption: number;
    totalDistance: number;
    consumptionPerKm: number;
  };
  detailedData: Array<{
    serie: string;
    date: string;
    accumulatedDistance: number;
    accumulatedConsumption: number;
    distance: number;
    consumption: number;
    consumptionPerKm: number;
  }>;
}

interface PDFReportProps {
  data: ReportData;
}

export const PDFReport: React.FC<PDFReportProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          {data.companyLogo && (
            <Image style={styles.logo} src={data.companyLogo} />
          )}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.title}>Relatório de Consumo</Text>
          <Text style={styles.period}>Período: {data.period}</Text>
        </View>
      </View>

      {/* Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Consumo Total</Text>
            <Text style={styles.cardValue}>{data.summary.totalConsumption.toFixed(2)}</Text>
            <Text style={styles.cardUnit}>kWh</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Distância Total</Text>
            <Text style={styles.cardValue}>{data.summary.totalDistance.toFixed(0)}</Text>
            <Text style={styles.cardUnit}>km</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Consumo por KM</Text>
            <Text style={styles.cardValue}>{data.summary.consumptionPerKm.toFixed(3)}</Text>
            <Text style={styles.cardUnit}>kWh/km</Text>
          </View>
        </View>
      </View>

      {/* Detailed Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Detalhados</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.tableCellSerie]}>Série</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellData]}>Data</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellNumeric]}>Dist. Acum.</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellNumeric]}>Cons. Acum.</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellNumeric]}>Distância</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellNumeric]}>Consumo</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellNumeric]}>Cons/KM</Text>
          </View>
          
          {/* Table Rows */}
          {data.detailedData.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellSerie]}>{row.serie}</Text>
              <Text style={[styles.tableCell, styles.tableCellData]}>{row.date}</Text>
              <Text style={[styles.tableCell, styles.tableCellNumeric]}>{row.accumulatedDistance.toFixed(0)}</Text>
              <Text style={[styles.tableCell, styles.tableCellNumeric]}>{row.accumulatedConsumption.toFixed(2)}</Text>
              <Text style={[styles.tableCell, styles.tableCellNumeric]}>{row.distance.toFixed(0)}</Text>
              <Text style={[styles.tableCell, styles.tableCellNumeric]}>{row.consumption.toFixed(2)}</Text>
              <Text style={[styles.tableCell, styles.tableCellNumeric]}>{row.consumptionPerKm.toFixed(3)}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export default PDFReport;