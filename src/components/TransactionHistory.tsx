import React from 'react';
import { Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Transaction, calculateCurrentBalance, formatDate } from '../utils/ledgerHelpers';
import { generateJPEG } from '../utils/generateJPEG';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const { t } = useLanguage();
  const currentBalance = calculateCurrentBalance(transactions);

  const handleDownloadChallan = async (txn: Transaction) => {
    try {
      await generateJPEG(txn.type, txn.challanNumber, txn.date);
    } catch (error) {
      console.error('Error generating JPEG:', error);
      alert('Error generating JPEG');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📦</span>
        <h4 className="text-lg font-semibold">પ્લેટ પ્રવૃત્તિ</h4>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-3 py-2 text-left">ચલણ નં.</th>
              <th className="px-3 py-2 text-left">તારીખ</th>
              <th className="px-3 py-2 text-center">કુલ</th>
              <th className="px-3 py-2 text-center">2 X 3</th>
              <th className="px-3 py-2 text-center">21 X 3</th>
              <th className="px-3 py-2 text-center">18 X 3</th>
              <th className="px-3 py-2 text-center">સાઇટ</th>
              <th className="px-3 py-2 text-center">ડ્રાઇવર</th>
              <th className="px-3 py-2 text-center">ડાઉનલોડ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-blue-50 font-medium">
              <td className="px-3 py-2">ચાલુ નંગ</td>
              <td className="px-3 py-2">-</td>
              <td className="px-3 py-2 text-center font-bold text-lg text-red-600">{currentBalance}</td>
              <td className="px-3 py-2 text-center" colSpan={6}>-</td>
            </tr>

            {transactions.map((txn, index) => {
              const size1Total = txn.items.size_1_qty;
              const size1Borrowed = txn.items.size_1_borrowed;
              const size2Total = txn.items.size_2_qty;
              const size2Borrowed = txn.items.size_2_borrowed;
              const size3Total = txn.items.size_3_qty;
              const size3Borrowed = txn.items.size_3_borrowed;

              return (
                <tr
                  key={index}
                  className={`border-b ${
                    txn.type === 'udhar' ? 'bg-yellow-50' : 'bg-green-50'
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        txn.type === 'udhar' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                      <span className="font-medium">
                        #{txn.type === 'udhar' ? 'વ' : 'જ'} {txn.challanNumber}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {txn.type === 'udhar' ? '🟡 ઉધાર' : '🟢 જમા'}
                    </div>
                  </td>
                  <td className="px-3 py-2">{formatDate(txn.date)}</td>
                  <td className="px-3 py-2 text-center font-bold">
                    {txn.grandTotal}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {size1Total > 0 ? (
                      <>
                        {txn.type === 'udhar' ? '+' : '-'}{size1Total}
                        {size1Borrowed > 0 && (
                          <sup className="text-xs text-red-500">
                            {txn.type === 'udhar' ? '+' : '-'}{size1Borrowed}
                          </sup>
                        )}
                      </>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {size2Total > 0 ? (
                      <>
                        {txn.type === 'udhar' ? '+' : '-'}{size2Total}
                        {size2Borrowed > 0 && (
                          <sup className="text-xs text-red-500">
                            {txn.type === 'udhar' ? '+' : '-'}{size2Borrowed}
                          </sup>
                        )}
                      </>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {size3Total > 0 ? (
                      <>
                        {txn.type === 'udhar' ? '+' : '-'}{size3Total}
                        {size3Borrowed > 0 && (
                          <sup className="text-xs text-red-500">
                            {txn.type === 'udhar' ? '+' : '-'}{size3Borrowed}
                          </sup>
                        )}
                      </>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-2 text-center text-xs">{txn.site || '-'}</td>
                  <td className="px-3 py-2 text-center text-xs">{txn.driver || '-'}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleDownloadChallan(txn)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2">
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-center">
            <div className="text-sm text-gray-600">ચાલુ નંગ</div>
            <div className="text-2xl font-bold text-red-600">{currentBalance}</div>
          </div>
        </div>

        {transactions.map((txn, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              txn.type === 'udhar'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold">
                  #{txn.type === 'udhar' ? 'વ' : 'જ'} {txn.challanNumber}
                </span>
                <div className="text-xs text-gray-600">
                  {txn.type === 'udhar' ? '🟡 ઉધાર' : '🟢 જમા'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{formatDate(txn.date)}</div>
                <div className="font-bold text-lg">{txn.grandTotal}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>2X3: {txn.items.size_1_qty || '-'}</div>
              <div>21X3: {txn.items.size_2_qty || '-'}</div>
              <div>18X3: {txn.items.size_3_qty || '-'}</div>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              {txn.site} • {txn.driver || 'No driver'}
            </div>

            <button
              onClick={() => handleDownloadChallan(txn)}
              className="mt-2 w-full py-2 bg-blue-500 text-white rounded flex items-center justify-center gap-2"
            >
              <Download size={16} />
              ડાઉનલોડ કરો
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4 justify-center text-sm flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          ઉધાર (Udhar)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          જમા (Jama)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          ચાલુ નંગ (Current)
        </span>
      </div>
    </div>
  );
};

export default TransactionHistory;
