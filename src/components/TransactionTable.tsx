import { useState } from 'react';
import { ArrowUpDown, Download } from 'lucide-react';
import { Transaction, ClientBalance } from '../utils/ledgerCalculations';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { generateJPEG } from '../utils/generateJPEG';

interface TransactionTableProps {
  transactions?: Transaction[];
  currentBalance: ClientBalance;
  clientNicName: string;
  clientFullName: string;
  clientSite: string;
  clientPhone: string;
}

export default function TransactionTable({
  transactions,
  currentBalance,
  clientNicName,
  clientFullName,
  clientSite,
  clientPhone
}: TransactionTableProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedTransactions = transactions ? [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  }) : [];

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const formatSizeValue = (size: { qty: number; borrowed: number }, note?: string | null) => {
    const total = size.qty + size.borrowed;
    if (total === 0 && !note) return '-';

    const valueDisplay = (() => {
      if (total === 0) return null;

      if (size.borrowed === 0) {
        return <span className="font-medium">{size.qty}</span>;
      }

      if (size.qty === 0) {
        return (
          <span className="font-bold text-red-700">
          <sup className="ml-1 text-xs font-bold text-red-700">
            {size.borrowed}
          </sup>
          </span>
        );
      }

      return (
        <span>
          <span className="font-medium">{size.qty + size.borrowed}</span>
          <sup className="ml-1 text-xs font-bold text-red-700">
            {size.borrowed}{note ? ` ${note}` : ''}
          </sup>
        </span>
      );
    })();

    if (note) {
      return (
        <div>
          {valueDisplay && <div>{valueDisplay}</div>}
        </div>
      );
    }

    return valueDisplay || '-';
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

  const handleDownloadChallan = async (transaction: Transaction) => {
    const challanData = {
      challanNumber: transaction.challanNumber,
      date: transaction.date,
      clientNicName,
      clientName: clientFullName,
      site: transaction.site,
      phone: clientPhone,
      driverName: transaction.driverName,
      items: transaction.items,
      type: transaction.type
    };

    try {
      await generateJPEG(challanData, language);
    } catch (error) {
      console.error('Error generating JPEG:', error);
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        {t.noTransactions}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t.challanNumber}
            </th>
            <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              <button
                onClick={toggleSort}
                className="flex items-center gap-1 hover:text-gray-700"
              >
                {t.date}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t.grandTotal}
            </th>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
              <th key={size} className="px-3 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                {t.size} {size}
              </th>
            ))}
            <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t.site}
            </th>
            <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t.driver}
            </th>
            <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t.actions}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr className="font-semibold bg-blue-50">
            <td className="px-3 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>{t.currentBalance}</span>
              </div>
            </td>
            <td className="px-3 py-4 text-gray-500 whitespace-nowrap">-</td>
            <td className="px-3 py-4 text-lg whitespace-nowrap">
              {currentBalance.grandTotal}
            </td>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
              <td key={size} className="px-3 py-4 text-center whitespace-nowrap">
                {formatBalanceValue(currentBalance.sizes[size])}
              </td>
            ))}
            <td className="px-3 py-4 text-gray-500 whitespace-nowrap">-</td>
            <td className="px-3 py-4 text-gray-500 whitespace-nowrap">-</td>
            <td className="px-3 py-4 text-gray-500 whitespace-nowrap">-</td>
          </tr>

          {sortedTransactions.map((transaction, index) => (
            <tr
              key={`${transaction.type}-${transaction.challanId}-${index}`}
              className={transaction.type === 'udhar' ? 'bg-red-50' : 'bg-green-50'}
            >
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.type === 'udhar' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <span>
                    #{transaction.challanNumber}
                  </span>
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                {new Date(transaction.date).toLocaleDateString('en-GB')}
              </td>
              <td className="px-3 py-4 font-medium whitespace-nowrap">
                {transaction.grandTotal}
              </td>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => {
                const sizeNote = transaction.items?.[`size_${size}_note`];
                return (
                  <td key={size} className="px-3 py-4 text-center">
                    {formatSizeValue(transaction.sizes[size], sizeNote)}
                  </td>
                );
              })}
              <td className="px-3 py-4 whitespace-nowrap">
                {transaction.site}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                {transaction.driverName || '-'}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDownloadChallan(transaction)}
                  className="text-blue-600 hover:text-blue-800"
                  title={t.downloadJPEG}
                >
                  <Download className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
