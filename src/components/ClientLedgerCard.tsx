import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Phone, Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleDownloadLedger = async () => {
    const loadingToast = toast.loading('Generating ledger image...');
    try {
      const elementId = `client-ledger-download-${ledger.clientId}`;
      await generateClientLedgerJPEG(elementId, ledger.clientNicName);
      toast.dismiss(loadingToast);
      toast.success('Ledger downloaded successfully');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error generating ledger:', error);
      toast.error('Failed to generate ledger');
    }
  };

  const handleCreateUdhar = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/udhar-challan', {
      state: {
        preselectedClient: {
          id: ledger.clientId,
          nicName: ledger.clientNicName,
          fullName: ledger.clientFullName,
          site: ledger.clientSite,
          phone: ledger.clientPhone
        }
      }
    });
  };

  const handleCreateJama = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/jama-challan', {
      state: {
        preselectedClient: {
          id: ledger.clientId,
          nicName: ledger.clientNicName,
          fullName: ledger.clientFullName,
          site: ledger.clientSite,
          phone: ledger.clientPhone
        }
      }
    });
  };

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
      <div
        className="p-4 pb-2 transition-colors cursor-pointer sm:p-5 sm:pb-3 hover:bg-gray-50"
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

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">કુલ બહાર</span>
              <span className={`text-sm font-semibold ${ledger.currentBalance.grandTotal > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {ledger.currentBalance.grandTotal}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateUdhar}
                className="px-3 py-2 text-xs font-medium text-white transition-colors bg-red-500 rounded-full hover:bg-red-600"
                title="Create Udhar Challan"
              >
                <span className="flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Udhar
                </span>
              </button>

              <button
                onClick={handleCreateJama}
                className="px-3 py-2 text-xs font-medium text-white transition-colors bg-green-500 rounded-full hover:bg-green-600"
                title="Create Jama Challan"
              >
                <span className="flex items-center gap-1">
                  <span className="flex items-center justify-center w-4 h-4 text-lg font-bold leading-none">-</span>
                  Jama
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadLedger();
                }}
                className="p-2 text-blue-600 transition-colors rounded-full bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                title="Download Ledger"
              >
                <Download className="w-5 h-5" />
              </button>

              <button className="p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-600">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-gray-900 truncate">
                {ledger.clientNicName}
              </h4>
              <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                {ledger.clientFullName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-500">કુલ બહાર</span>
                <span className={`text-sm font-semibold ${ledger.currentBalance.grandTotal > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {ledger.currentBalance.grandTotal}
                </span>
              </div>

              <div className="flex flex-shrink-0 gap-1">
                <button
                  onClick={handleCreateUdhar}
                  className="p-1.5 text-[10px] font-medium text-white bg-red-300 hover:bg-red-600 rounded-lg transition-colors touch-manipulation active:scale-95 flex items-center justify-center"
                  aria-label="Create Udhar"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCreateJama}
                  className="p-1.5 text-[10px] font-medium text-white bg-green-300 hover:bg-green-600 rounded-lg transition-colors touch-manipulation active:scale-95 flex items-center justify-center"
                  aria-label="Create Jama"
                >
                  <span className="text-base font-bold leading-none">−</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadLedger();
                  }}
                  className="p-1.5 sm:p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation active:scale-95"
                  aria-label="Download Ledger"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-600">
            <div className="flex items-center flex-1 gap-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="truncate">{ledger.clientSite}</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{ledger.clientPhone}</span>
              </span>
            </div>
            <button
              className="flex-shrink-0 ml-1 text-gray-600"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-2.5 h-2.5" />
              ) : (
                <ChevronDown className="w-2.5 h-2.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-700 text-md">
              {t.transactionHistory}
            </h4>
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
          elementId={`client-ledger-download-${ledger.clientId}`}
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
