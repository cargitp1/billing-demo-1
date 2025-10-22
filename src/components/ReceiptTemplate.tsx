import React from 'react';
import { ItemsData, PLATE_SIZES } from './ItemsTable';
import udharTemplate from '../assets/UdharReceiptTemplate_11zon.jpg';
import jamaTemplate from '../assets/JamaReceiptTemplate_11zon.jpg';

interface ReceiptTemplateProps {
  challanType: 'udhar' | 'jama';
  challanNumber: string;
  date: string;
  clientName: string;
  clientSortName?: string;
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
  clientSortName,
  site,
  phone,
  driverName,
  items
}) => {
  const getQtyOrZero = (qty: number | undefined) => (qty || 0).toString();

  // Helper function to convert coordinates to pixel positions
  const getPosition = (x: number, y: number) => ({
    left: `${x}px`,
    top: `${y}px`,
  });

  // Define coordinates for each element
  const coordinates = {
    challanType: { x: 80, y: 150},
    challanNumber: { x: 230, y: 380 },
    date: { x: 880, y: 380},
    clientName: { x: 200, y: 468},
    clientSortName: { x: 938, y: 468},  
    driverId: { x: 120, y: 280},
    site: { x: 200, y: 518 },
    phone: { x: 200, y: 564 },
    itemsStart: { x: 320, y: 480, increment: 115 }
  };

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
          ...getPosition(coordinates.challanType.x, coordinates.challanType.y),
          left: `${coordinates.challanType.x}px`,
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#000000',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {challanType === 'jama' ? 'જમા ચલણ' : 'ઉધાર ચલણ'}
        </div>

        {/* Challan Number */}
        <div style={{
          position: 'absolute',
          ...getPosition(coordinates.challanNumber.x, coordinates.challanNumber.y),
          fontSize: '26px',
          fontWeight: '750',
          color: '#000000'
        }}>
          {challanNumber}
        </div>

        {/* Date */}
        <div style={{
          position: 'absolute',
          ...getPosition(coordinates.date.x, coordinates.date.y),
          left: `${coordinates.date.x}px`,
          fontSize: '26px',
          fontWeight: '750',
          color: '#000000'
        }}>
          {date}
        </div>

        {/* Client Name */}
        <div style={{
          position: 'absolute',
          ...getPosition(coordinates.clientName.x, coordinates.clientName.y),
          fontSize: '26px',
          fontWeight: '750',
          color: '#000000',
          maxWidth: '650px'
        }}>
          {clientName}
        </div>

        {/* Client Sort Name */}
                {/* Client Sort Name */}
        {clientSortName && (
          <div style={{
            position: 'absolute',
            ...getPosition(coordinates.clientSortName.x, coordinates.clientSortName.y),
            fontSize: '26px',
            fontWeight: '750',
            color: '#000000'
          }}>
            {clientSortName}
          </div>
        )}

        {/* Driver/ID */}
        <div style={{
          position: 'absolute',
          ...getPosition(coordinates.driverId.x, coordinates.driverId.y),
          right: coordinates.driverId.align === 'right' ? `${coordinates.driverId.x}px` : undefined,
          fontSize: '26px',
          fontWeight: '750',
          color: '#000000',
          maxWidth: '250px'
        }}>
          {driverName || ''}
        </div>

        {/* Site */}
        <div style={{
          position: 'absolute',
          ...getPosition(coordinates.site.x, coordinates.site.y),
          fontSize: '26px',
          fontWeight: '750',
          color: '#000000',
          maxWidth: '1000px'
        }}>
          {site}
        </div>

        {/* Phone */}
        <div style={{
          position: 'absolute',
          ...getPosition(coordinates.phone.x, coordinates.phone.y),
          fontSize: '26px',
          fontWeight: '750',
          color: '#000000'
        }}>
          {phone}
        </div>

        {/* Items Quantities - Positioned over background table */}
        {Object.entries(sizes).map(([size, value], index) => {
          const y = coordinates.itemsStart.y + (index * coordinates.itemsStart.increment);
          return (
            <div
              key={size}
              style={{
                position: 'absolute',
                ...getPosition(coordinates.itemsStart.x, y),
                fontSize: '26px',
                fontWeight: '600',
                color: '#000000',
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