import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, FileText, User, RefreshCw, Filter, Download, Eye, MapPin, X, Trash2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../utils/supabase";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import * as periodCalculations from "../utils/billingPeriodCalculations";
import { generateBillJPEG } from "../utils/generateBillJPEG";
import BillInvoiceTemplate from "../components/BillInvoiceTemplate";

type SortOption = 'dateNewOld' | 'dateOldNew' | 'amountHighLow' | 'amountLowHigh';

interface BillRecord {
  id?: string;
  client_id: string;
  bill_number: string;
  billing_date?: string; // Correct column name
  bill_date?: string; // Legacy/Alias support
  created_at: string;
  total_amount?: number;
  grand_total?: number;
  total_payment?: number;
  due_payment?: number;
  total_rent_amount?: number;
  total_extra_cost?: number;
  total_discount?: number;
  from_date?: string;
  to_date?: string;
  daily_rent?: number;
  status: string;
  client: {
    client_name: string;
    client_nic_name: string;
    site: string;
    primary_phone_number?: string;
  };
}

interface BillCardProps {
  bill: BillRecord;
  t: any;
  onView: (bill: BillRecord) => void;
  onDownload: (bill: BillRecord) => void;
  onDelete: (bill: BillRecord) => void;
}

const BillCard: React.FC<BillCardProps> = ({ bill, t, onView, onDownload, onDelete }) => {
  const amount = bill.grand_total || bill.total_amount || 0;
  // Fallback chain for date
  const date = bill.billing_date || bill.bill_date || bill.created_at;

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">
                #{bill.bill_number}
              </h4>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${bill.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                {bill.status || 'Generated'}
              </span>
            </div>
          </div>
          <div className="text-right">
            {amount > 0 && (
              <div className="text-base font-bold text-blue-600">
                ₹{amount.toLocaleString("en-IN")}
              </div>
            )}
            {(bill.due_payment || 0) > 0 && (
              <div className="text-xs font-bold text-red-600">
                Due: ₹{(bill.due_payment || 0).toLocaleString("en-IN")}
              </div>
            )}
            <div className="text-[10px] text-gray-500">
              {date ? format(new Date(date), "dd MMM yy") : t('noDate')}
            </div>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold">{bill.client?.client_nic_name || t('unknownClient')}</span>
            <span className="text-gray-300">|</span>
            <span className="truncate">{bill.client?.client_name}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">{bill.client?.site || 'No Site'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
          <button
            onClick={() => onView(bill)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
          <button
            onClick={() => onDownload(bill)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </button>
          <button
            onClick={() => onDelete(bill)}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
            title="Delete Bill"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BillBook() {
  const { t } = useLanguage();

  // State
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>('dateNewOld');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // View/Download State
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Hidden template ref for download
  const downloadTemplateRef = useRef<HTMLDivElement>(null);

  // Load Bills
  const loadBills = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase
        .from("bills")
        .select(`
          *,
          client:clients (
            client_name,
            client_nic_name,
            site,
            primary_phone_number
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBills(data || []);
      if (showRefreshToast) toast.success('Bills refreshed');
    } catch (error) {
      console.error("Error loading bills:", error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBills();

    // Check for maintenance toast
    const hasShown = sessionStorage.getItem('billMaintenanceReshown');
    if (!hasShown) {
      toast(t('maintenanceMessage'), {
        duration: 5000,
        style: { background: '#363636', color: '#fff', fontSize: '14px', padding: '16px', borderRadius: '8px' },
        id: 'maintenance-message'
      });
      sessionStorage.setItem('billMaintenanceReshown', 'true');
    }
  }, []);

  // Filter & Sort
  const filteredAndSortedBills = useMemo(() => {
    let result = bills.filter((bill) =>
      bill.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.client?.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.client?.client_nic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.client?.site?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return result.sort((a, b) => {
      // Priority based on search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();

        // Check Bill Number matches
        const aBill = a.bill_number.toLowerCase();
        const bBill = b.bill_number.toLowerCase();

        // Exact bill number match
        if (aBill === query && bBill !== query) return -1;
        if (bBill === query && aBill !== query) return 1;

        // Check Client Nic Name (ID) matches
        const aNic = (a.client?.client_nic_name || '').toLowerCase();
        const bNic = (b.client?.client_nic_name || '').toLowerCase();

        const getID = (str: string) => {
          const m = str.match(/^(\d+)/);
          return m ? m[1] : '';
        };

        const aId = getID(aNic);
        const bId = getID(bNic);

        // Exact ID matches
        const aExactId = aId === query;
        const bExactId = bId === query;

        if (aExactId && !bExactId) return -1;
        if (bExactId && !aExactId) return 1;

        // Starts with search query
        const aStarts = aBill.startsWith(query) || aNic.startsWith(query);
        const bStarts = bBill.startsWith(query) || bNic.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (bStarts && !aStarts) return 1;
      }

      // Use proper date fallback
      const dateA = new Date(a.billing_date || a.bill_date || a.created_at).getTime();
      const dateB = new Date(b.billing_date || b.bill_date || b.created_at).getTime();
      const amountA = a.grand_total || a.total_amount || 0;
      const amountB = b.grand_total || b.total_amount || 0;

      switch (sortOption) {
        case 'dateNewOld': return dateB - dateA;
        case 'dateOldNew': return dateA - dateB;
        case 'amountHighLow': return amountB - amountA;
        case 'amountLowHigh': return amountA - amountB;
        default: return 0;
      }
    });
  }, [bills, searchQuery, sortOption]);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'dateNewOld': return 'Date: New to Old';
      case 'dateOldNew': return 'Date: Old to New';
      case 'amountHighLow': return 'Amount: High to Low';
      case 'amountLowHigh': return 'Amount: Low to High';
      default: return '';
    }
  };

  // Fetch Full Bill Details
  const fetchBillDetails = async (bill: any) => {
    setLoadingDetails(true);
    try {
      // 1. Fetch Related Data (Extra Costs, Discounts, Payments)
      const { data: extraCosts } = await supabase
        .from('bill_extra_costs').select('*').eq('bill_number', bill.bill_number);

      const { data: discounts } = await supabase
        .from('bill_discounts').select('*').eq('bill_number', bill.bill_number);

      const { data: payments } = await supabase
        .from('bill_payments').select('*').eq('bill_number', bill.bill_number);

      // 2. Fetch Client Challans for Re-calculation
      const { data: udharChallans } = await supabase
        .from('udhar_challans')
        .select(`*, items:udhar_items(*)`)
        .eq('client_id', bill.client_id)
        .order('udhar_date', { ascending: true });

      const { data: jamaChallans } = await supabase
        .from('jama_challans')
        .select(`*, items:jama_items(*)`)
        .eq('client_id', bill.client_id)
        .order('jama_date', { ascending: true });

      // resolve main date
      const billDateStr = bill.billing_date || bill.bill_date || bill.created_at;

      // 3. Re-calculate Bill
      // ... (existing calc code) ...
      const calcExtra = (extraCosts || []).map((c: any) => ({ amount: (c.total_amount || (c.pieces * c.price_per_piece)) }));
      const calcDisc = (discounts || []).map((d: any) => ({ amount: (d.total_amount || (d.pieces * d.discount_per_piece)) }));
      const calcPay = (payments || []).map((p: any) => ({ amount: p.amount }));

      const result = periodCalculations.calculateBill(
        udharChallans || [],
        jamaChallans || [],
        bill.to_date || billDateStr, // End date fallback
        bill.daily_rent || 1.5,
        calcExtra,
        calcDisc,
        calcPay,
        10, // serviceRate
        bill.from_date // Important: Use bill's from_date for correct period calculation
      );

      console.log('Calculated Periods:', result.billingPeriods.periods); // DEBUG LOG

      // FETCH PREVIOUS BILL for Pending Amount Display
      let previousBillData = undefined;
      // We look for the bill that ends just before this one starts, or the immediately preceding bill
      const { data: prevBills } = await supabase
        .from('bills')
        .select('bill_number, due_payment, to_date')
        .eq('client_id', bill.client_id)
        .lt('to_date', bill.from_date || billDateStr) // Bills ending before this one starts
        .order('to_date', { ascending: false })
        .limit(1);

      if (prevBills && prevBills.length > 0) {
        const prev = prevBills[0];
        if ((prev.due_payment || 0) > 0) {
          previousBillData = {
            billNumber: prev.bill_number,
            amount: prev.due_payment
          };
        }
      }

      // 4. Construct Full Bill Object
      const fullBillData = {
        companyDetails: {
          name: "Nilkanth Plate Depo",
          address: "10, Ajmaldham Society, Simada Gam, Surat.",
          phone: "93287 28228",
        },
        billDetails: {
          billNumber: bill.bill_number,
          billDate: billDateStr,
          fromDate: bill.from_date || (udharChallans && udharChallans[0]?.udhar_date) || billDateStr,
          toDate: bill.to_date || billDateStr,
          dailyRent: bill.daily_rent,
        },
        clientDetails: {
          name: bill.client?.client_name,
          nicName: bill.client?.client_nic_name,
          site: bill.client?.site,
          phone: bill.client?.primary_phone_number,
        },
        previousBill: previousBillData, // Pass the previous bill data here
        rentalCharges: result.billingPeriods.periods.map((p: any) => ({
          size: "All",
          startDate: p.startDate,
          endDate: p.endDate,
          pieces: p.plateCount,
          days: p.days,
          rate: bill.daily_rent || 1.5, // Use bill's daily rent
          amount: p.rent, // Correct property name from calculation result
          causeType: p.causeType,
          txnQty: (p.txnQty !== undefined && p.txnQty !== null) ? p.txnQty : 0
        })),
        extraCosts: (extraCosts || []).map((c: any) => ({
          id: c.id,
          date: c.date,
          description: c.note,
          amount: c.total_amount || (c.pieces * c.price_per_piece),
          pieces: c.pieces,
          rate: c.price_per_piece
        })),
        discounts: (discounts || []).map((d: any) => ({
          id: d.id, date: d.date, description: d.note, amount: d.total_amount || (d.pieces * d.discount_per_piece)
        })),
        payments: (payments || []).map((p: any) => ({
          id: p.id, date: p.date, method: p.payment_method, note: p.note, amount: p.amount
        })),
        summary: {
          grandTotal: bill.grand_total || bill.total_amount || 0,
          totalPaid: bill.total_payment || 0,
          duePayment: bill.due_payment || 0,
          totalRent: bill.total_rent_amount || result.billingPeriods.totalRent,
          totalExtraCosts: bill.total_extra_cost || 0,
          discounts: bill.total_discount || 0,
          // placeholders for template required fields
          totalUdharPlates: 0,
          totalJamaPlates: 0,
          netPlates: 0,
          serviceCharge: 0,
          advancePaid: 0
        },
        mainNote: ""
      };

      return fullBillData;

    } catch (error) {
      console.error('Error details:', error);
      toast.error('Failed to load bill details');
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewBill = async (bill: BillRecord) => {
    const details = await fetchBillDetails(bill);
    if (details) {
      setSelectedBill(details);
      setShowModal(true);
    }
  };

  const handleDownloadBill = async (bill: BillRecord) => {
    const details = await fetchBillDetails(bill);
    if (details) {
      setSelectedBill(details);
      // Wait for render then download via the hidden template
      setTimeout(() => {
        generateBillJPEG(bill.bill_number);
      }, 1000); // give time for state update and render
    }
  };

  const handleDeleteBill = async (bill: BillRecord) => {
    if (window.confirm(`Are you sure you want to delete Bill #${bill.bill_number}? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('bills')
          .delete()
          .eq('bill_number', bill.bill_number);

        if (error) throw error;

        toast.success("Bill deleted successfully");
        loadBills(); // Refresh list
      } catch (error) {
        console.error("Error deleting bill:", error);
        toast.error("Failed to delete bill");
      }
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full ml-0 overflow-y-auto pt-14 sm:pt-0 lg:ml-64 h-[100dvh]">
        <div className="flex flex-col gap-3 sm:gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="hidden sm:flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bill Book</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and view all generated bills</p>
            </div>

            <button
              onClick={() => loadBills(true)}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bills by number, client, or site..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative sort-menu-container sm:w-48">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full flex items-center justify-between px-2 sm:px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 truncate hidden sm:block">
                    {getSortLabel(sortOption)}
                  </span>
                </div>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/50 py-1">
                  {(['dateNewOld', 'dateOldNew', 'amountHighLow', 'amountLowHigh'] as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortOption(option);
                        setShowSortMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2
                        ${sortOption === option ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}
                      `}
                    >
                      {getSortLabel(option)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-500 px-1">
            <span className="hidden sm:inline">Showing {filteredAndSortedBills.length} bills</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 font-medium hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Content */}
          {loading && !refreshing ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl h-48 animate-pulse" />
              ))}
            </div>
          ) : filteredAndSortedBills.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl border-dashed">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No bills found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search terms' : 'Generate your first bill to see it here'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-20">
              {filteredAndSortedBills.map((bill, index) => (
                <BillCard
                  key={bill.bill_number || `bill-${index}`}
                  bill={bill}
                  t={t}
                  onView={handleViewBill}
                  onDownload={handleDownloadBill}
                  onDelete={handleDeleteBill}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Toaster />

      {/* Loading Overlay */}
      {loadingDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-900 font-medium">Loading details...</p>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {showModal && selectedBill && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900 truncate pr-2">
                View Bill: {selectedBill.billDetails.billNumber}
              </h3>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    // Trigger download for the currently viewed bill
                    setTimeout(() => {
                      generateBillJPEG(selectedBill.billDetails.billNumber);
                    }, 500);
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-100">
              <div className="min-w-[800px] sm:min-w-0 origin-top-left transform scale-[0.6] sm:scale-100 origin-top bg-white shadow-sm sm:shadow-none mx-auto">
                {/* Scale down on mobile or allow scroll? Scrolling is safer for readability. Let's try native scroll first without scaling hack, but 800px is wide. */}
                {/* Let's just wrap it in a scroll container with min-width to ensure it renders correctly */}
                <div className="min-w-[794px]">
                  <BillInvoiceTemplate {...selectedBill} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Template for Download */}
      {selectedBill && (
        <div
          id="invoice-template"
          ref={downloadTemplateRef}
          style={{
            position: 'absolute',
            top: '-9999px',
            left: '-9999px',
            width: '794px', // A4 width
            backgroundColor: 'white'
          }}
        >
          <BillInvoiceTemplate {...selectedBill} />
        </div>
      )}
    </div>
  );
}