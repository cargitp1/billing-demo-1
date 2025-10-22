import { Transaction, ClientBalance } from '../utils/ledgerCalculations';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { PLATE_SIZES } from './ItemsTable';

interface ClientLedgerDownloadProps {
  clientNicName: string;
  clientFullName: string;
  clientSite: string;
  clientPhone: string;
  transactions: Transaction[];
  currentBalance: ClientBalance;
}

export default function ClientLedgerDownload({
  clientNicName,
  clientFullName,
  clientSite,
  clientPhone,
  transactions,
  currentBalance,
}: ClientLedgerDownloadProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const formatSizeValue = (size: { qty: number; borrowed: number }, note?: string | null) => {
    const total = size.qty + size.borrowed;

    if (total === 0 && !note) return '-';

    let valueDisplay = null;
    if (total > 0) {
      if (size.borrowed === 0) {
        valueDisplay = (
          <span>
            <span className="font-medium">{size.qty}</span>
            {note && <sup className="ml-1 text-xs font-bold text-red-700">({note})</sup>}
          </span>
        );
      } else if (size.qty === 0) {
        valueDisplay = (
          <span>
            <span className="font-bold text-red-700">{size.borrowed}</span>
            {note && <sup className="ml-1 text-xs font-bold text-red-700">({note})</sup>}
          </span>
        );
      } else {
        valueDisplay = (
          <span>
            <span className="font-medium">{size.qty + size.borrowed}</span>
            <sup className="ml-1 text-xs font-bold text-red-700">
              {size.borrowed}
              {note && <span>({note})</span>}
            </sup>
          </span>
        );
      }
    }

    if (!valueDisplay && note) {
      valueDisplay = <sup className="text-xs font-bold text-red-700">({note})</sup>;
    }

    return <div>{valueDisplay || '-'}</div>;
  };

  const formatBalanceValue = (sizeBalance: { main: number; borrowed: number; total: number }) => {
    if (sizeBalance.total === 0) return '-';

    if (sizeBalance.borrowed === 0) {
      return <span className="font-bold">{sizeBalance.main}</span>;
    }

    if (sizeBalance.main === 0) {
      return (
        <span className="font-bold text-red-700">
          {sizeBalance.borrowed}
        </span>
      );
    }

    return (
      <span>
        <span className="font-bold">{sizeBalance.main + sizeBalance.borrowed}</span>
        <sup className="ml-1 text-xs font-bold text-red-700">
          {sizeBalance.borrowed}
        </sup>
      </span>
    );
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const rowHeight = 50;
  const headerY = 200;
  const currentBalanceRowY = headerY + 45;
  const transactionsStartY = currentBalanceRowY + rowHeight;
  const totalHeight = transactionsStartY + (sortedTransactions.length * rowHeight) + 180;

  const colPositions = {
    challanNum: 30,
    date: 150,
    total: 260,
    size1: 340,
    size2: 420,
    size3: 500,
    size4: 580,
    size5: 660,
    size6: 740,
    size7: 820,
    size8: 900,
    size9: 980,
    site: 1060,
    driver: 1180,
  };

  return (
    <div
      id="client-ledger-download"
      style={{
        width: '1300px',
        height: `${totalHeight}px`,
        position: 'relative',
        backgroundColor: '#ffffff',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '0',
        right: '0',
        textAlign: 'center',
        fontSize: '32px',
        fontWeight: '700',
        color: '#111827'
      }}>
        Client Ledger
      </div>

      <div style={{
        position: 'absolute',
        top: '90px',
        left: '0',
        right: '0',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151'
      }}>
        {clientNicName} - {clientFullName}
      </div>

      <div style={{
        position: 'absolute',
        top: '120px',
        left: '0',
        right: '0',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        {clientSite} | {clientPhone}
      </div>

      <div style={{
        position: 'absolute',
        top: '145px',
        left: '0',
        right: '0',
        textAlign: 'center',
        fontSize: '12px',
        color: '#9ca3af'
      }}>
        Generated on: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}
      </div>

      <div style={{
        position: 'absolute',
        top: `${headerY}px`,
        left: `${colPositions.challanNum}px`,
        right: '30px',
        height: '40px',
        backgroundColor: '#f3f4f6',
        borderTop: '2px solid #d1d5db',
        borderBottom: '2px solid #d1d5db',
        display: 'flex',
        alignItems: 'center',
        fontWeight: '700',
        fontSize: '11px',
        textTransform: 'uppercase',
        color: '#374151'
      }}>
        <div style={{ position: 'absolute', left: '10px', width: '100px' }}>Challan #</div>
        <div style={{ position: 'absolute', left: `${colPositions.date - colPositions.challanNum}px`, width: '80px' }}>Date</div>
        <div style={{ position: 'absolute', left: `${colPositions.total - colPositions.challanNum}px`, width: '60px', textAlign: 'center' }}>Total</div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((size, idx) => (
          <div key={size} style={{ position: 'absolute', left: `${colPositions[`size${size}` as keyof typeof colPositions] - colPositions.challanNum}px`, width: '70px', textAlign: 'center' }}>
            {PLATE_SIZES[size - 1]}
          </div>
        ))}
        <div style={{ position: 'absolute', left: `${colPositions.site - colPositions.challanNum}px`, width: '100px' }}>Site</div>
        <div style={{ position: 'absolute', left: `${colPositions.driver - colPositions.challanNum}px`, width: '100px' }}>Driver</div>
      </div>

      <div style={{
        position: 'absolute',
        top: `${currentBalanceRowY}px`,
        left: `${colPositions.challanNum}px`,
        right: '30px',
        height: `${rowHeight}px`,
        backgroundColor: '#dbeafe',
        borderBottom: '1px solid #d1d5db',
        display: 'flex',
        alignItems: 'center',
        fontWeight: '700'
      }}>
        <div style={{ position: 'absolute', left: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#2563eb', borderRadius: '50%' }}></div>
          <span>Current Balance</span>
        </div>
        <div style={{ position: 'absolute', left: `${colPositions.date - colPositions.challanNum}px`, color: '#6b7280' }}>-</div>
        <div style={{ position: 'absolute', left: `${colPositions.total - colPositions.challanNum}px`, fontSize: '18px', textAlign: 'center', width: '60px' }}>
          {currentBalance.grandTotal}
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((size) => (
          <div key={size} style={{ position: 'absolute', left: `${colPositions[`size${size}` as keyof typeof colPositions] - colPositions.challanNum}px`, width: '70px', textAlign: 'center' }}>
            {formatBalanceValue(currentBalance.sizes[size])}
          </div>
        ))}
        <div style={{ position: 'absolute', left: `${colPositions.site - colPositions.challanNum}px`, color: '#6b7280' }}>-</div>
        <div style={{ position: 'absolute', left: `${colPositions.driver - colPositions.challanNum}px`, color: '#6b7280' }}>-</div>
      </div>

      {sortedTransactions.map((transaction, index) => {
        const yPos = transactionsStartY + (index * rowHeight);
        const bgColor = transaction.type === 'udhar' ? '#fef2f2' : '#f0fdf4';
        const dotColor = transaction.type === 'udhar' ? '#dc2626' : '#16a34a';

        return (
          <div
            key={`${transaction.type}-${transaction.challanId}-${index}`}
            style={{
              position: 'absolute',
              top: `${yPos}px`,
              left: `${colPositions.challanNum}px`,
              right: '30px',
              height: `${rowHeight}px`,
              backgroundColor: bgColor,
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div style={{ position: 'absolute', left: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: dotColor, borderRadius: '50%' }}></div>
              <span>#{transaction.challanNumber}</span>
            </div>
            <div style={{ position: 'absolute', left: `${colPositions.date - colPositions.challanNum}px` }}>
              {new Date(transaction.date).toLocaleDateString('en-GB')}
            </div>
            <div style={{ position: 'absolute', left: `${colPositions.total - colPositions.challanNum}px`, fontWeight: '500', textAlign: 'center', width: '60px' }}>
              {transaction.grandTotal}
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((size) => {
              const sizeNote = transaction.items?.[`size_${size}_note`];
              return (
                <div key={size} style={{ position: 'absolute', left: `${colPositions[`size${size}` as keyof typeof colPositions] - colPositions.challanNum}px`, width: '70px', textAlign: 'center' }}>
                  {formatSizeValue(transaction.sizes[size], sizeNote)}
                </div>
              );
            })}
            <div style={{ position: 'absolute', left: `${colPositions.site - colPositions.challanNum}px` }}>
              {transaction.site}
            </div>
            <div style={{ position: 'absolute', left: `${colPositions.driver - colPositions.challanNum}px` }}>
              {transaction.driverName || '-'}
            </div>
          </div>
        );
      })}

      <div style={{
        position: 'absolute',
        top: `${transactionsStartY + sortedTransactions.length * rowHeight + 30}px`,
        left: '30px',
        right: '30px',
        display: 'flex',
        gap: '20px',
        fontSize: '14px'
      }}>
        <div style={{ flex: 1, padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
          <p style={{ fontWeight: '600', color: '#b91c1c', marginBottom: '8px' }}>Udhar Challans</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#991b1b' }}>
            {transactions.filter(t => t.type === 'udhar').length}
          </p>
        </div>
        <div style={{ flex: 1, padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
          <p style={{ fontWeight: '600', color: '#15803d', marginBottom: '8px' }}>Jama Challans</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#166534' }}>
            {transactions.filter(t => t.type === 'jama').length}
          </p>
        </div>
        <div style={{ flex: 1, padding: '16px', backgroundColor: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
          <p style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>Outstanding Balance</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a' }}>
            {currentBalance.grandTotal}
          </p>
        </div>
      </div>
    </div>
  );
}
