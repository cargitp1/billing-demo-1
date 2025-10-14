import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Phone, Download } from 'lucide-react';
import { ClientLedgerData } from '../pages/ClientLedger';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import TransactionTable from './TransactionTable';
import ClientLedgerDownload from './ClientLedgerDownload';
import { generateClientLedgerJPEG } from '../utils/generateLedgerJPEG';
import { generateJPEG } from '../utils/generateJPEG';
import ReceiptTemplate from './ReceiptTemplate';
import toast from 'react-hot-toast';

interface ClientLedgerCardProps {
  ledger: ClientLedgerData;
}

export default function ClientLedgerCard({ ledger }: ClientLedgerCardProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const balanceColor = ledger.currentBalance.grandTotal > 0
    ? 'bg-red-100 text-red-700'
    : 'bg-green-100 text-green-700';

  const handleDownloadLedger = async () => {
    const loadingToast = toast.loading('Generating ledger image...');
    try {
      await generateClientLedgerJPEG(ledger.clientNicName);
      toast.dismiss(loadingToast);
      toast.success('Ledger downloaded successfully');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error generating ledger:', error);
      toast.error('Failed to generate ledger');
    }
  };

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
      <div
        className="p-5 transition-colors cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 gap-4">
            <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-white bg-blue-500 rounded-full">
              {getInitial(ledger.clientNicName)}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                {ledger.clientNicName}
              </h3>
              <p className="text-sm text-gray-500">
                {ledger.clientFullName}
              </p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {ledger.clientSite}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {ledger.clientPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-6 py-3 rounded-lg ${balanceColor}`}>
              <div className="text-2xl font-bold">
                {ledger.currentBalance.grandTotal}
              </div>
              <div className="text-xs font-medium">
                {t.totalOutstanding}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadLedger();
              }}
              className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 hover:text-blue-700"
              title="Download Ledger"
            >
              <Download className="w-5 h-5" />
            </button>

            <button className="text-gray-400 hover:text-gray-600">
              {isExpanded ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          <h4 className="mb-4 font-semibold text-gray-700 text-md">
            {t.transactionHistory}
          </h4>
          <TransactionTable
            transactions={ledger.transactions || []}
            currentBalance={ledger.currentBalance}
            clientNicName={ledger.clientNicName}
            clientFullName={ledger.clientFullName}
            clientSite={ledger.clientSite}
            clientPhone={ledger.clientPhone}
          />
        </div>
      )}

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ClientLedgerDownload
          clientNicName={ledger.clientNicName}
          clientFullName={ledger.clientFullName}
          clientSite={ledger.clientSite}
          clientPhone={ledger.clientPhone}
          transactions={ledger.transactions}
          currentBalance={ledger.currentBalance}
        />
      </div>
    </div>
  );
}
