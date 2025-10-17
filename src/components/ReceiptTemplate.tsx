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
      <div className="bg-white" style={{ 
        width: '210mm', 
        height: '297mm',
        border: '4px solid #22c55e',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div className="relative" style={{ borderBottom: '3px solid #22c55e' }}>
          <div className="flex items-start gap-2" style={{ padding: '10px' }}>
            {/* Logo Box */}
            <div className="flex-shrink-0" style={{ width: '60px', height: '75px', border: '3px solid #22c55e', backgroundColor: '#86efac' }}>
              <div className="text-xs font-bold text-center" style={{ marginTop: '2px' }}>©←</div>
              <div className="flex items-center justify-center text-4xl font-bold" style={{ color: '#22c55e', height: 'calc(100% - 16px)' }}>PB</div>
            </div>
            
            {/* Center Content */}
            <div className="flex-1 text-center">
              <div className="text-xs font-bold" style={{ color: '#22c55e', marginBottom: '4px' }}>દાયકાકા<br/>રૂપાવટીવાળા</div>
              <div className="text-3xl font-bold leading-tight" style={{ color: '#22c55e' }}>શ્રી 91<br/>શ્રી ગણેશાય નમઃ</div>
            </div>

            {/* Right Side Contact */}
            <div className="flex-shrink-0 text-xs font-semibold text-right" style={{ color: '#22c55e' }}>
              <div style={{ marginBottom: '2px' }}>સુરેશભાઈ પોવારા - ૯૩૨૬૮ ૨૮૨૨૮</div>
              <div style={{ marginBottom: '2px' }}>હરેશભાઈ કૃમર - ૯૭૩૯૯ ૧૨૫૧૬</div>
              <div>હરેશભાઈ પોવારા - ૯૦૯૬૨ ૬૪૪૩૬</div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="flex" style={{ borderBottom: '3px solid #22c55e' }}>
          <div className="flex-1 text-center" style={{ padding: '12px' }}>
            <div className="text-4xl font-bold" style={{ color: '#22c55e', marginBottom: '6px' }}>નિલંકઠે</div>
            <div className="text-sm font-semibold" style={{ color: '#22c55e' }}>કોઈપણ સાઈઝની સેન્ટિંગ પ્લેટ ભાડેથી મળશે.</div>
          </div>
          <div className="flex flex-col items-center justify-center text-center" style={{ borderLeft: '3px solid #22c55e', minWidth: '180px', padding: '12px' }}>
            <div className="text-2xl font-bold" style={{ color: '#22c55e', marginBottom: '8px' }}>પ્લેટ ડેપો</div>
            <div className="px-4 py-1 text-lg font-bold" style={{ border: '3px solid #22c55e', borderRadius: '20px', color: '#22c55e' }}>
              {challanType === 'jama' ? 'જમા ચલણ' : 'ઉધાર ચલણ'}
            </div>
          </div>
        </div>

        {/* Challan Number and Date */}
        <div className="flex" style={{ borderBottom: '3px solid #22c55e', backgroundColor: '#dcfce7' }}>
          <div className="flex items-center flex-1" style={{ borderRight: '3px solid #22c55e', padding: '8px' }}>
            <span className="font-bold" style={{ color: '#22c55e', marginRight: '10px', fontSize: '14px' }}>ચલણ નંબર :</span>
            <span className="font-semibold" style={{ color: '#166534' }}>{challanNumber}</span>
          </div>
          <div className="flex items-center" style={{ minWidth: '280px', padding: '8px' }}>
            <span className="font-bold" style={{ color: '#22c55e', marginRight: '10px', fontSize: '14px' }}>તારીખ :</span>
            <span className="font-semibold" style={{ color: '#166534' }}>{date}</span>
          </div>
        </div>

        {/* Customer Details */}
        <div style={{ padding: '10px', borderBottom: '3px solid #22c55e' }}>
          <div className="flex" style={{ marginBottom: '8px' }}>
            <div className="flex items-center flex-1">
              <span className="font-bold" style={{ color: '#22c55e', marginRight: '10px', fontSize: '14px' }}>નામ:</span>
              <span className="font-semibold" style={{ color: '#166534', paddingBottom: '2px', borderBottom: '1px solid #86efac', flex: 1 }}>{clientName}</span>
            </div>
            <div className="flex items-center" style={{ minWidth: '180px', marginLeft: '24px' }}>
              <span className="font-bold" style={{ color: '#22c55e', marginRight: '10px', fontSize: '14px' }}>ID:</span>
              <span className="font-semibold" style={{ color: '#166534', paddingBottom: '2px', borderBottom: '1px solid #86efac', flex: 1 }}>{driverName || ''}</span>
            </div>
          </div>
          <div className="flex" style={{ marginBottom: '8px' }}>
            <span className="font-bold" style={{ color: '#22c55e', marginRight: '10px', fontSize: '14px' }}>સાઈટ:</span>
            <span className="font-semibold" style={{ color: '#166534', paddingBottom: '2px', borderBottom: '1px solid #86efac', flex: 1 }}>{site}</span>
          </div>
          <div className="flex">
            <span className="font-bold" style={{ color: '#22c55e', marginRight: '10px', fontSize: '14px' }}>મોબાઇલ:</span>
            <span className="font-semibold" style={{ color: '#166534', paddingBottom: '2px', borderBottom: '1px solid #86efac', flex: 1 }}>{phone}</span>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#22c55e', color: 'white' }}>
                <th className="font-bold" style={{ border: '3px solid #22c55e', width: '15%', padding: '8px', fontSize: '14px' }}>સાઈઝ</th>
                <th className="font-bold" style={{ border: '3px solid #22c55e', width: '20%', padding: '8px', fontSize: '14px' }}>પ્લેટનંગ</th>
                <th className="font-bold" style={{ border: '3px solid #22c55e', width: '20%', padding: '8px', fontSize: '14px' }}></th>
                <th className="font-bold" style={{ border: '3px solid #22c55e', width: '45%', padding: '8px', fontSize: '14px' }}>વિગત</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(sizes).map(([size, value], index) => {
                const displaySize = size;
                const isLastRow = index === Object.entries(sizes).length - 1;
                
                return (
                  <tr key={size}>
                    <td className="font-bold text-center" style={{ border: '3px solid #22c55e', color: '#22c55e', padding: '8px', fontSize: '15px' }}>
                      {displaySize}
                    </td>
                    <td className="text-center" style={{ border: '3px solid #22c55e', padding: '6px' }}>
                      <span className="font-semibold" style={{ color: '#166534', fontSize: '14px' }}>{value.pattern}</span>
                    </td>
                    <td style={{ border: '3px solid #22c55e', padding: '6px' }}>
                      {isLastRow && (
                        <div className="flex items-center justify-center">
                          <div className="text-center" style={{ width: '100px', border: '3px solid #22c55e', backgroundColor: '#86efac' }}>
                            <div className="text-xs font-bold" style={{ padding: '6px 0', borderBottom: '3px solid #22c55e' }}>©←</div>
                            <div className="text-3xl font-bold" style={{ color: '#22c55e', padding: '16px 0' }}>PB</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ border: '3px solid #22c55e', padding: '6px' }}>
                      {isLastRow ? (
                        <div className="text-xs" style={{ color: '#22c55e', padding: '6px' }}>
                          <div className="font-bold" style={{ marginBottom: '4px' }}>વાહન ની વિગત .................</div>
                          <div className="font-semibold leading-relaxed">પ્લેટ લેવા તથા મુકવા આવો ત્યારે ફોન કરીને આવવું. બપોરે ૧૨.૩૦ થી ૨.૩૦ વાગ્યા સુધી બંધ રહેશે.</div>
                        </div>
                      ) : (
                        <span className="block font-semibold text-center" style={{ color: '#166534' }}>{value.detail}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Notes Section */}
        <div className="text-xs font-semibold leading-relaxed" style={{ padding: '8px', borderTop: '3px solid #22c55e', borderBottom: '3px solid #22c55e', color: '#22c55e' }}>
          <span className="font-bold">નોંધ :- (૧)</span> સેન્ટિંગ પ્લેટની ડીલીવરી આપ્યા પછી તમામ જવાબદારી કોન્ટ્રાક્ટર ના શીરે રહેશે. <span className="font-bold">(૨)</span> સેન્ટીંગ પ્લેટ ખોવાય અથવા તુટી જાય તો તેના રૂપિયા નુકસાની અલગથી આપવાની રહેશે. <span className="font-bold">(૩)</span> હર રવિવારે તથા જાહેર તહેવારે દુકાન બંધ રહેશે. <span className="font-bold">(૪)</span> ભરના ઉતારવાની મજૂરી <span className="font-bold">..1.5..</span> રૂ. નંગ દીઠ ઓડકે આપવાની રહેશે.
        </div>

        {/* Bottom Line */}
        <div style={{ borderBottom: '3px solid #22c55e' }}></div>

        {/* Footer */}
        <div style={{ padding: '10px' }}>
          <div className="text-sm font-bold" style={{ color: '#22c55e', marginBottom: '8px' }}>
            આથી હું સહી કરનાર લખી આપુ છુ મને પ્લેટ નંગ ......................મળેલ છે.
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-bold" style={{ color: '#22c55e', marginRight: '10px', fontSize: '14px' }}>લેનારની સહી</span>
              <span style={{ color: '#22c55e' }}>.......................</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold" style={{ color: '#22c55e', marginRight: '10px', fontSize: '14px' }}>આપનારની સહી</span>
              <span style={{ color: '#22c55e' }}>.......................</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptTemplate;