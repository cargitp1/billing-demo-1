import { useState } from 'react';
import { ArrowUpDown, Download } from 'lucide-react';
import { Transaction, ClientBalance } from '../utils/ledgerCalculations';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { generateJPEG } from '../utils/generateJPEG';
import ReceiptTemplate from './ReceiptTemplate';
import toast from 'react-hot-toast';
import { PLATE_SIZES } from '../components/ItemsTable';

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
  
  const handleDownloadChallan = async (transaction: Transaction) => {
    try {
      const node = document.createElement('div');
      node.style.position = 'absolute';
      node.style.left = '-9999px';
      document.body.appendChild(node);

      // Create a temporary container for the receipt
      const receiptContainer = document.createElement('div');
      receiptContainer.id = 'receipt-template';
      node.appendChild(receiptContainer);

      // Render the receipt into the temporary container
      const receipt = <ReceiptTemplate
        challanType={transaction.type}
        challanNumber={transaction.challanNumber}
        date={new Date(transaction.date).toLocaleDateString('en-GB')}
        clientName={clientFullName}
        site={transaction.site || clientSite}
        phone={clientPhone}
        driverName={transaction.driverName}
        items={transaction.items}
      />;

      // Use ReactDOM to render the receipt
      const root = await import('react-dom/client');
      const reactRoot = root.createRoot(receiptContainer);
      await new Promise<void>(resolve => {
        reactRoot.render(receipt);
        setTimeout(resolve, 100); // Give React time to render
      });

      // Generate and download the JPEG
      await generateJPEG(
        transaction.type as 'udhar' | 'jama',
        transaction.challanNumber.toString(),
        new Date(transaction.date).toLocaleDateString('en-GB')
      );

      // Clean up
      reactRoot.unmount();
      document.body.removeChild(node);
      toast.success(t.challanDownloadSuccess);
    } catch (error) {
      console.error('Error downloading challan:', error);
      toast.error(t.challanDownloadError);
    }
  };

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
    
    // If no movement and no note, return dash
    if (total === 0 && !note) return '-';

    // Create the value display for quantities
    let valueDisplay = null;
    if (total > 0) {
      if (size.borrowed === 0) {
        // Only regular quantity
        valueDisplay = (
          <span>
            <span className="font-medium">{size.qty}</span>
            {note && <sup className="ml-1 text-xs font-bold text-red-700">({note})</sup>}
          </span>
        );
      } else if (size.qty === 0) {
        // Only borrowed quantity
        valueDisplay = (
          <span>
            <span className="font-bold text-red-700">{size.borrowed}</span>
            {note && <sup className="ml-1 text-xs font-bold text-red-700">({note})</sup>}
          </span>
        );
      } else {
        // Both regular and borrowed quantities
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

    // Show note even if there's no quantity
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



  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        {t.noTransactions}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-5 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 rounded-lg md:border-0">
          <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-1.5 py-1.5 text-[10px] sm:text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t.challanNumber}
            </th>
            <th className="px-1.5 py-1.5 text-[10px] sm:text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              <button
                onClick={toggleSort}
                className="flex items-center gap-1 hover:text-gray-700"
              >
                {t.date}
                <ArrowUpDown className="w-2 h-2 sm:w-3 sm:h-3" />
              </button>
            </th>
            <th className="px-1.5 py-1.5 text-[10px] sm:text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t.grandTotal}
            </th>
            {PLATE_SIZES.map((size, index) => (
              <th key={index + 1} className="px-1.5 py-1.5 text-[10px] sm:text-xs font-medium tracking-wider text-center text-gray-500 whitespace-nowrap">
                {size}
              </th>
            ))}
            <th className="px-1.5 py-1.5 text-[10px] sm:text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t.site}
            </th>
            <th className="px-1.5 py-1.5 text-[10px] sm:text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t.driver}
            </th>
            <th className="px-1.5 py-1.5 text-[10px] sm:text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
              {t.actions}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr className="font-semibold bg-blue-50">
            <td className="px-1.5 py-1.5 whitespace-nowrap text-[10px] sm:text-xs">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                <span>{t.currentBalance}</span>
              </div>
            </td>
            <td className="px-1.5 py-1.5 text-gray-500 whitespace-nowrap text-[10px] sm:text-xs">-</td>
            <td className="px-1.5 py-1.5 text-sm whitespace-nowrap text-[10px] sm:text-xs">
              {currentBalance.grandTotal}
            </td>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
              <td key={size} className="px-1.5 py-1.5 text-center whitespace-nowrap text-[10px] sm:text-xs">
                {formatBalanceValue(currentBalance.sizes[size])}
              </td>
            ))}
            <td className="px-1.5 py-1.5 text-gray-500 whitespace-nowrap text-[10px] sm:text-xs">-</td>
            <td className="px-1.5 py-1.5 text-gray-500 whitespace-nowrap text-[10px] sm:text-xs">-</td>
            <td className="px-1.5 py-1.5 text-gray-500 whitespace-nowrap text-[10px] sm:text-xs">-</td>
          </tr>

          {sortedTransactions.map((transaction, index) => (
            <tr
              key={`${transaction.type}-${transaction.challanId}-${index}`}
              className={transaction.type === 'udhar' ? 'bg-red-50' : 'bg-green-50'}
            >
              <td className="px-1.5 py-1.5 whitespace-nowrap text-[10px] sm:text-xs">
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    transaction.type === 'udhar' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <span>
                    #{transaction.challanNumber}
                  </span>
                </div>
              </td>
              <td className="px-1.5 py-1.5 whitespace-nowrap text-[10px] sm:text-xs">
                {new Date(transaction.date).toLocaleDateString('en-GB')}
              </td>
              <td className="px-1.5 py-1.5 font-medium whitespace-nowrap text-[10px] sm:text-xs">
                {transaction.grandTotal}
              </td>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => {
                const sizeNote = transaction.items?.[`size_${size}_note`];
                return (
                  <td key={size} className="px-1.5 py-1.5 text-center text-[10px] sm:text-xs">
                    {formatSizeValue(transaction.sizes[size], sizeNote)}
                  </td>
                );
              })}
              <td className="px-1.5 py-1.5 whitespace-nowrap text-[10px] sm:text-xs">
                {transaction.site}
              </td>
              <td className="px-1.5 py-1.5 whitespace-nowrap text-[10px] sm:text-xs">
                {transaction.driverName || '-'}
              </td>
              <td className="px-1.5 py-1.5 text-center whitespace-nowrap">
                <button
                  onClick={() => handleDownloadChallan(transaction)}
                  className="inline-flex items-center justify-center p-0.5 text-blue-600 rounded hover:text-blue-800 hover:bg-blue-100"
                  title={t.downloadJPEG}
                >
                  <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      </div>
    </div>
  );
}
