import { useState } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
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

interface LedgerRowProps {
  item: LedgerItem;
  onDownload: (item: LedgerItem) => void;
}

export default function LedgerRow({ item, onDownload }: LedgerRowProps) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const displaySite = item.alternative_site || item.site;

  return (
    <>
      <tr className={`${
        item.type === 'udhar' ? 'bg-blue-50' : 'bg-green-50'
      } hover:opacity-80 transition-opacity`}>
        <td className="px-4 py-3 text-sm">
          {format(new Date(item.date), 'dd/MM/yyyy')}
        </td>
        <td className="px-4 py-3 text-sm">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.type === 'udhar'
              ? 'bg-blue-200 text-blue-800'
              : 'bg-green-200 text-green-800'
          }`}>
            {item.type === 'udhar' ? t('udhar') : t('jama')}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-medium">{item.challan_number}</td>
        <td className="px-4 py-3 text-sm font-semibold">{item.grandTotal}</td>
        <td className="px-4 py-3 text-sm">{displaySite}</td>
        <td className="px-4 py-3 text-sm">{item.driver_name}</td>
        <td className="px-4 py-3 text-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-white rounded transition-colors"
              title={t('sizeBreakdown')}
            >
              {expanded ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => onDownload(item)}
              className="p-1 hover:bg-white rounded transition-colors"
              title={t('downloadJPEG')}
            >
              <Download className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className={item.type === 'udhar' ? 'bg-blue-50' : 'bg-green-50'}>
          <td colSpan={7} className="px-4 py-4">
            <div className="bg-white rounded-lg p-4 shadow-inner">
              <h4 className="font-semibold text-sm mb-3 text-gray-700">
                {t('sizeBreakdown')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((size) => {
                  const qty = item.items[`size_${size}_qty` as keyof typeof item.items] as number;
                  const borrowed = item.items[`size_${size}_borrowed` as keyof typeof item.items] as number;
                  const total = qty + borrowed;

                  if (total === 0) return null;

                  return (
                    <div key={size} className="bg-gray-50 rounded p-3 border border-gray-200">
                      <div className="font-medium text-gray-700 mb-1">
                        {t('size')} {size}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>
                          {t('mainStock')}: <span className="font-semibold">{qty}</span>
                        </div>
                        <div>
                          {t('borrowedStock')}: <span className="font-semibold">{borrowed}</span>
                        </div>
                        <div className="mt-1 pt-1 border-t border-gray-300">
                          {t('grandTotal')}: <span className="font-bold text-gray-800">{total}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
