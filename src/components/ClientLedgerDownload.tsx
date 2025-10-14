import { Transaction, ClientBalance } from '../utils/ledgerCalculations';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

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

  return (
    <div id="client-ledger-download" className="p-8 bg-white" style={{ width: '1920px' }}>
      <div className="mb-6 text-center border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Ledger</h1>
        <div className="text-lg text-gray-700">
          <p className="font-semibold">{clientNicName} - {clientFullName}</p>
          <p className="text-sm mt-1">{clientSite} | {clientPhone}</p>
          <p className="text-sm text-gray-500 mt-1">
            Generated on: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase border border-gray-300">
                Challan #
              </th>
              <th className="px-3 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase border border-gray-300">
                Date
              </th>
              <th className="px-3 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase border border-gray-300">
                Total
              </th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
                <th key={size} className="px-3 py-3 text-xs font-bold tracking-wider text-center text-gray-700 uppercase border border-gray-300">
                  Size {size}
                </th>
              ))}
              <th className="px-3 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase border border-gray-300">
                Site
              </th>
              <th className="px-3 py-3 text-xs font-bold tracking-wider text-left text-gray-700 uppercase border border-gray-300">
                Driver
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-semibold bg-blue-100">
              <td className="px-3 py-4 border border-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Current Balance</span>
                </div>
              </td>
              <td className="px-3 py-4 text-gray-600 border border-gray-300">-</td>
              <td className="px-3 py-4 text-lg border border-gray-300">
                {currentBalance.grandTotal}
              </td>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
                <td key={size} className="px-3 py-4 text-center border border-gray-300">
                  {formatBalanceValue(currentBalance.sizes[size])}
                </td>
              ))}
              <td className="px-3 py-4 text-gray-600 border border-gray-300">-</td>
              <td className="px-3 py-4 text-gray-600 border border-gray-300">-</td>
            </tr>

            {sortedTransactions.map((transaction, index) => (
              <tr
                key={`${transaction.type}-${transaction.challanId}-${index}`}
                className={transaction.type === 'udhar' ? 'bg-red-50' : 'bg-green-50'}
              >
                <td className="px-3 py-4 border border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'udhar' ? 'bg-red-600' : 'bg-green-600'
                    }`}></div>
                    <span>#{transaction.challanNumber}</span>
                  </div>
                </td>
                <td className="px-3 py-4 border border-gray-300">
                  {new Date(transaction.date).toLocaleDateString('en-GB')}
                </td>
                <td className="px-3 py-4 font-medium border border-gray-300">
                  {transaction.grandTotal}
                </td>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => {
                  const sizeNote = transaction.items?.[`size_${size}_note`];
                  return (
                    <td key={size} className="px-3 py-4 text-center border border-gray-300">
                      {formatSizeValue(transaction.sizes[size], sizeNote)}
                    </td>
                  );
                })}
                <td className="px-3 py-4 border border-gray-300">
                  {transaction.site}
                </td>
                <td className="px-3 py-4 border border-gray-300">
                  {transaction.driverName || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-gray-300">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <p className="font-semibold text-red-700">Udhar Challans</p>
            <p className="text-2xl font-bold text-red-800 mt-1">
              {transactions.filter(t => t.type === 'udhar').length}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="font-semibold text-green-700">Jama Challans</p>
            <p className="text-2xl font-bold text-green-800 mt-1">
              {transactions.filter(t => t.type === 'jama').length}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="font-semibold text-blue-700">Outstanding Balance</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">
              {currentBalance.grandTotal}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
