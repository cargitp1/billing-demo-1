import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Client {
  id: string;
  client_nic_name: string;
  client_name: string;
  site: string;
}

interface LedgerSummaryProps {
  client: Client;
  transactionCount: number;
}

const LedgerSummary: React.FC<LedgerSummaryProps> = ({ client, transactionCount }) => {
  const { t } = useLanguage();

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h2 className="text-xl font-semibold text-blue-900">
        {client.client_name} ({client.client_nic_name})
      </h2>
      <p className="text-sm text-blue-700 mt-1">
        {t('totalTransactions')}: {transactionCount}
      </p>
    </div>
  );
};

export default LedgerSummary;
