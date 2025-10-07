import { Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LedgerRow from './LedgerRow';
import { format } from 'date-fns';

interface LedgerItem {
  id: string;
  challan_number: string;
  date: string;
  type: 'udhar' | 'jama';
  driver_name: string;
  alternative_site?: string;
  site: string;
  items: {
    size_1_qty: number;
    size_1_borrowed: number;
    size_2_qty: number;
    size_2_borrowed: number;
    size_3_qty: number;
    size_3_borrowed: number;
    size_4_qty: number;
    size_4_borrowed: number;
    size_5_qty: number;
    size_5_borrowed: number;
    size_6_qty: number;
    size_6_borrowed: number;
    size_7_qty: number;
    size_7_borrowed: number;
    size_8_qty: number;
    size_8_borrowed: number;
    size_9_qty: number;
    size_9_borrowed: number;
  };
  grandTotal: number;
}

interface LedgerTableProps {
  items: LedgerItem[];
  onDownload: (item: LedgerItem) => void;
}

export default function LedgerTable({ items, onDownload }: LedgerTableProps) {
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">{t('noChallansFound')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('challanType')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('challanNumber')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('grandTotal')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('site')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('driverName')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <LedgerRow key={item.id} item={item} onDownload={onDownload} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border-2 p-4 ${
              item.type === 'udhar'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">{t('date')}</div>
                <div className="font-semibold">
                  {format(new Date(item.date), 'dd/MM/yyyy')}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.type === 'udhar'
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-green-200 text-green-800'
              }`}>
                {item.type === 'udhar' ? t('udhar') : t('jama')}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <span className="text-sm text-gray-600">{t('challanNumber')}: </span>
                <span className="font-medium">{item.challan_number}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('grandTotal')}: </span>
                <span className="font-bold">{item.grandTotal} {t('plates')}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('site')}: </span>
                <span className="font-medium">{item.alternative_site || item.site}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">{t('driverName')}: </span>
                <span className="font-medium">{item.driver_name}</span>
              </div>
            </div>

            <button
              onClick={() => onDownload(item)}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              {t('downloadJPEG')}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
