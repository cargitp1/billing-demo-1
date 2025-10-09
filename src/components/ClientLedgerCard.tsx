import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Phone } from 'lucide-react';
import { ClientLedgerData, Transaction } from '../utils/ledgerCalculations';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import TransactionTable from './TransactionTable';

interface ClientLedgerCardProps {
  ledger: Omit<ClientLedgerData, 'transactions'> & {
    transactions?: Transaction[];
  };
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div
        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
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
        <div className="border-t border-gray-200 p-5 bg-gray-50">
          <h4 className="text-md font-semibold mb-4 text-gray-700">
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
    </div>
  );
}
