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
    extraCosts: number;
    discounts: number;
    grandTotal: number;
    totalPaid: number;
    advancePaid: number;
    duePayment: number;
  };
  mainNote?: string;
}

const BillInvoiceTemplate: React.FC<BillInvoiceProps> = ({
  companyDetails,
  billDetails,
  clientDetails,
  rentalCharges,
  extraCosts,
  discounts,
  payments,
  summary,
  mainNote,
}) => {
  return (
    <div className="invoice-container">
      {/* Company Header */}
      <div className="invoice-header">
        <h1>{companyDetails.name}</h1>
        <h2>નીલકંઠ પ્લેટ ડેપો</h2>
        <div className="company-info">
          <p>Address: {companyDetails.address}</p>
          <p>Phone: {companyDetails.phone}</p>
          {companyDetails.gst && <p>GST: {companyDetails.gst}</p>}
        </div>
      </div>

      {/* Invoice Title */}
      <div className="invoice-title">
        <h2>TAX INVOICE / કર ભરતિયું</h2>
      </div>

      {/* Bill and Client Details */}
      <div className="invoice-meta">
        <div>
          <p><strong>Bill No:</strong> {billDetails.billNumber}</p>
          <p><strong>Bill Date:</strong> {format(new Date(billDetails.billDate), 'dd/MM/yyyy')}</p>
          <p><strong>From Date:</strong> {format(new Date(billDetails.fromDate), 'dd/MM/yyyy')}</p>
          <p><strong>To Date:</strong> {format(new Date(billDetails.toDate), 'dd/MM/yyyy')}</p>
        </div>
        <div>
          <p><strong>Client Name:</strong> {clientDetails.name}</p>
          <p><strong>Site:</strong> {clientDetails.site}</p>
          <p><strong>Phone:</strong> {clientDetails.phone}</p>
        </div>
      </div>

      {/* Rental Charges */}
      <div className="rental-section">
        <h3 className="section-title">RENTAL CHARGES / ભાડા શુલ્ક</h3>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Pieces</th>
              <th>Days</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rentalCharges.map((charge, index) => (
              <tr key={index}>
                <td>{charge.size}</td>
                <td>{charge.pieces}</td>
                <td>{charge.days}</td>
                <td>{formatIndianCurrency(charge.rate)}</td>
                <td>{formatIndianCurrency(charge.amount)}</td>
              </tr>
            ))}
              <tr className="table-footer">
              <td colSpan={4}>Total Rental Charges / કુલ ભાડા શુલ્ક:</td>
              <td>{formatIndianCurrency(summary.totalRent)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Extra Costs */}
      {extraCosts.length > 0 && (
        <div className="extra-costs-section">
          <h3 className="section-title">EXTRA COSTS / વધારાનો ખર્ચ</h3>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {extraCosts.map((cost) => (
                <tr key={cost.id}>
                  <td>{format(new Date(cost.date), 'dd/MM/yyyy')}</td>
                  <td>{cost.description}</td>
                  <td>{formatIndianCurrency(cost.amount)}</td>
                </tr>
              ))}
              <tr className="table-footer">
                <td colSpan={2}>Total Extra Costs:</td>
                <td>{formatIndianCurrency(summary.extraCosts)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Discounts */}
      {discounts.length > 0 && (
        <div className="discounts-section">
          <h3 className="section-title">DISCOUNTS / છૂટ</h3>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount) => (
                <tr key={discount.id}>
                  <td>{format(new Date(discount.date), 'dd/MM/yyyy')}</td>
                  <td>{discount.description}</td>
                  <td>{formatIndianCurrency(discount.amount)}</td>
                </tr>
              ))}
              <tr className="table-footer">
                <td colSpan={2}>Total Discounts:</td>
                <td>{formatIndianCurrency(summary.discounts)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Bill Summary */}
      <div className="summary-section">
        <h3 className="section-title">BILL SUMMARY / બિલ સારાંશ</h3>
        <table className="summary-table">
          <tbody>
            <tr className="summary-row">
              <td>Total Rent:</td>
              <td>{formatIndianCurrency(summary.totalRent)}</td>
            </tr>
            <tr className="summary-row">
              <td>Total Plates (Udhar):</td>
              <td>{summary.totalUdharPlates}</td>
            </tr>
            <tr className="summary-row">
              <td>Total Plates (Jama):</td>
              <td>{summary.totalJamaPlates}</td>
            </tr>
            <tr className="summary-row">
              <td>Net Plates:</td>
              <td>{summary.netPlates}</td>
            </tr>
            <tr className="summary-row">
              <td>Service Charge:</td>
              <td>{formatIndianCurrency(summary.serviceCharge)}</td>
            </tr>
            <tr className="summary-row">
              <td>Extra Costs:</td>
              <td>{formatIndianCurrency(summary.extraCosts)}</td>
            </tr>
            <tr className="summary-row">
              <td>Discounts:</td>
              <td>{formatIndianCurrency(summary.discounts)}</td>
            </tr>
            <tr className="summary-row">
              <td>Advance Paid:</td>
              <td>{formatIndianCurrency(summary.advancePaid)}</td>
            </tr>
            <tr className="summary-row">
              <td>Total Paid:</td>
              <td>{formatIndianCurrency(summary.totalPaid)}</td>
            </tr>
            <tr className="summary-row grand-total-row">
              <td>GRAND TOTAL:</td>
              <td>{formatIndianCurrency(summary.grandTotal)}</td>
            </tr>
            <tr className="summary-row due-payment-row">
              <td>DUE PAYMENT:</td>
              <td>{formatIndianCurrency(summary.duePayment)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Details */}
      {payments.length > 0 && (
        <div className="payments-section">
          <h3 className="section-title">PAYMENT DETAILS / ચુકવણી વિગતો</h3>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Note</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{format(new Date(payment.date), 'dd/MM/yyyy')}</td>
                  <td>{payment.method}</td>
                  <td>{payment.note}</td>
                  <td>{formatIndianCurrency(payment.amount)}</td>
                </tr>
              ))}
              <tr className="table-footer">
                <td colSpan={3}>Total Paid:</td>
                <td>{formatIndianCurrency(summary.totalPaid)}</td>
              </tr>
              <tr className="table-footer due-payment-row">
                <td colSpan={3}>DUE PAYMENT:</td>
                <td>{formatIndianCurrency(summary.duePayment)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="terms-section">
        {mainNote && (
          <div className="main-note">
            <h4 className="section-title">NOTES / નોંધ</h4>
            <p>{mainNote}</p>
          </div>
        )}
        
        <h4 className="section-title">Terms & Conditions:</h4>
        <ul className="terms-list">
          <li>Payment due within 7 days</li>
          <li>Late payment charges applicable</li>
        </ul>
      </div>

      <div className="footer-section">
        <p>Generated on: {format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
        <div>
          <p>Authorized Signature</p>
          <div className="signature-line"></div>
        </div>
      </div>

      {/* Extra Costs */}
      {extraCosts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ borderBottom: '1px solid #000', paddingBottom: '5px' }}>
            EXTRA COSTS / વધારાનો ખર્ચ
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Date</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Description</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {extraCosts.map((cost, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{format(new Date(cost.date), 'dd/MM/yyyy')}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{cost.description}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>₹{cost.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                  <strong>Total Extra Costs:</strong>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                  <strong>₹{summary.extraCosts.toLocaleString('en-IN')}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Discounts */}
      {discounts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ borderBottom: '1px solid #000', paddingBottom: '5px' }}>
            DISCOUNTS / છૂટ
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Date</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Description</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{format(new Date(discount.date), 'dd/MM/yyyy')}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{discount.description}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>₹{discount.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



      {/* Payment Details */}
      {payments.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ borderBottom: '1px solid #000', paddingBottom: '5px' }}>
            PAYMENT DETAILS / ચુકવણી વિગતો
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Date</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Method</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Note</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{format(new Date(payment.date), 'dd/MM/yyyy')}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{payment.method}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{payment.note}</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>₹{payment.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                  <strong>Total Paid:</strong>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                  <strong>₹{summary.totalPaid.toLocaleString('en-IN')}</strong>
                </td>
              </tr>
              <tr>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                  <strong>DUE PAYMENT:</strong>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', color: summary.duePayment > 0 ? '#dc2626' : '#059669' }}>
                  <strong>₹{summary.duePayment.toLocaleString('en-IN')}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Notes and Terms */}
      <div style={{ marginTop: '20px' }}>
        {mainNote && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ borderBottom: '1px solid #000', paddingBottom: '5px' }}>NOTES / નોંધ</h3>
            <p style={{ marginTop: '10px' }}>{mainNote}</p>
          </div>
        )}

        <div>
          <h3 style={{ borderBottom: '1px solid #000', paddingBottom: '5px' }}>Terms & Conditions:</h3>
          <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Payment due within 7 days</li>
            <li>Late payment charges applicable</li>
          </ol>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p>Generated on: {format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #000', paddingTop: '5px', width: '200px', textAlign: 'center' }}>
              Authorized Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillInvoiceTemplate;