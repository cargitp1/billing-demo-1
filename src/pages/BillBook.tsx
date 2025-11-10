import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Calendar, User } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../utils/supabase";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";

interface BillRecord {
  id: string;
  client_id: string;
  bill_number: string;
  created_at: string;
  total_amount: number;
  client: {
    client_name: string;
    client_nic_name: string;
    site: string;
  };
}

const BillCard: React.FC<{ bill: BillRecord, t: any }> = ({ bill, t }) => (
  <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <FileText className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-semibold text-gray-900">Bill #{bill?.bill_number || 'N/A'}</h4>
        <p className="text-sm text-gray-600 truncate">{bill?.client?.client_name || t('unknownClient')}</p>
      </div>
      <div className="font-medium text-blue-600">
        ₹{(bill?.total_amount || 0).toLocaleString("en-IN")}
      </div>
    </div>
    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span>{bill?.created_at ? format(new Date(bill.created_at), "PP") : t('noDate')}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <User className="w-4 h-4 text-gray-400" />
        <span>{bill?.client?.client_nic_name || t('noNickname')}</span>
      </div>
    </div>
  </div>
);

export default function BillBook() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [maintenanceShown, setMaintenanceShown] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Show maintenance message only once
      toast(
        t('maintenanceMessage'),
        {
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            padding: '16px',
            borderRadius: '8px'
          },
          id: 'maintenance-message' // Unique ID prevents duplicate toasts
        }
      );

      try {
        const { data: billsData, error } = await supabase
          .from("bills")
          .select(`
            *,
            client:clients (
              client_name,
              client_nic_name,
              site
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBills(billsData || []);
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };

    init();
  }, []);

  const filteredBills = bills.filter((bill) =>
    bill.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.client.client_nic_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 min-w-0">
        <div className="container max-w-6xl px-4 py-4 mx-auto sm:px-6 lg:px-8 sm:py-6 lg:py-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchBills')}
                className="w-full py-2.5 pl-10 pr-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {searchQuery && (
              <div className="px-4 py-2 text-sm text-blue-700 border border-blue-200 rounded-lg bg-blue-50">
                {filteredBills.length} {t('billsFound')}
              </div>
            )}

            {filteredBills.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-200 rounded-xl">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-gray-100 rounded-full">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">{t('noBillsFound')}</h3>
                <p className="mb-4 text-sm text-gray-500">
                  {searchQuery ? t('tryAdjustingSearch') : t('noBillsCreated')}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 text-sm font-medium text-blue-600 transition-colors rounded-lg hover:text-blue-700 hover:bg-blue-50"
                  >
                    {t('clearSearch')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBills.map((bill) => (
                  <BillCard key={bill.id} bill={bill} t={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}