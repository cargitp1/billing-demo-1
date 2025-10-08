import React from 'react';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

interface LedgerEntry {
  date: string;
  challanNumber: string;
  type: 'udhar' | 'jama';
  site: string;
  driver: string;
  items: {
    size_1_qty: number;
    size_1_borrowed: number;
    size_2_qty: number;
    size_2_borrowed: number;
    size_3_qty: number;
    size_3_borrowed: number;
    size_4_qty: number;
    size_4_borrowed: number;
    size_5_qty: number;
    size_5_borrowed: number;
    size_6_qty: number;
    size_6_borrowed: number;
    size_7_qty: number;
    size_7_borrowed: number;
    size_8_qty: number;
    size_8_borrowed: number;
    size_9_qty: number;
    size_9_borrowed: number;
    main_note?: string;
  };
  client: {
    client_nic_name: string;
    client_name: string;
    site: string;
    primary_phone?: string;
  };
}

interface LedgerTableProps {
  ledgerData: LedgerEntry[];
  onDownloadChallan: (entry: LedgerEntry) => void;
}

const calculateGrandTotal = (items: LedgerEntry['items']) => {
  let totalQty = 0;
  let totalBorrowed = 0;

  for (let size = 1; size <= 9; size++) {
    totalQty += items[`size_${size}_qty` as keyof typeof items] || 0;
    totalBorrowed += items[`size_${size}_borrowed` as keyof typeof items] || 0;
  }

  return {
    qty: totalQty,
    borrowed: totalBorrowed,
    total: totalQty + totalBorrowed
  };
};

const formatSizeDisplay = (qty: number, borrowed: number) => {
  if (qty === 0 && borrowed === 0) {
    return '-';
  }
  return `${qty}+${borrowed}`;
};

const LedgerTable: React.FC<LedgerTableProps> = ({ ledgerData, onDownloadChallan }) => {
  const { t } = useLanguage();

  if (ledgerData.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500 text-lg">{t('noTransactionsFound')}</p>
      </div>
    );
  }

  const getTypeBadge = (type: 'udhar' | 'jama') => {
    if (type === 'udhar') {
      return (
        <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 font-medium whitespace-nowrap">
          {t('udhar')} / ઉધાર
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-medium whitespace-nowrap">
          {t('jama')} / જમા
        </span>
      );
    }
  };

  const calculateSizeTotal = (size: number): number => {
    return ledgerData.reduce((sum, entry) => {
      const qty = entry.items[`size_${size}_qty` as keyof typeof entry.items] || 0;
      const borrowed = entry.items[`size_${size}_borrowed` as keyof typeof entry.items] || 0;
      return sum + qty + borrowed;
    }, 0);
  };

  const calculateOverallTotal = (): number => {
    return ledgerData.reduce((sum, entry) => {
      const gt = calculateGrandTotal(entry.items);
      return sum + gt.total;
    }, 0);
  };

  return (
    <>
      <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('date')}<br/>તારીખ
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('challanNumber')}<br/>ચલણ નંબર
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('type')}<br/>પ્રકાર
                </th>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
                  <th key={size} className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Size {size}
                  </th>
                ))}
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('grandTotal')}<br/>કુલ
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('site')}<br/>સાઇટ
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('driver')}<br/>ડ્રાઇવર
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('download')}<br/>ડાઉનલોડ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ledgerData.map((entry, index) => {
                const grandTotal = calculateGrandTotal(entry.items);

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(entry.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.challanNumber}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {getTypeBadge(entry.type)}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
                      <td key={size} className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {formatSizeDisplay(
                          entry.items[`size_${size}_qty` as keyof typeof entry.items] || 0,
                          entry.items[`size_${size}_borrowed` as keyof typeof entry.items] || 0
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 text-center">
                      {grandTotal.qty}+{grandTotal.borrowed}={grandTotal.total}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900">
                      {entry.site}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900">
                      {entry.driver}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onDownloadChallan(entry)}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        title={t('downloadJPEG')}
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-100 font-bold">
              <tr>
                <td colSpan={3} className="px-3 py-4 text-right text-sm text-gray-900">
                  {t('totalTransactions')} / કુલ ટ્રાન્ઝેક્શન:
                </td>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
                  <td key={size} className="px-2 py-4 text-center text-sm text-gray-900">
                    {calculateSizeTotal(size)}
                  </td>
                ))}
                <td className="px-3 py-4 text-center text-sm text-blue-700">
                  {calculateOverallTotal()}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="lg:hidden space-y-4">
        {ledgerData.map((entry, index) => {
          const grandTotal = calculateGrandTotal(entry.items);

          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {format(new Date(entry.date), 'dd/MM/yyyy')}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{entry.challanNumber}</div>
                </div>
                {getTypeBadge(entry.type)}
              </div>

              <div className="px-4 py-3">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => {
                    const display = formatSizeDisplay(
                      entry.items[`size_${size}_qty` as keyof typeof entry.items] || 0,
                      entry.items[`size_${size}_borrowed` as keyof typeof entry.items] || 0
                    );
                    if (display === '-') return null;
                    return (
                      <div key={size} className="text-sm">
                        <span className="text-gray-600">Size {size}:</span>{' '}
                        <span className="font-medium text-gray-900">{display}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-3 mb-3">
                  <div className="text-sm font-semibold text-blue-600">
                    {t('grandTotal')}: {grandTotal.qty}+{grandTotal.borrowed} = {grandTotal.total} {t('pieces')}
                  </div>
                </div>

                <div className="space-y-1 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">{t('site')}:</span>{' '}
                    <span className="text-gray-900">{entry.site}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('driver')}:</span>{' '}
                    <span className="text-gray-900">{entry.driver}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDownloadChallan(entry)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={18} />
                  {t('downloadJPEG')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default LedgerTable;
