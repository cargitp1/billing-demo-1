import { useLanguage } from '../contexts/LanguageContext';

interface LedgerSummaryProps {
  totalUdhar: number;
  totalJama: number;
  netOutstanding: number;
}

export default function LedgerSummary({ totalUdhar, totalJama, netOutstanding }: LedgerSummaryProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="text-sm font-medium text-blue-700 mb-2">
          {t('totalUdhar')}
        </div>
        <div className="text-3xl font-bold text-blue-900">
          {totalUdhar} <span className="text-lg font-normal">{t('plates')}</span>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-sm font-medium text-green-700 mb-2">
          {t('totalJama')}
        </div>
        <div className="text-3xl font-bold text-green-900">
          {totalJama} <span className="text-lg font-normal">{t('plates')}</span>
        </div>
      </div>

      <div className={`border rounded-lg p-6 ${
        netOutstanding > 0
          ? 'bg-red-50 border-red-200'
          : netOutstanding === 0
          ? 'bg-gray-50 border-gray-200'
          : 'bg-orange-50 border-orange-200'
      }`}>
        <div className={`text-sm font-medium mb-2 ${
          netOutstanding > 0
            ? 'text-red-700'
            : netOutstanding === 0
            ? 'text-gray-700'
            : 'text-orange-700'
        }`}>
          {t('netOutstanding')}
        </div>
        <div className={`text-3xl font-bold ${
          netOutstanding > 0
            ? 'text-red-900'
            : netOutstanding === 0
            ? 'text-gray-900'
            : 'text-orange-900'
        }`}>
          {netOutstanding} <span className="text-lg font-normal">{t('plates')}</span>
        </div>
      </div>
    </div>
  );
}
