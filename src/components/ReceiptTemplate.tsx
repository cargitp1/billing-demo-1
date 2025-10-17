import React from 'react';
import { ItemsData, PLATE_SIZES } from './ItemsTable';

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
  // Ensure items exists and has the required properties
  const getQtyOrZero = (qty: number | undefined) => (qty || 0).toString();

  // Convert items data to sizes format using PLATE_SIZES
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
    <div id="receipt-template" className="flex justify-center p-8 bg-gray-100">
      <div className="w-full max-w-4xl bg-white" style={{ border: '4px solid #c84545' }}>
        {/* Header */}
        <div className="relative" style={{ borderBottom: '3px solid #c84545' }}>
          <div className="flex items-start p-4">
            {/* Logo Box */}
            <div className="flex-shrink-0 mr-4" style={{ width: '80px', height: '100px', border: '2px solid #c84545', backgroundColor: '#f5a8a8' }}>
              <div className="mt-1 text-xs text-center">©←</div>
              <div className="flex items-center justify-center h-full text-5xl font-bold text-red-700" style={{ marginTop: '-20px' }}>PB</div>
            </div>
            
            {/* Center Content */}
            <div className="flex-1 text-center">
              <div className="mb-1 text-sm" style={{ color: '#c84545' }}>દાયકાકા<br/>રુપાવટીવાળા</div>
              <div className="mb-1 text-4xl font-bold" style={{ color: '#c84545' }}>શ્રી 9<br/>શ્રી ગણેશાય નમઃ</div>
            </div>

            {/* Right Side Contact */}
            <div className="flex-shrink-0 text-sm text-right" style={{ color: '#c84545' }}>
              <div>સુરેશભાઈ પોવારા - ૯૩૨૬૮ ૨૮૨૨૮</div>
              <div>હરેશભાઈ કૃમર - ૯૭૩૯૯ ૧૨૫૧૬</div>
              <div>હરેશભાઈ પોવારા - ૯૦૯૬૨ ૬૪૪૩૬</div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="flex" style={{ borderBottom: '3px solid #c84545' }}>
          <div className="flex-1 p-3 text-center">
            <div className="text-5xl font-bold" style={{ color: '#c84545' }}>નિલંકઠે</div>
            <div className="mt-1 text-sm" style={{ color: '#c84545' }}>કોઈપણ સાઈઝની સેન્ટિંગ પ્લેટ ભાડેથી મળશે.</div>
          </div>
          <div className="p-3 text-center" style={{ borderLeft: '3px solid #c84545', minWidth: '200px' }}>
            <div className="text-3xl font-bold" style={{ color: '#c84545' }}>પ્લેટ ડેપો</div>
            <div className="px-4 py-1 mt-2 text-2xl font-bold" style={{ border: '2px solid #c84545', borderRadius: '20px', color: '#c84545', display: 'inline-block' }}>ઉધાર ચલણ</div>
          </div>
        </div>

        {/* Challan Number and Date */}
        <div className="flex" style={{ borderBottom: '2px solid #c84545' }}>
          <div className="flex items-center flex-1 p-2" style={{ borderRight: '2px solid #c84545' }}>
            <span className="mr-2 font-bold" style={{ color: '#c84545' }}>ચલણ નંબર :</span>
            <input 
              type="text" 
              className="flex-1 px-2 border-b border-gray-400 outline-none"
              value={challanNumber}
              readOnly={true}
            ></input>
          </div>
          <div className="flex items-center p-2" style={{ minWidth: '300px' }}>
            <span className="mr-2 font-bold" style={{ color: '#c84545' }}>તારીખ :</span>
            <input 
              type="text" 
              className="flex-1 px-2 border-b border-gray-400 outline-none"
              value={date}
              readOnly={true}
            ></input>
          </div>
        </div>

        {/* Customer Details */}
        <div className="p-3" style={{ borderBottom: '3px solid #c84545' }}>
          <div className="flex mb-2">
            <div className="flex items-center flex-1">
              <span className="mr-2 font-bold" style={{ color: '#c84545' }}>નામ:</span>
              <input 
                type="text" 
                className="flex-1 px-2 border-b border-gray-400 outline-none"
                value={clientName}
                readOnly={true}
              ></input>
            </div>
            <div className="flex items-center ml-8" style={{ minWidth: '200px' }}>
              <span className="mr-2 font-bold" style={{ color: '#c84545' }}>Driver:</span>
              <input 
                type="text" 
                className="flex-1 px-2 border-b border-gray-400 outline-none"
                value={driverName || ''}
                readOnly={true}
              ></input>
            </div>
          </div>
          <div className="flex mb-2">
            <span className="mr-2 font-bold" style={{ color: '#c84545' }}>સાઈટ:</span>
            <input 
              type="text" 
              className="flex-1 px-2 border-b border-gray-400 outline-none"
              value={site}
              readOnly={true}
            ></input>
          </div>
          <div className="flex">
            <span className="mr-2 font-bold" style={{ color: '#c84545' }}>મોબાઇલ:</span>
            <input 
              type="text" 
              className="flex-1 px-2 border-b border-gray-400 outline-none"
              value={phone}
              readOnly={true}
            ></input>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#c84545', color: 'white' }}>
              <th className="p-2 font-bold" style={{ border: '2px solid #c84545', width: '15%' }}>સાઈઝ</th>
              <th className="p-2 font-bold" style={{ border: '2px solid #c84545', width: '25%' }}>પ્લેટનંગ</th>
              <th className="p-2 font-bold" style={{ border: '2px solid #c84545', width: '25%' }}></th>
              <th className="p-2 font-bold" style={{ border: '2px solid #c84545', width: '35%' }}>વિગત</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sizes).map(([size, value], index) => {
              const displaySize = size;
              const isLastRow = index === Object.entries(sizes).length - 1;
              
              return (
                <tr key={size}>
                  <td className="p-2 font-bold text-center" style={{ border: '2px solid #c84545', color: '#c84545' }}>
                    {displaySize}
                  </td>
                  <td className="p-1" style={{ border: '2px solid #c84545' }}>
                    <input 
                      type="text" 
                      className="w-full px-2 outline-none"
                      value={value.pattern}
                      readOnly={true}
                    ></input>
                  </td>
                  <td className="p-1" style={{ border: '2px solid #c84545' }}>
                    {isLastRow && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center" style={{ width: '120px', border: '2px solid #c84545' }}>
                          <div className="py-1 text-xs" style={{ backgroundColor: '#f5a8a8', borderBottom: '2px solid #c84545' }}>©←</div>
                          <div className="py-4 text-4xl font-bold" style={{ color: '#c84545' }}>PB</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-1" style={{ border: '2px solid #c84545' }} rowSpan={isLastRow ? 1 : undefined}>
                    {isLastRow ? (
                      <div className="p-2 text-xs" style={{ color: '#c84545' }}>
                        <div className="mb-1 font-bold">Driver: {driverName || 'N/A'}</div>
                        <div className="text-xs leading-relaxed">પ્લેટ લેવા તથા મુકવા આવો ત્યારે ફોન કરીને આવવું. બપોરે ૧૨.૩૦ થી ૨.૩૦ વાગ્યા સુધી બંધ રહેશે.</div>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        className="w-full px-2 outline-none"
                        value={value.detail}
                        readOnly={true}
                      ></input>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Notes Section */}
        <div className="p-3 text-xs leading-relaxed" style={{ borderTop: '2px solid #c84545', borderBottom: '2px solid #c84545', color: '#c84545' }}>
          <div className="mb-2">
            <span className="font-bold">નોંધ :- (૧)</span> સેન્ટિંગ પ્લેટની ડીલીવરી આપ્યા પછી તમામ જવાબદારી કોન્ટ્રાક્ટર ના શીરે રહેશે. <span className="font-bold">(૨)</span> સેન્ટીંગ પ્લેટ ખોવાય અથવા તુટી જાય તો તેના રુપિયા નુકસાની અલગથી આપવાની રહેશે. <span className="font-bold">(૩)</span> હર રવિવારે તથા જાહેર તહેવારે દુકાન બંધ રહેશે. <span className="font-bold">(૪)</span> ભરના ઉતારવાની મજૂરી <span className="font-bold">.1.5</span>... રૂ. નંગ દીઠ ઓડકે આપવાની રહેશે.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: '2px solid #c84545' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="mr-2 font-bold" style={{ color: '#c84545' }}>આથી હું સહી કરનાર લખી આપુ છુ મને પ્લેટ નંગ ..................... મળેલ છે.</span>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center">
              <span className="mr-2 font-bold" style={{ color: '#c84545' }}>લેનારની સહી</span>
              <input 
                type="text" 
                className="px-2 border-b border-gray-400 outline-none"
                style={{ width: '200px' }}
                value="_________________"
                readOnly={true}
              ></input>
            </div>
            <div className="flex items-center">
              <span className="mr-2 font-bold" style={{ color: '#c84545' }}>આપનારની સહી</span>
              <input 
                type="text" 
                className="px-2 border-b border-gray-400 outline-none"
                style={{ width: '200px' }}
                value="_________________"
                readOnly={true}
              ></input>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptTemplate;