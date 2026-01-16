import React from 'react';
import { format } from 'date-fns';
import './BillInvoice.css';
import { formatIndianCurrency } from '../utils/currencyFormat';

interface BillInvoiceProps {
  companyDetails: {
    name: string;
    address: string;
    phone: string;
    gst?: string;
  };
  billDetails: {
    billNumber: string;
    billDate: string;
    fromDate: string;
    toDate: string;
    dailyRent: number;
  };
  clientDetails: {
    name: string;
    nicName: string;
    site: string;
    phone: string;
  };
  rentalCharges: {
    size: string;
    pieces: number;
    days: number;
    rate: number;
    amount: number;
    startDate?: string;
    endDate?: string;
    causeType?: 'udhar' | 'jama';
  }[];
  extraCosts: {
    id: string;
    date: string;
    description: string;
    amount: number;
  }[];
  discounts: {
    id: string;
    date: string;
    description: string;
    amount: number;
  }[];
  payments: {
    id: string;
    date: string;
    method: string;
    note: string;
    amount: number;
  }[];
  summary: {
    totalRent: number;
    totalUdharPlates: number;
    totalJamaPlates: number;
    netPlates: number;
    serviceCharge: number;
    totalExtraCosts: number;
    discounts: number;
    grandTotal: number;
    totalPaid: number;
    advancePaid: number;
    duePayment: number;
  };
  mainNote?: string;
}

const BillInvoiceTemplate: React.FC<BillInvoiceProps> = ({
  companyDetails, // Now used
  billDetails,
  clientDetails,
  rentalCharges,
  extraCosts: _extraCosts, // Keep unused
  discounts: _discounts, // Keep unused
  payments: _payments, // Keep unused
  summary,
  mainNote: _mainNote, // Keep unused
}) => {
  return (
    <div className="invoice-container" style={{
      padding: '30px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: '"Arya", "Noto Sans Gujarati", sans-serif',
      backgroundColor: '#fff',
      color: '#000'
    }}>
      <div style={{ border: '2px solid #000', padding: '0', position: 'relative', minHeight: '900px', display: 'flex', flexDirection: 'column' }}>

        {/* Header Section */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', padding: '15px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>|| શ્રી ગણેશાય નમઃ ||</div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', margin: '5px 0', lineHeight: '1.2' }}>નીલકંઠ પ્લેટ ડેપો</h1>
          <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '5px' }}>
            {/* Add company address/phone if available in props, otherwise hardcode layout placeholders */}
            {companyDetails.address && <span>{companyDetails.address}</span>}
            {companyDetails.phone && <span style={{ marginLeft: '15px' }}>મો. {companyDetails.phone}</span>}
          </div>
        </div>

        {/* Bill Meta Data */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #000', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '60%' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', width: '90px', fontSize: '16px' }}>ગ્રાહક નામ:</span>
              <span style={{ borderBottom: '1px dotted #000', flex: 1, fontWeight: '700', fontSize: '18px', paddingLeft: '5px' }}>{clientDetails.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', width: '90px', fontSize: '16px' }}>સાઈટ:</span>
              <span style={{ borderBottom: '1px dotted #000', flex: 1, fontSize: '16px', paddingLeft: '5px' }}>{clientDetails.site}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '35%' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', width: '80px', fontSize: '16px' }}>બિલ નં.:</span>
              <span style={{ borderBottom: '1px dotted #000', flex: 1, color: '#dc2626', fontWeight: '800', fontSize: '18px', paddingLeft: '5px' }}>{billDetails.billNumber}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 'bold', width: '80px', fontSize: '16px' }}>તારીખ:</span>
              <span style={{ borderBottom: '1px dotted #000', flex: 1, fontWeight: '600', fontSize: '16px', paddingLeft: '5px' }}>{format(new Date(billDetails.billDate), 'dd/MM/yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="rental-section" style={{ padding: '0', flex: 1 }}>
          <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#e5e7eb', borderBottom: '1px solid #000' }}>
                <th style={{ borderRight: '1px solid #000', padding: '12px', textAlign: 'left', width: '45%' }}>સમયગાળો (તારીખ)</th>
                <th style={{ borderRight: '1px solid #000', padding: '12px', textAlign: 'center' }}>સ્ટોક</th>
                <th style={{ borderRight: '1px solid #000', padding: '12px', textAlign: 'center' }}>દિવસ</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>રકમ (₹)</th>
              </tr>
            </thead>
            <tbody>
              {rentalCharges.map((charge, index) => {
                const rowStartDate = charge.startDate ? new Date(charge.startDate) : new Date(billDetails.fromDate);
                const rowEndDate = charge.endDate ? new Date(charge.endDate) : new Date(billDetails.toDate);
                const statusColor = charge.causeType === 'jama' ? '#16a34a' : '#dc2626';

                return (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ borderRight: '1px solid #000', padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: statusColor,
                          flexShrink: 0
                        }}></div>
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>
                          {format(rowStartDate, 'dd/MM/yyyy')} થી {format(rowEndDate, 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </td>
                    <td style={{ borderRight: '1px solid #000', padding: '10px 12px', textAlign: 'center', fontWeight: '600', fontSize: '16px' }}>{charge.pieces}</td>
                    <td style={{ borderRight: '1px solid #000', padding: '10px 12px', textAlign: 'center', fontSize: '16px' }}>{charge.days}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', fontSize: '16px' }}>{formatIndianCurrency(charge.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Summary Area */}
        <div style={{ borderTop: '2px solid #000', display: 'flex' }}>
          {/* Left Side: Terms / Signature */}
          <div style={{ width: '60%', padding: '15px', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>
              <span style={{ textDecoration: 'underline', fontWeight: 'bold', color: '#000' }}>શરતો:</span><br />
              1. વ્યાજ ૧૮% લેખે ગણવામાં આવશે.<br />
              2. માલની જવાબદારી ગ્રાહકની રહેશે.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'center', width: '45%' }}>
                <div style={{ borderTop: '1px dashed #9ca3af', padding: '5px', fontSize: '14px' }}>ગ્રાહક સહી</div>
              </div>
              <div style={{ textAlign: 'center', width: '45%' }}>
                <div style={{ borderTop: '1px dashed #9ca3af', padding: '5px', fontSize: '14px', fontWeight: 'bold' }}>નીલકંઠ પ્લેટ ડેપો વતી</div>
              </div>
            </div>
          </div>

          {/* Right Side: Totals */}
          <div style={{ width: '40%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>કુલ રકમ:</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: '600', fontSize: '16px' }}>{formatIndianCurrency(summary.grandTotal)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#16a34a' }}>ચુકવેલ:</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: '700', color: '#16a34a', fontSize: '16px' }}>{formatIndianCurrency(summary.totalPaid)}</td>
                </tr>
                {summary.discounts > 0 && (
                  <tr>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>ડિસ્કાઉન્ટ:</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>{formatIndianCurrency(summary.discounts)}</td>
                  </tr>
                )}
                <tr style={{ backgroundColor: '#fee2e2' }}>
                  <td style={{ padding: '15px 12px', borderTop: '2px solid #000', fontWeight: '800', fontSize: '18px', color: '#dc2626' }}>બાકી રકમ:</td>
                  <td style={{ padding: '15px 12px', borderTop: '2px solid #000', textAlign: 'right', fontWeight: '800', fontSize: '20px', color: '#dc2626' }}>{formatIndianCurrency(summary.duePayment)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BillInvoiceTemplate;