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
        className="p-4 transition-colors cursor-pointer sm:p-5 hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Desktop Layout */}
        <div className="items-center justify-between hidden md:flex">
          <div className="flex items-center flex-1 gap-4">
            <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-white bg-blue-500 rounded-full">
              {getInitial(ledger.clientNicName)}
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900">
                {ledger.clientNicName}
              </h3>
              <p className="text-xs text-gray-500">
                {ledger.clientFullName}
              </p>
              <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {ledger.clientSite}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {ledger.clientPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadLedger();
              }}
              className="p-2 text-blue-600 transition-colors bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700"
              title="Download Ledger"
            >
              <Download className="w-5 h-5" />
            </button>

            <button className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate sm:text-base">
                {ledger.clientNicName}
              </h4>
              <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                {ledger.clientFullName}
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadLedger();
                }}
                className="p-1.5 sm:p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors touch-manipulation active:scale-95"
                aria-label="Download Ledger"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button 
                className="p-1.5 sm:p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors touch-manipulation active:scale-95"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="truncate">{ledger.clientSite}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{ledger.clientPhone}</span>
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-700 text-md">
              {t.transactionHistory}
            </h4>
            <span className="text-xs text-gray-500 md:hidden">Swipe to scroll →</span>
          </div>
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
