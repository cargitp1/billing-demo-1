import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../utils/supabase";
import { PLATE_SIZES } from "../components/ItemsTable";
import {
  Package,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  TrendingDown,
  ArrowUpDown,
  Plus,
  Minus,
} from "lucide-react";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";

interface StockData {
  size: number;
  total_stock: number;
  on_rent_stock: number;
  borrowed_stock: number;
  lost_stock: number;
  available_stock: number;
  updated_at: string;
}

type SortField =
  | "size"
  | "total_stock"
  | "available_stock"
  | "on_rent_stock"
  | "lost_stock";
type SortOrder = "asc" | "desc";

const StockManagement: React.FC = () => {
  const { t } = useLanguage();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField>("size");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "add" | "remove";
  }>({
    isOpen: false,
    type: "add",
  });
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [actionQuantity, setActionQuantity] = useState("");

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    else setLoading(true);

    const { data, error } = await supabase
      .from("stock")
      .select("*")
      .order("size");

    if (error) {
      console.error("Error fetching stock:", error);
      toast.error(t("failedToRefresh"));
    } else {
      const computed = (data || []).map((s: any) => ({
        ...s,
        available_stock: Math.max(
          0,
          (s.total_stock || 0) - (s.on_rent_stock || 0) - (s.lost_stock || 0)
        ),
      }));

      setStocks(computed);
      if (showRefreshToast) {
        toast.success(t("stockRefreshed"));
      }
    }

    setLoading(false);
    setRefreshing(false);
  };

  const handleActionClick = (type: "add" | "remove") => {
    setActionModal({ isOpen: true, type });
    setSelectedSize(null);
    setActionQuantity("");
  };

  const handleActionSubmit = async () => {
    if (!selectedSize || !actionQuantity) {
      toast.error(t("enterValidNumber"));
      return;
    }
    const qty = parseInt(actionQuantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error(t("enterValidNumber"));
      return;
    }

    const stock = stocks.find((s) => s.size === selectedSize);
    if (!stock) return;

    const currentTotal = stock.total_stock;
    const newTotal =
      actionModal.type === "add" ? currentTotal + qty : currentTotal - qty;

    const loadingToast = toast.loading(t("updatingStock"));

    const { error } = await supabase
      .from("stock")
      .update({
        total_stock: newTotal,
      })
      .eq("size", selectedSize);

    toast.dismiss(loadingToast);

    if (error) {
      console.error("Error updating stock:", error);
      toast.error(t("failedToUpdate"));
    } else {
      toast.success(t("stockUpdated"));
      setActionModal({ ...actionModal, isOpen: false });
      setSelectedSize(null);
      fetchStock();
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getAvailabilityBadge = (available: number) => {
    if (available === 0) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">{t("outOfStock")}</span>
          <span className="sm:hidden">0</span>
        </span>
      );
    }
    if (available < 10) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800">
          <TrendingDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">
            {t("lowStock")} ({available})
          </span>
          <span className="sm:hidden">{available}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
        <span className="hidden sm:inline">
          {t("inStock")} ({available})
        </span>
        <span className="sm:hidden">{available}</span>
      </span>
    );
  };

  const filteredAndSortedStocks = useMemo(() => {
    return [...stocks].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [stocks, sortField, sortOrder]);

  const sortedSizeOptions = useMemo(() => {
    return PLATE_SIZES.map((size, index) => ({
      id: index + 1,
      label: size,
    })).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true })
    );
  }, []);



  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="w-12 h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="w-20 h-6 bg-gray-200 rounded-full sm:w-24"></div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="w-16 h-4 bg-gray-200 rounded sm:w-20"></div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="w-12 h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="w-12 h-8 bg-gray-200 rounded sm:w-16"></div>
      </td>
    </tr>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
            fontSize: "13px",
            padding: "10px 14px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Navbar />
      <main className="flex-1 w-full ml-0 overflow-auto pt-14 pb-20 sm:pt-0 sm:pb-0 lg:ml-64">
        {/* Header - Desktop Only */}
        <div className="items-center justify-between hidden mb-6 sm:flex lg:mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {t("stockManagement")}
            </h2>
            <p className="mt-1 text-xs text-gray-600">{t("stockOverview")}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleActionClick("add")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
            <button
              onClick={() => handleActionClick("remove")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <Minus className="w-4 h-4" />
              Remove Stock
            </button>
            <button
              onClick={() => fetchStock(true)}
              disabled={refreshing}
              title={t("refreshStock")}
              className="p-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 touch-manipulation active:scale-95"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Summary Cards */}


        {/* Table Container */}
        <div className="">
          {/* Table Header with Controls */}
          <div className="p-3 border-b border-gray-200 sm:p-4 lg:p-6">
            <div className="flex items-center justify-end"></div>
          </div>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort("size")}
                    className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100 group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {t("size")}
                      <ArrowUpDown
                        size={14}
                        className="transition-opacity opacity-0 group-hover:opacity-100"
                      />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("total_stock")}
                    className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100 group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {t("totalStock")}
                      <ArrowUpDown
                        size={14}
                        className="transition-opacity opacity-0 group-hover:opacity-100"
                      />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("available_stock")}
                    className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100 group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {t("available")}
                      <ArrowUpDown
                        size={14}
                        className="transition-opacity opacity-0 group-hover:opacity-100"
                      />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("on_rent_stock")}
                    className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100 group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {t("totalOnRent")}
                      <ArrowUpDown
                        size={14}
                        className="transition-opacity opacity-0 group-hover:opacity-100"
                      />
                    </div>
                  </th>
                  {/* Lost Stock Column - Commented out
                    <th 
                      onClick={() => handleSort('lost_stock')}
                      className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase transition-colors cursor-pointer hover:bg-gray-100 group"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {t('lost')}
                        <ArrowUpDown size={14} className="transition-opacity opacity-0 group-hover:opacity-100" />
                      </div>
                    </th>
                    */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : filteredAndSortedStocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package size={48} className="text-gray-300" />
                        <p className="font-medium text-gray-500">
                          {t("outOfStock")}
                        </p>
                        <p className="text-sm text-gray-400">
                          {t("stockOverview")}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedStocks.map((stock, index) => (
                    <tr
                      key={stock.size}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-25"
                        }`}
                    >
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">
                          {PLATE_SIZES[stock.size - 1]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900 whitespace-nowrap">
                        <span className="font-medium">
                          {stock.total_stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {getAvailabilityBadge(stock.available_stock)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {stock.on_rent_stock + stock.borrowed_stock}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          ({stock.on_rent_stock} + {stock.borrowed_stock})
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Table - Horizontal Scroll */}
          <div className="overflow-x-auto lg:hidden">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="sticky left-0 z-10 px-1 py-1.5 text-xs font-bold text-center text-gray-700 bg-gray-100 border-r-2 border-gray-300 w-12 sm:px-2 sm:text-xs">
                    {t("size")}
                  </th>
                  <th className="px-1 py-1.5 text-xs sm:text-sm font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[60px] sm:min-w-[80px]">
                    {t("total_stock")}
                  </th>
                  <th className="px-1 py-1.5 text-xs sm:text-sm font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[70px] sm:min-w-[90px]">
                    {t("available_stock")}
                  </th>
                  <th className="px-1 py-1.5 text-xs sm:text-sm font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[60px] sm:min-w-[80px]">
                    {t("on_rent_stock")}
                  </th>
                  {/* Lost Stock Column - Commented out
                          <th className="px-1 py-1.5 text-xs sm:text-sm font-semibold text-center text-gray-700 border-r border-gray-200 min-w-[60px] sm:min-w-[80px]">
                            {t('lost_stock')}
                          </th>
                          */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="sticky left-0 z-10 px-2 py-2 bg-white border-r-2 border-gray-300 sm:px-3">
                          <div className="w-8 h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <div className="w-12 h-4 mx-auto bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200">
                          <div className="w-16 h-6 mx-auto bg-gray-200 rounded-full"></div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="w-12 h-4 mx-auto bg-gray-200 rounded"></div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredAndSortedStocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-8 text-center">
                      <Package
                        size={32}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      <p className="text-xs font-medium text-gray-500">
                        No stock found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedStocks.map((stock, index) => (
                    <tr
                      key={stock.size}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="sticky left-0 z-10 px-1 py-1.5 text-xs font-bold text-center text-gray-900 border-r-2 border-gray-300 sm:px-2 sm:text-base bg-inherit">
                        {PLATE_SIZES[stock.size - 1]}
                      </td>
                      <td className="px-1 py-1.5 text-center border-r border-gray-200">
                        <span className="text-xs font-semibold sm:text-sm">
                          {stock.total_stock}
                        </span>
                      </td>
                      <td className="px-1 py-1.5 text-center border-r border-gray-200">
                        {getAvailabilityBadge(stock.available_stock)}
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        <div className="text-xs font-semibold sm:text-sm">
                          {stock.on_rent_stock + stock.borrowed_stock}
                        </div>
                        <div className="text-xs text-gray-500 sm:text-sm">
                          (<span className="text-orange-600">{stock.on_rent_stock}</span>+<span className="text-purple-600">{stock.borrowed_stock}</span>)
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Footer */}
          {stocks.length > 0 && !loading && (
            <div className="px-3 py-3 border-t border-gray-200 sm:px-4 sm:py-4 lg:px-6 bg-gray-50">
              {/* Mobile Legend Container */}
              <div className="p-3 bg-white border border-gray-200 rounded-lg lg:hidden sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                    <span className="text-xs text-gray-600">મુખ્ય સ્ટોક</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                    <span className="text-xs text-gray-600">
                      બીજા ડેપા નો સ્ટોક
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span className="text-xs text-gray-600">ઉપલબ્ધ સ્ટોક</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg lg:hidden z-40 flex gap-3">
        <button
          onClick={() => handleActionClick("add")}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-xl shadow-sm touch-manipulation active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add Stock
        </button>
        <button
          onClick={() => handleActionClick("remove")}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-xl shadow-sm touch-manipulation active:scale-95"
        >
          <Minus className="w-5 h-5" />
          Remove
        </button>
        <button
          onClick={() => fetchStock(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center p-3 text-gray-700 bg-gray-100 border border-gray-200 rounded-xl shadow-sm touch-manipulation active:scale-95"
        >
          <RefreshCw
            className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionModal.type === "add" ? "Add Stock" : "Remove Stock"}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t("size")}
                </label>
                <select
                  value={selectedSize || ""}
                  onChange={(e) => setSelectedSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>
                    Select Size
                  </option>
                  {sortedSizeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t("quantity")}
                </label>
                <input
                  type="number"
                  min="1"
                  value={actionQuantity}
                  onChange={(e) => setActionQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quantity"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() =>
                  setActionModal({ ...actionModal, isOpen: false })
                }
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleActionSubmit}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${actionModal.type === "add"
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
