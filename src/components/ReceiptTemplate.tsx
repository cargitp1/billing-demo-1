import React from 'react';
import { ItemsData, PLATE_SIZES } from './ItemsTable';
import udharTemplate from '../assets/UdharReceiptTemplate_11zon.jpg';
import jamaTemplate from '../assets/JamaReceiptTemplate_11zon.jpg';

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
  items
}) => {
  const getQtyOrZero = (qty: number | undefined) => (qty || 0).toString();

  const sizes = PLATE_SIZES.reduce((acc, size, index) => {
    const sizeNum = index + 1;
    return {
      ...acc,
      [size]: {
        pattern: getQtyOrZero(items?.[`size_${sizeNum}_qty` as keyof typeof items] as number | undefined),
        detail: ''
      }
    };
  }, {} as Record<string, { pattern: string, detail: string }>);

  return (
    <div className="flex justify-center bg-gray-100" style={{ minHeight: '100vh', padding: '10px' }}>
      <div
        id="receipt-template"
        className="bg-white"
        style={{
          width: '1200px',
          height: '1697px',
          position: 'relative',
          boxSizing: 'border-box',
          backgroundImage: `url(${challanType === 'udhar' ? udharTemplate : jamaTemplate})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Challan Type Badge - Positioned on background */}
        <div style={{
          position: 'absolute',
          top: '150px',
          right: '80px',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#22c55e',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {challanType === 'jama' ? 'જમા ચલણ' : 'ઉધાર ચલણ'}
        </div>

        {/* Challan Number */}
        <div style={{
          position: 'absolute',
          top: '210px',
          left: '180px',
          fontSize: '24px',
          fontWeight: '600',
          color: '#166534'
        }}>
          {challanNumber}
        </div>

        {/* Date */}
        <div style={{
          position: 'absolute',
          top: '210px',
          right: '180px',
          fontSize: '24px',
          fontWeight: '600',
          color: '#166534'
        }}>
          {date}
        </div>

        {/* Client Name */}
        <div style={{
          position: 'absolute',
          top: '280px',
          left: '120px',
          fontSize: '22px',
          fontWeight: '600',
          color: '#166534',
          maxWidth: '650px'
        }}>
          {clientName}
        </div>

        {/* Driver/ID */}
        <div style={{
          position: 'absolute',
          top: '280px',
          right: '120px',
          fontSize: '22px',
          fontWeight: '600',
          color: '#166534',
          maxWidth: '250px'
        }}>
          {driverName || ''}
        </div>

        {/* Site */}
        <div style={{
          position: 'absolute',
          top: '340px',
          left: '120px',
          fontSize: '22px',
          fontWeight: '600',
          color: '#166534',
          maxWidth: '1000px'
        }}>
          {site}
        </div>

        {/* Phone */}
        <div style={{
          position: 'absolute',
          top: '400px',
          left: '160px',
          fontSize: '22px',
          fontWeight: '600',
          color: '#166534'
        }}>
          {phone}
        </div>

        {/* Items Quantities - Positioned over background table */}
        {Object.entries(sizes).map(([size, value], index) => {
          const topPosition = 480 + (index * 115);
          return (
            <div
              key={size}
              style={{
                position: 'absolute',
                top: `${topPosition}px`,
                left: '320px',
                fontSize: '26px',
                fontWeight: '600',
                color: '#166534',
                textAlign: 'center',
                width: '120px'
              }}
            >
              {value.pattern}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReceiptTemplate;