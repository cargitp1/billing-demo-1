import { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Eye, X, Printer, RotateCw } from 'lucide-react';
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
  const [previewTransaction, setPreviewTransaction] = useState<Transaction | null>(null);
  const [scale, setScale] = useState(1);
  const [isRotated, setIsRotated] = useState(false);

  useEffect(() => {
    const calculateScale = () => {
      // Base width is double receipt + gap: 1200 + 1200 + 40 = 2440
      // If rotated, the visual width we need to fit is the HEIGHT (1697)
      const baseWidth = isRotated ? 1697 : 2440;

      const targetWidth = window.innerWidth < 1000
        ? window.innerWidth - 48
        : Math.min(window.innerWidth * 0.9, 1200);

      const newScale = Math.min(targetWidth / baseWidth, 1);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [isRotated]);

  const handleDownloadChallan = async (transaction: Transaction) => {
    try {
      const node = document.createElement('div');
      node.style.position = 'absolute';
      node.style.left = '-9999px';
      // Ensure the container is wide enough for 2-up layout
      node.style.width = '2450px';
      document.body.appendChild(node);

      // Create a temporary container for the receipt
      const receiptContainer = document.createElement('div');
      receiptContainer.id = 'receipt-template';
      // Set container style for 2-up layout
      receiptContainer.style.display = 'flex';
      receiptContainer.style.gap = '40px'; // Gap between receipts
      receiptContainer.style.backgroundColor = 'white';
      receiptContainer.style.padding = '0';
      node.appendChild(receiptContainer);

      // Render the receipt into the temporary container
      const receiptProps = {
        challanType: transaction.type,
        challanNumber: transaction.challanNumber,
        date: new Date(transaction.date).toLocaleDateString('en-GB'),
        clientName: clientFullName,
        clientSortName: clientNicName,
        site: transaction.site || clientSite,
        phone: clientPhone,
        driverName: transaction.driverName,
        items: transaction.items
      };

      // Render TWO copies of the receipt
      const receipt = (
        <>
          <div style={{ position: 'relative', width: '1200px', height: '1697px' }}>
            <ReceiptTemplate {...receiptProps} />
          </div>
          <div style={{ position: 'relative', width: '1200px', height: '1697px' }}>
            <ReceiptTemplate {...receiptProps} />
          </div>
        </>
      );

      // Use ReactDOM to render the receipt
      const root = await import('react-dom/client');
      const reactRoot = root.createRoot(receiptContainer);
      await new Promise<void>(resolve => {
        reactRoot.render(receipt);
        setTimeout(resolve, 500); // Increased wait time
      });

      // Generate and download the JPEG with correct dimensions
      // Width = 1200 + 1200 + 40 (gap) = 2440
      await generateJPEG(
        transaction.type as 'udhar' | 'jama',
        transaction.challanNumber.toString(),
        new Date(transaction.date).toLocaleDateString('en-GB'),
        2440,
        1697
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

  const toggleRotation = () => {
    setIsRotated(!isRotated);
  };

  const handlePrint = () => {
    window.print();
  };

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

  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        {t.noTransactions}
      </div>
    );
  }

  return (
    <div className="-mx-5 overflow-x-auto md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 rounded-lg md:border-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:text-sm">
                  {t.challanNumber}
                </th>
                <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:text-sm">
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1 text-xs hover:text-gray-700"
                  >
                    {t.date}
                    <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </th>
                <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:text-sm">
                  {t.grandTotal}
                </th>
                {PLATE_SIZES.map((size, index) => (
                  <th key={index + 1} className="px-2 py-2 text-xs font-medium tracking-wider text-center text-gray-500 sm:text-sm whitespace-nowrap">
                    {size}
                  </th>
                ))}
                <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:text-sm">
                  {t.site}
                </th>
                <th className="px-2 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:text-sm">
                  {t.driver}
                </th>
                <th className="px-2 py-2 text-xs font-medium tracking-wider text-center text-gray-500 uppercase sm:text-sm">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="font-semibold bg-blue-50">
                <td className="px-2 py-2 text-xs whitespace-nowrap sm:text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full"></div>
                    <span>{t.currentBalance}</span>
                  </div>
                </td>
                <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap sm:text-sm">-</td>
                <td className="px-2 py-2 text-xs font-medium whitespace-nowrap sm:text-sm">
                  {currentBalance.grandTotal}
                </td>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
                  <td key={size} className="px-2 py-2 text-xs text-center whitespace-nowrap sm:text-sm">
                    {formatBalanceValue(currentBalance.sizes[size])}
                  </td>
                ))}
                <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap sm:text-sm">-</td>
                <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap sm:text-sm">-</td>
                <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap sm:text-sm">-</td>
              </tr>

              {sortedTransactions.map((transaction, index) => (
                <tr
                  key={`${transaction.type}-${transaction.challanId}-${index}`}
                  className={transaction.type === 'udhar' ? 'bg-red-50' : 'bg-green-50'}
                >
                  <td className="px-2 py-2 text-xs whitespace-nowrap sm:text-sm">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${transaction.type === 'udhar' ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                      <span>
                        #{transaction.challanNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-xs whitespace-nowrap sm:text-sm">
                    {new Date(transaction.date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-2 py-2 text-xs font-medium whitespace-nowrap sm:text-sm">
                    {transaction.grandTotal}
                  </td>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => {
                    const sizeNote = transaction.items?.[`size_${size}_note`];
                    return (
                      <td key={size} className="px-2 py-2 text-xs text-center sm:text-sm">
                        {formatSizeValue(transaction.sizes[size], sizeNote)}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-xs whitespace-nowrap sm:text-sm">
                    {transaction.site}
                  </td>
                  <td className="px-2 py-2 text-xs whitespace-nowrap sm:text-sm">
                    {transaction.driverName || '-'}
                  </td>
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setPreviewTransaction(transaction)}
                        className="inline-flex items-center justify-center p-1 text-gray-600 rounded hover:text-gray-800 hover:bg-gray-100"
                        title={t.preview || 'Preview'}
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadChallan(transaction)}
                        className="inline-flex items-center justify-center p-1 text-blue-600 rounded hover:text-blue-800 hover:bg-blue-100"
                        title={t.downloadJPEG}
                      >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 print:p-0 print:bg-white print:static">
          <style>
            {`
              @media print {
                @page {
                  size: landscape;
                  margin: 0;
                }
                body {
                  visibility: hidden;
                }
                #printable-receipt-container, #printable-receipt-container * {
                  visibility: visible;
                }
                #printable-receipt-container {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  z-index: 9999 !important;
                  
                  /* Scale to fit A4 Landscape (approx 1100px wide printable area / 2440px actual width) */
                  transform: scale(0.46) !important; 
                  transform-origin: top left !important;
                  
                  width: 2440px !important;
                  height: 1697px !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  
                  background-color: white !important;
                  print-color-adjust: exact !important;
                  -webkit-print-color-adjust: exact !important;
                  
                  display: flex !important;
                  flex-direction: row !important;
                  overflow: visible !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}
          </style>
          <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col print:shadow-none print:max-w-none print:max-h-none print:w-full print:h-full">
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b rounded-t-lg shrink-0 no-print">
              <h3 className="text-lg font-semibold text-gray-900">
                {t.preview || 'Preview'} - #{previewTransaction.challanNumber}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRotation}
                  className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
                  title="Rotate"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 text-blue-600 rounded-full hover:bg-blue-50"
                  title="Print"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPreviewTransaction(null)}
                  className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-gray-100 no-scrollbar print:p-0 print:overflow-visible print:bg-white">
              <div
                id="printable-receipt-container"
                className="origin-top-left bg-white transition-transform duration-200 flex gap-[40px] print:transform-none"
                style={{
                  transform: `scale(${scale}) ${isRotated ? 'rotate(90deg)' : ''}`,
                  width: '2440px',
                  height: '1697px',
                  marginBottom: isRotated ? '0' : `-${1697 * (1 - scale)}px`,
                  marginRight: isRotated ? '0' : `-${2440 * (1 - scale)}px`,
                  marginLeft: isRotated ? `${1697 * scale}px` : '0',
                }}
              >
                <div className="relative" style={{ width: '1200px', height: '1697px' }}>
                  <ReceiptTemplate
                    challanType={previewTransaction.type}
                    challanNumber={previewTransaction.challanNumber}
                    date={new Date(previewTransaction.date).toLocaleDateString('en-GB')}
                    clientName={clientFullName}
                    clientSortName={clientNicName}
                    site={previewTransaction.site || clientSite}
                    phone={clientPhone}
                    driverName={previewTransaction.driverName}
                    items={previewTransaction.items}
                  />
                </div>
                <div className="relative" style={{ width: '1200px', height: '1697px' }}>
                  <ReceiptTemplate
                    challanType={previewTransaction.type}
                    challanNumber={previewTransaction.challanNumber}
                    date={new Date(previewTransaction.date).toLocaleDateString('en-GB')}
                    clientName={clientFullName}
                    clientSortName={clientNicName}
                    site={previewTransaction.site || clientSite}
                    phone={clientPhone}
                    driverName={previewTransaction.driverName}
                    items={previewTransaction.items}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
