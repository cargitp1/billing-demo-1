import React from 'react';
import { Download, ChevronDown } from 'lucide-react';
import TransactionHistory from './TransactionHistory';
import { Transaction } from '../utils/ledgerHelpers';

interface ClientData {
  id: string;
  client_name: string;
  client_nic_name: string;
  site: string;
  primary_phone_number: string;
  transactions: Transaction[];
  currentBalance: number;
  transactionCount: number;
}

interface ClientCardProps {
  client: ClientData;
  isExpanded: boolean;
  onToggle: () => void;
  onDownloadLedger: (client: ClientData) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  isExpanded,
  onToggle,
  onDownloadLedger
}) => {
  const initial = client.client_nic_name.charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-lg shadow-md mb-3 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {initial}
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {client.client_name}
              </h3>
              <p className="text-sm text-gray-500">ID: {client.client_nic_name}</p>

              <div className="flex gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  📍 {client.site}
                </span>
                <span className="flex items-center gap-1">
                  ☎️ {client.primary_phone_number}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`px-4 py-2 rounded-full font-bold text-lg ${
              client.currentBalance > 0
                ? 'bg-red-100 text-red-700'
                : client.currentBalance < 0
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {client.currentBalance} કુલ બાકી
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadLedger(client);
              }}
              className="w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center transition-colors"
              title="Download Ledger"
            >
              <Download size={18} />
            </button>

            <div className={`w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}>
              <ChevronDown size={20} />
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <TransactionHistory transactions={client.transactions} />
        </div>
      )}
    </div>
  );
};

export default ClientCard;
