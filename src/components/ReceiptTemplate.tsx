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
  const getQtyOrZero = (qty: number | undefined) => qty ? qty.toString() : '';

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
    driverId: { x: 952, y: 1155},
    site: { x: 200, y: 518 },
    phone: { x: 200, y: 564 },
    itemsStart: { x: 320, y: 721, increment: 63.5 },
    borrowedStockStart: { x: 550, y: 721, increment: 63.5 },
    notesStart: { x: 640, y: 721, increment: 63.5 },
    mainNotes: { x: 150, y: 1534 }
  };

  const sizes = PLATE_SIZES.reduce((acc, size, index) => {
    const sizeNum = index + 1;
    const qty = items?.[`size_${sizeNum}_qty` as keyof typeof items] as number | undefined;
    const borrowedStock = items?.[`size_${sizeNum}_borrowed` as keyof typeof items] as number | undefined;
    const note = items?.[`size_${sizeNum}_note` as keyof typeof items] as string | undefined;
    
    return {
      ...acc,
      [size]: {
        pattern: getQtyOrZero(qty),
        borrowedStock: getQtyOrZero(borrowedStock),
        note: note || ''
      }
    };
  }, {} as Record<string, { pattern: string, borrowedStock: string, note: string }>);

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
          left: `${coordinates.driverId.x}px`,
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
            <React.Fragment key={size}>
              {/* Regular Quantity */}
              <div
                style={{
                  position: 'absolute',
                  ...getPosition(coordinates.itemsStart.x, y),
                  fontSize: '26px',
                  fontWeight: '750',
                  color: '#000000',
                  textAlign: 'center',
                  width: '120px'
                }}
              >
                {value.pattern}
              </div>
              
              {/* Borrowed Stock */}
              {value.borrowedStock && (
                <div
                  style={{
                    position: 'absolute',
                    ...getPosition(coordinates.borrowedStockStart.x, y),
                    fontSize: '26px',
                    fontWeight: '750',
                    color: '#000000', 
                    textAlign: 'center',
                    width: '120px'
                  }}
                >
                  {value.borrowedStock}
                </div>
              )}

              {/* Notes */}
              {value.note && (
                <div
                  style={{
                    position: 'absolute',
                    ...getPosition(coordinates.notesStart.x, y),
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#666666',
                    textAlign: 'left',
                    width: '200px'
                  }}
                >
                  {value.note}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Main Notes */}
        {items.main_note && (
          <div style={{
            position: 'absolute',
            ...getPosition(coordinates.mainNotes.x, coordinates.mainNotes.y),
            fontSize: '26px',
            fontWeight: '750',
            color: '#000000',
            maxWidth: '800px'
          }}>
            {items.main_note}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptTemplate;