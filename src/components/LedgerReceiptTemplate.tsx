import React from 'react';
import { ClientLedgerData } from '../pages/ClientLedger';
import { format } from 'date-fns';

interface LedgerReceiptTemplateProps {
  ledgerData: ClientLedgerData;
}

const LedgerReceiptTemplate: React.FC<LedgerReceiptTemplateProps> = ({ ledgerData }) => {
  const getCurrentDate = () => {
    return format(new Date(), 'dd/MM/yyyy');
  };

  return (
    <div className="p-8 bg-white" style={{ minWidth: '800px' }}>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Client Ledger Statement</h1>
        <p className="mt-1 text-gray-600">Generated on: {getCurrentDate()}</p>
      </div>

      {/* Client Details */}
      <div className="p-4 mb-6 border border-gray-300 rounded">
        <h2 className="mb-3 text-lg font-semibold">Client Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Name:</strong> {ledgerData.clientFullName}</p>
            <p><strong>Nick Name:</strong> {ledgerData.clientNicName}</p>
          </div>
          <div>
            <p><strong>Site:</strong> {ledgerData.clientSite}</p>
            <p><strong>Phone:</strong> {ledgerData.clientPhone}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 mb-6 border border-gray-300 rounded">
        <h2 className="mb-3 text-lg font-semibold">Current Balance Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p><strong>Total Challans:</strong> {ledgerData.udharCount + ledgerData.jamaCount}</p>
            <p><strong>Udhar Challans:</strong> {ledgerData.udharCount}</p>
            <p><strong>Jama Challans:</strong> {ledgerData.jamaCount}</p>
          </div>
          <div>
            <p><strong>Total Items on Rent:</strong> {Object.values(ledgerData.currentBalance.sizes).reduce((sum, size) => sum + size.main, 0)}</p>
            <p><strong>Total Borrowed:</strong> {Object.values(ledgerData.currentBalance.sizes).reduce((sum, size) => sum + size.borrowed, 0)}</p>
            <p><strong>Grand Total:</strong> {ledgerData.currentBalance.grandTotal}</p>
          </div>
        </div>
      </div>

      {/* Size-wise Balance */}
      <div className="p-4 mb-6 border border-gray-300 rounded">
        <h2 className="mb-3 text-lg font-semibold">Size-wise Current Balance</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Size</th>
              <th className="p-2 text-right">On Rent</th>
              <th className="p-2 text-right">Borrowed</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(ledgerData.currentBalance.sizes).map(([size, values]) => (
              <tr key={size} className="border-b">
                <td className="p-2">Size {size}</td>
                <td className="p-2 text-right">{values.main}</td>
                <td className="p-2 text-right">{values.borrowed}</td>
                <td className="p-2 text-right">{values.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction History */}
      <div className="p-4 border border-gray-300 rounded">
        <h2 className="mb-3 text-lg font-semibold">Recent Transactions</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Challan #</th>
              <th className="p-2 text-right">Items</th>
              <th className="p-2 text-left">Driver</th>
            </tr>
          </thead>
          <tbody>
            {ledgerData.transactions.slice(0, 10).map((transaction) => (
              <tr key={transaction.challanNumber} className="border-b">
                <td className="p-2">{format(new Date(transaction.date), 'dd/MM/yyyy')}</td>
                <td className="p-2">{transaction.type.toUpperCase()}</td>
                <td className="p-2">{transaction.challanNumber}</td>
                <td className="p-2 text-right">{transaction.grandTotal}</td>
                <td className="p-2">{transaction.driverName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerReceiptTemplate;