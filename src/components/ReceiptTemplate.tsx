import React from 'react';
import { format } from 'date-fns';
import { ItemsData } from './ItemsTable';

interface ReceiptTemplateProps {
  challanType: 'udhar' | 'jama';
  challanNumber: string;
  date: string;
  clientName: string;
  site: string;
  phone: string;
  driverName?: string;
  items: ItemsData;
}

const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({
  challanType,
  challanNumber,
  date,
  clientName,
  site,
  phone,
  driverName,
  items,
}) => {
  return (
    <div id="receipt-template" style={{ width: '1200px', padding: '40px', backgroundColor: 'white', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', borderBottom: '3px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>NILKANTH PLAT DEPO</h1>
        <h2 style={{ fontSize: '28px', margin: '0', fontWeight: 'normal' }}>નીલકંઠ પ્લેટ ડેપો</h2>
      </div>

      <div style={{ textAlign: 'center', backgroundColor: '#f3f4f6', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
          {challanType === 'udhar' ? 'UDHAR CHALLAN / ઉધાર ચલણ' : 'JAMA CHALLAN / જમા ચલણ'}
        </h2>
      </div>

      <div style={{ marginBottom: '20px', lineHeight: '1.8', fontSize: '18px' }}>
        <p style={{ margin: '8px 0' }}><strong>Challan No. / ચલણ નંબર:</strong> {challanNumber}</p>
        <p style={{ margin: '8px 0' }}><strong>Date / તારીખ:</strong> {format(new Date(date), 'dd/MM/yyyy')}</p>
        <p style={{ margin: '8px 0' }}><strong>Client / ક્લાયન્ટ:</strong> {clientName}</p>
        <p style={{ margin: '8px 0' }}><strong>Site / સાઇટ:</strong> {site}</p>
        <p style={{ margin: '8px 0' }}><strong>Phone / ફોન:</strong> {phone}</p>
        {driverName && <p style={{ margin: '8px 0' }}><strong>Driver / ડ્રાઇવર:</strong> {driverName}</p>}
      </div>

      <div style={{ border: '2px solid #000', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#e5e7eb', padding: '12px', borderBottom: '2px solid #000' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0', textAlign: 'center' }}>ITEMS / વસ્તુઓ</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #000' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '16px', borderRight: '1px solid #d1d5db' }}>
                Size / સાઇઝ
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '16px', borderRight: '1px solid #d1d5db' }}>
                Qty / સંખ્યા
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '16px', borderRight: '1px solid #d1d5db' }}>
                Borrowed / ઉધાર સ્ટોક
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '16px' }}>
                Note / નોંધ
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((size, index) => (
              <tr key={size} style={{ borderBottom: index < 8 ? '1px solid #d1d5db' : 'none' }}>
                <td style={{ padding: '10px', fontSize: '16px', borderRight: '1px solid #d1d5db' }}>{size}</td>
                <td style={{ padding: '10px', fontSize: '16px', borderRight: '1px solid #d1d5db' }}>
                  {items[`size_${size}_qty` as keyof ItemsData]}
                </td>
                <td style={{ padding: '10px', fontSize: '16px', borderRight: '1px solid #d1d5db' }}>
                  {items[`size_${size}_borrowed` as keyof ItemsData]}
                </td>
                <td style={{ padding: '10px', fontSize: '16px' }}>
                  {items[`size_${size}_note` as keyof ItemsData]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.main_note && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #d1d5db' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '18px' }}>Main Note / મુખ્ય નોંધ:</p>
          <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.6' }}>{items.main_note}</p>
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: '16px', color: '#6b7280', paddingTop: '20px', borderTop: '1px solid #d1d5db' }}>
        <p style={{ margin: '0' }}>Generated / બનાવ્યું: {format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
      </div>
    </div>
  );
};

export default ReceiptTemplate;
