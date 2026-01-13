import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO, differenceInDays, subDays, addDays } from "date-fns";
import { generateBillJPEG } from '../utils/generateBillJPEG';
import BillInvoiceTemplate from '../components/BillInvoiceTemplate';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Receipt,
  CreditCard,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

import * as periodCalculations from "../utils/billingPeriodCalculations";
import { validateClientData } from "../utils/dataValidation";
import { supabase } from "../utils/supabase";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import { ClientFormData } from "../components/ClientForm";






interface SizeBalance {
  size: string;
  main: number;
  borrowed: number;
  total: number;
}
interface ChallanItem {
  size_1_qty: number;
  size_2_qty: number;
  size_3_qty: number;
  size_4_qty: number;
  size_5_qty: number;
  size_6_qty: number;
  size_7_qty: number;
  size_8_qty: number;
  size_9_qty: number;
  size_1_borrowed: number;
  size_2_borrowed: number;
  size_3_borrowed: number;
  size_4_borrowed: number;
  size_5_borrowed: number;
  size_6_borrowed: number;
  size_7_borrowed: number;
  size_8_borrowed: number;
  size_9_borrowed: number;
}

interface Transaction {
  type: "udhar" | "jama";
  challanNumber: string;
  date: string;
  grandTotal: number;
  sizes: { [key: string]: { qty: number; borrowed: number } };
  site: string;
  driverName: string;
  items: ChallanItem[];
  challanId: string;
}

interface ClientBalance {
  grandTotal: number;
  sizes: { [key: string]: SizeBalance };
}

interface ExtraCost {
  id: string;
  date: string;
  note: string;
  pieces: number;
  pricePerPiece: number;
  total: number;
}

interface Discount {
  id: string;
  date: string;
  note: string;
  pieces: number;
  discountPerPiece: number;
  total: number;
}

interface Payment {
  id: string;
  date: string;
  note: string;
  amount: number;
  method: "cash" | "bank" | "upi" | "cheque" | "card" | "other";
}

interface BillData {
  billNumber: string;
  billDate: string;
  toDate: string;
  dailyRent: number;
  fromDate?: string;
  extraCosts: ExtraCost[];
  discounts: Discount[];
  payments: Payment[];
  mainNote: string;
  errors: {
    billNumber?: string;
    billDate?: string;
    toDate?: string;
    dailyRent?: string;
  };
  transactions?: Transaction[];
  currentBalance?: ClientBalance;
}

export default function CreateBill() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [client, setClient] = useState<ClientFormData | null>(null);
  const [billResult, setBillResult] = useState<ReturnType<
    typeof periodCalculations.calculateBill
  > | null>(null);
  const [billData, setBillData] = useState<BillData>({
    billNumber: "",
    billDate: format(new Date(), "yyyy-MM-dd"),
    toDate: format(new Date(), "yyyy-MM-dd"),
    dailyRent: 1,
    extraCosts: [],
    discounts: [],
    payments: [],
    mainNote: "",
    errors: {},
  });
  const [showLedger, setShowLedger] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<ClientBalance>({
    grandTotal: 0,
    sizes: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      // Fetch and validate all client data first
      const validation = await validateClientData(clientId!);

      if (!validation.success) {
        console.error("Data validation failed:", validation.message);
        toast.error(validation.message);
        navigate("/billing");
        return;
      }

      const { client, udharChallans, jamaChallans } = validation.data;

      // Generate bill number
      const { data: lastBill, error: billError } = await supabase
        .from("bills")
        .select("bill_number")
        .order("bill_number", { ascending: false })
        .limit(100); // Get more bills to ensure we find the right sequence

      if (!billError) {
        let sequence = 1;
        const clientPrefix = client?.client_nic_name || clientId;

        // Find the last bill number for this client
        const clientBills =
          lastBill?.filter((bill) =>
            bill.bill_number.startsWith(clientPrefix + "/")
          ) || [];

        if (clientBills.length > 0) {
          // Extract the highest sequence number
          const sequences = clientBills.map((bill) => {
            const match = bill.bill_number.match(/\/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          });
          sequence = Math.max(...sequences) + 1;
        }

        const newBillNumber = `${clientPrefix}/${sequence}`;
        setBillData((prev) => ({ ...prev, billNumber: newBillNumber }));
      }

      // Log validation results
      console.log("Data Validation Results:", {
        client: validation.data.validation.clientData,
        udharChallans: validation.data.validation.udharChallans,
        jamaChallans: validation.data.validation.jamaChallans,
      });

      // Log detailed data for debugging
      console.log("Client Data:", {
        id: client.id,
        name: client.client_name,
        nickname: client.client_nic_name,
        site: client.site,
        phone: client.primary_phone_number,
      });

      console.log("Udhar Challans:", {
        count: udharChallans?.length || 0,
        firstDate: udharChallans?.[0]?.udhar_date,
        lastDate: udharChallans?.[udharChallans.length - 1]?.udhar_date,
        hasItems: udharChallans?.every(
          (c: { items?: any[] }) => Array.isArray(c.items) && c.items.length > 0
        ),
      });

      console.log("Jama Challans:", {
        count: jamaChallans?.length || 0,
        firstDate: jamaChallans?.[0]?.jama_date,
        lastDate: jamaChallans?.[jamaChallans.length - 1]?.jama_date,
        hasItems: jamaChallans?.every(
          (c: { items?: any[] }) => Array.isArray(c.items) && c.items.length > 0
        ),
      });

      // Set client data
      setClient(client);

      // Set from date to first udhar date if available
      if (udharChallans?.[0]) {
        setBillData((prev) => ({
          ...prev,
          fromDate: udharChallans[0].udhar_date,
        }));
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      toast.error(
        error instanceof Error ? error.message : "Error fetching client data"
      );
      navigate("/billing");
    }
  };

  const validateBillNumber = async (billNumber: string) => {
    if (!billNumber.trim()) return false;

    try {
      const { data, error } = await supabase
        .from("bills")
        .select("bill_number")
        .eq("bill_number", billNumber)
        .maybeSingle();

      if (error) throw error;
      return !data; // Returns true if bill number is available (no matching record found)
    } catch (error) {
      console.error("Error validating bill number:", error);
      return false;
    }
  };

  const handleInputChange = async (
    field: keyof BillData,
    value: string | number
  ) => {
    const newErrors = { ...billData.errors };

    if (field === "billNumber") {
      const isValid = await validateBillNumber(value as string);
      if (!isValid) {
        newErrors.billNumber = "Bill number already exists";
      } else {
        delete newErrors.billNumber;
      }
    }

    setBillData((prev) => ({
      ...prev,
      [field]: value,
      errors: newErrors,
    }));
  };

  // Calculate total rent with adjusted days
  const calculatedTotalRent = billResult?.billingPeriods.totalRent || 0;

  // Compute full bill summary once for rendering (size breakdown, totals, payments, due)
  const fullSummary = billResult
    ? {
      totalRent: calculatedTotalRent,
      totalUdharPlates: currentBalance?.sizes
        ? Object.values(currentBalance.sizes).reduce(
          (sum, size) => sum + (size.main || 0),
          0
        )
        : 0,
      totalJamaPlates: currentBalance?.sizes
        ? Object.values(currentBalance.sizes).reduce(
          (sum, size) => sum + (size.borrowed || 0),
          0
        )
        : 0,
      netPlates: currentBalance?.sizes
        ? Object.values(currentBalance.sizes).reduce(
          (sum, size) => sum + ((size.main || 0) - (size.borrowed || 0)),
          0
        )
        : 0,
      serviceCharge: 0, // TODO: Add service charge calculation
      totalExtraCosts: billData.extraCosts.reduce(
        (sum, cost) => sum + cost.total,
        0
      ),
      discounts: billData.discounts.reduce(
        (sum, discount) => sum + discount.total,
        0
      ),
      grandTotal:
        calculatedTotalRent +
        billData.extraCosts.reduce((sum, cost) => sum + cost.total, 0),
      totalPaid: billData.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ),
      advancePaid: 0, // TODO: Add advance payment tracking
      duePayment:
        calculatedTotalRent +
        billData.extraCosts.reduce((sum, cost) => sum + cost.total, 0) -
        billData.discounts.reduce(
          (sum, discount) => sum + discount.total,
          0
        ) -
        billData.payments.reduce((sum, payment) => sum + payment.amount, 0),
    }
    : {
      totalRent: 0,
      totalUdharPlates: 0,
      totalJamaPlates: 0,
      netPlates: 0,
      serviceCharge: 0,
      totalExtraCosts: 0,
      discounts: 0,
      grandTotal: 0,
      totalPaid: 0,
      advancePaid: 0,
      duePayment: 0,
    };

  // UI-friendly map of labels -> amounts (used in Bill Summary section)
  const summaryMap = {
    "કુલ ભાડું": fullSummary.totalRent,
    "સેવા ચાર્જ": fullSummary.serviceCharge,
    "વધારાના ચાર્જ": fullSummary.totalExtraCosts,
    "પેટા કુલ":
      fullSummary.totalRent +
      fullSummary.serviceCharge +
      fullSummary.totalExtraCosts,
    "છૂટ": fullSummary.discounts,
    "કુલ રકમ": fullSummary.grandTotal,
    "ચૂકવણી મળી": fullSummary.totalPaid,
    "બાકી રકમ": fullSummary.duePayment,
  } as const;

  const handleGenerateBill = async () => {
    try {
      // TODO: Save bill data to database
      const { error } = await supabase.from("bills").insert({
        bill_number: billData.billNumber,
        billing_date: billData.billDate,
        from_date: billData.fromDate,
        to_date: billData.toDate,
        daily_rent: billData.dailyRent,
        client_id: clientId,
        total_rent_amount: fullSummary.totalRent,
        total_extra_cost: fullSummary.totalExtraCosts,
        total_discount: fullSummary.discounts,
        total_payment: fullSummary.totalPaid,
        due_payment: fullSummary.duePayment,
      });

      if (error) throw error;

      // Save extra costs
      if (billData.extraCosts.length > 0) {
        const extraCostsData = billData.extraCosts.map((cost) => ({
          bill_number: billData.billNumber,
          date: cost.date,
          note: cost.note,
          pieces: cost.pieces,
          price_per_piece: cost.pricePerPiece,
          // total_amount is generated by the database
        }));

        const { error: extraCostsError } = await supabase
          .from("bill_extra_costs")
          .insert(extraCostsData);

        if (extraCostsError) throw extraCostsError;
      }

      // Save discounts
      if (billData.discounts.length > 0) {
        const discountsData = billData.discounts.map((discount) => ({
          bill_number: billData.billNumber,
          date: discount.date,
          note: discount.note,
          pieces: discount.pieces,
          discount_per_piece: discount.discountPerPiece,
          total_amount: discount.total,
        }));

        const { error: discountsError } = await supabase
          .from("bill_discounts")
          .insert(discountsData);

        if (discountsError) throw discountsError;
      }

      // Save payments
      if (billData.payments.length > 0) {
        const paymentsData = billData.payments.map((payment) => ({
          bill_number: billData.billNumber,
          date: payment.date,
          note: payment.note,
          amount: payment.amount,
          payment_method: payment.method,
        }));

        const { error: paymentsError } = await supabase
          .from("bill_payments")
          .insert(paymentsData);

        if (paymentsError) throw paymentsError;
      }

      toast.success("Bill generated successfully!");

      // Generate and download bill JPEG
      try {
        await generateBillJPEG(billData.billNumber);
        toast.success('Bill JPEG generated successfully');
        // Add a delay before navigating to ensure user sees the success message
        setTimeout(() => {
          navigate("/billing");
        }, 1000);
      } catch (error) {
        console.error('Error generating bill JPEG:', error);
        toast.error('Failed to generate bill JPEG');
        // Navigate even if JPEG generation fails
        setTimeout(() => {
          navigate("/billing");
        }, 1000);
      }
    } catch (error) {
      console.error("Error generating bill:", error);
      toast.error("Failed to generate bill");
    }
  };

  const calculateBill = async () => {
    setIsLoading(true);
    try {
      // Fetch Udhar challans with their items
      const { data: udharChallans, error: udharError } = await supabase
        .from("udhar_challans")
        .select(
          `
          udhar_challan_number,
          udhar_date,
          driver_name,
          alternative_site,
          items:udhar_items (
            size_1_qty,
            size_2_qty,
            size_3_qty,
            size_4_qty,
            size_5_qty,
            size_6_qty,
            size_7_qty,
            size_8_qty,
            size_9_qty,
            size_1_borrowed,
            size_2_borrowed,
            size_3_borrowed,
            size_4_borrowed,
            size_5_borrowed,
            size_6_borrowed,
            size_7_borrowed,
            size_8_borrowed,
            size_9_borrowed
          )
        `
        )
        .eq("client_id", clientId)
        .order("udhar_date", { ascending: true });

      console.log("Udhar Challans:", udharChallans);

      if (udharError) {
        console.error("Error fetching Udhar challans:", udharError);
        throw udharError;
      }

      // Fetch Jama challans with their items
      const { data: jamaChallans, error: jamaError } = await supabase
        .from("jama_challans")
        .select(
          `
          jama_challan_number,
          jama_date,
          driver_name,
          alternative_site,
          items:jama_items (
            size_1_qty,
            size_2_qty,
            size_3_qty,
            size_4_qty,
            size_5_qty,
            size_6_qty,
            size_7_qty,
            size_8_qty,
            size_9_qty,
            size_1_borrowed,
            size_2_borrowed,
            size_3_borrowed,
            size_4_borrowed,
            size_5_borrowed,
            size_6_borrowed,
            size_7_borrowed,
            size_8_borrowed,
            size_9_borrowed
          )
        `
        )
        .eq("client_id", clientId)
        .order("jama_date", { ascending: true });

      console.log("Jama Challans:", jamaChallans);

      if (jamaError) throw jamaError;

      if (udharChallans && udharChallans.length > 0) {
        const earliestDate = udharChallans[0].udhar_date;

        // Use the new billingPeriodCalculations for accurate rent calculation
        // Convert cost/discount/payment objects to match the new API
        const extraCharges = billData.extraCosts.map((cost) => ({
          amount: cost.pieces * cost.pricePerPiece,
        }));
        const discounts = billData.discounts.map((discount) => ({
          amount: discount.pieces * discount.discountPerPiece,
        }));
        const payments = billData.payments.map((payment) => ({
          amount: payment.amount,
        }));

        // Calculate bill using the new period-based system
        const result = periodCalculations.calculateBill(
          udharChallans,
          jamaChallans,
          billData.toDate,
          billData.dailyRent,
          extraCharges,
          discounts,
          payments
        );

        setBillResult(result);

        // Initialize balance tracking
        // Create balance from the final period's state
        const lastPeriod =
          result.billingPeriods.periods[
          result.billingPeriods.periods.length - 1
          ];
        const balance: ClientBalance = {
          grandTotal: lastPeriod?.plateCount || 0,
          sizes: {},
        };

        // Initialize sizes from transaction history
        const finalLedgerEntry =
          result.billingPeriods.ledger[result.billingPeriods.ledger.length - 1];
        if (finalLedgerEntry) {
          // We'll initialize from the last ledger entry to capture the final state
          for (let i = 1; i <= 9; i++) {
            balance.sizes[i.toString()] = {
              size: i.toString(),
              main: 0, // These will be populated from the ledger if available
              borrowed: 0,
              total: 0,
            };
          }
        }

        // Update state with the calculated results
        setCurrentBalance(balance);
        setBillData((prev) => ({
          ...prev,
          fromDate: earliestDate,
          currentBalance: balance,
          // Convert transactions from the ledger for UI display
          transactions: result.billingPeriods.ledger.map((entry) => ({
            type: entry.entryType,
            challanNumber: entry.challanNumber,
            date: entry.transactionDate,
            grandTotal:
              entry.entryType === "udhar"
                ? entry.udharAmount || 0
                : entry.jamaAmount || 0,
            items: [], // We don't need detailed items for display
            sizes: {}, // We don't need size breakdown for display
            site: "", // This info isn't critical for the ledger display
            driverName: "",
            challanId: entry.challanNumber,
          })),
        }));
        setShowLedger(true);
      }
    } catch (error) {
      console.error("Error calculating bill:", error);
      toast.error("Failed to calculate bill");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Implement save functionality
    toast.success("Bill generated successfully!");
    navigate("/billing");
  };

  if (!client) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container max-w-6xl px-4 py-4 mx-auto mt-16 sm:px-6 lg:px-8 sm:py-6 lg:py-8">
        <div className="space-y-4">
          {/* Section A: Client Information */}
          <div className="px-4 py-3 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-baseline gap-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {client.client_nic_name}
                  </h3>
                  <p className="text-sm text-gray-500">{client.client_name}</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/billing")}
                className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-0">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="flex-shrink-0 w-4 h-4 text-gray-400" />
                <span>{client.site}</span>
              </div>
            </div>
          </div>

          {/* Section B: Bill Header Information */}
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
            <h4 className="mb-4 text-base font-medium text-gray-900">
              {t("billDetails")}
            </h4>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("billNumber")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Receipt className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={billData.billNumber}
                      onChange={(e) =>
                        handleInputChange("billNumber", e.target.value)
                      }
                      className={`block w-full py-2 pl-10 pr-3 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${billData.errors.billNumber
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                      placeholder="Auto-generated (BILL-YYYYMM-###)"
                    />
                  </div>
                  {billData.errors.billNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {billData.errors.billNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("billDate")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="date"
                      value={billData.billDate}
                      onChange={(e) =>
                        handleInputChange("billDate", e.target.value)
                      }
                      className="block w-full py-2 pl-10 pr-3 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("tillDate")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="date"
                      value={billData.toDate}
                      onChange={(e) =>
                        handleInputChange("toDate", e.target.value)
                      }
                      className="block w-full py-2 pl-10 pr-3 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("dailyRent")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      value={billData.dailyRent}
                      onChange={(e) =>
                        handleInputChange(
                          "dailyRent",
                          parseFloat(e.target.value)
                        )
                      }
                      className="block w-full py-2 pl-10 pr-3 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="E.g., 5.00"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-end">
            <button
              onClick={calculateBill}
              disabled={
                isLoading ||
                !billData.billNumber ||
                !billData.billDate ||
                !billData.toDate ||
                !billData.dailyRent ||
                Object.keys(billData.errors).length > 0
              }
              className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? "Calculating..." : `${t("calculateBill")}`}
            </button>
          </div>

          {/* Section C: Rental Calculation */}
          {showLedger && billData.fromDate && (
            <div className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-medium text-gray-900">
                  {t("rentalCalculation")}
                </h4>
                <button
                  onClick={() => setShowCalculation(!showCalculation)}
                  className="p-1 text-gray-500 rounded hover:bg-gray-100"
                  title={showCalculation ? "Hide Calculation" : "Show Calculation"}
                >
                  {showCalculation ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="space-y-6">
                {/* Date Information Table */}
                <table className="w-full overflow-hidden text-sm border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        થી તારીખ
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        સુધી તારીખ
                      </th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        કુલ દિવસો
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="px-4 py-3 font-medium">
                        {format(new Date(billData.fromDate), "dd/MM/yyyy")}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {format(new Date(billData.toDate), "dd/MM/yyyy")}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {differenceInDays(
                          new Date(billData.toDate),
                          new Date(billData.fromDate)
                        ) + 1}{" "}દિવસો
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Rental Breakdown Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table
                    className={`w-full text-sm ${showCalculation ? "min-w-[600px]" : ""
                      } sm:min-w-0`}
                  >
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-1/4 px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          સમયગાળો
                        </th>
                        <th className="w-1/6 px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          દિવસો
                        </th>
                        {showCalculation && (
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            ગણતરી
                          </th>
                        )}
                        <th className="w-1/6 px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                          રકમ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {billResult?.billingPeriods.periods.map(
                        (period, index, array) => {
                          const isLastPeriod = index === array.length - 1;
                          // For Jama periods, show the actual return date
                          // For other periods, show one day before the next period starts
                          const nextType = array[index + 1]?.causeType;
                          let end = parseISO(period.endDate);

                          let newDisplayEndDate =
                            period.causeType === "jama"
                              ? format(end, "dd/MM/yyyy")
                              : format(subDays(end, 1), "dd/MM/yyyy");

                          if (period.causeType !== nextType) {
                            newDisplayEndDate =
                              nextType === "jama"
                                ? format(end, "dd/MM/yyyy")
                                : format(subDays(end, 1), "dd/MM/yyyy");
                          }

                          // Days calculation is now handled in billingPeriodCalculations.ts
                          const amount =
                            period.plateCount *
                            period.days *
                            billData.dailyRent;

                          return (
                            <tr
                              key={index}
                              className={
                                period.causeType === "udhar"
                                  ? "bg-red-50"
                                  : "bg-green-50"
                              }
                            >
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-2 h-2 rounded-full ${period.causeType === "udhar"
                                        ? "bg-red-500"
                                        : "bg-green-500"
                                        }`}
                                    ></div>
                                    <span>
                                      {period.causeType === "jama"
                                        ? format(
                                          addDays(
                                            parseISO(period.startDate),
                                            1
                                          ),
                                          "dd/MM/yyyy"
                                        )
                                        : format(
                                          parseISO(period.startDate),
                                          "dd/MM/yyyy"
                                        )}{" "}
                                      થી {newDisplayEndDate}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">{period.days}</td>
                              {showCalculation && (
                                <td className="px-4 py-3">
                                  {period.plateCount} પ્લેટ × {period.days} દિવસો
                                  × ₹{billData.dailyRent}
                                </td>
                              )}
                              <td className="px-4 py-3 font-medium text-right">
                                ₹{amount.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Total Row */}
                <div className="pt-4 mt-4 border-t">
                  <div className="flex justify-between text-base font-semibold">
                    <span>કુલ ભાડું:</span>
                    <span>
                      ₹
                      {(
                        billResult?.billingPeriods.totalRent || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section D, E, F: Extra Costs, Discounts, Payments */}
          {showLedger && billData.fromDate && (
            <>
              {/* Mobile Action Bar */}
              <div className="grid grid-cols-3 gap-2 mb-4 md:hidden">
                <button
                  onClick={() => {
                    setBillData((prev) => ({
                      ...prev,
                      extraCosts: [
                        ...prev.extraCosts,
                        {
                          id: crypto.randomUUID(),
                          date: format(new Date(), "yyyy-MM-dd"),
                          note: "",
                          pieces: 0,
                          pricePerPiece: 0,
                          total: 0,
                        },
                      ],
                    }));
                  }}
                  className="flex items-center justify-center gap-1 p-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm active:bg-gray-50"
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  ખર્ચ
                </button>
                <button
                  onClick={() => {
                    setBillData((prev) => ({
                      ...prev,
                      discounts: [
                        ...prev.discounts,
                        {
                          id: crypto.randomUUID(),
                          date: format(new Date(), "yyyy-MM-dd"),
                          note: "",
                          pieces: 0,
                          discountPerPiece: 0,
                          total: 0,
                        },
                      ],
                    }));
                  }}
                  className="flex items-center justify-center gap-1 p-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm active:bg-gray-50"
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  છૂટ
                </button>
                <button
                  onClick={() => {
                    setBillData((prev) => ({
                      ...prev,
                      payments: [
                        ...prev.payments,
                        {
                          id: crypto.randomUUID(),
                          date: format(new Date(), "yyyy-MM-dd"),
                          note: "",
                          amount: 0,
                          method: "cash",
                        },
                      ],
                    }));
                  }}
                  className="flex items-center justify-center gap-1 p-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm active:bg-gray-50"
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  ચુકવણી
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                {/* Section D: Extra Costs */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-medium text-gray-900">
                      વધારાનો ખર્ચ
                    </h4>
                    <div className="flex items-center gap-2">
                      {billData.extraCosts.length > 0 && (
                        <button
                          onClick={() => {
                            setBillData((prev) => ({
                              ...prev,
                              extraCosts: [],
                            }));
                          }}
                          className="block p-1 text-red-600 transition-colors rounded hover:bg-red-50 md:hidden"
                          title="Clear all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setBillData((prev) => ({
                            ...prev,
                            extraCosts: [
                              ...prev.extraCosts,
                              {
                                id: crypto.randomUUID(),
                                date: format(new Date(), "yyyy-MM-dd"),
                                note: "",
                                pieces: 0,
                                pricePerPiece: 0,
                                total: 0, // Local UI calculation only
                              },
                            ],
                          }));
                        }}
                        className="items-center hidden gap-2 px-4 py-2 text-sm font-medium bg-gray-100 rounded-md md:flex hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                        વધારાનો ખર્ચ ઉમેરો
                      </button>
                    </div>
                  </div>


                  {billData.extraCosts.length > 0 && (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-sm text-left text-gray-500">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th className="px-4 py-3">તારીખ</th>
                              <th className="px-4 py-3">નોંધ</th>
                              <th className="px-4 py-3">સંખ્યા</th>
                              <th className="px-4 py-3">નંગ</th>
                              <th className="px-4 py-3">કુલ</th>
                              <th className="px-4 py-3">ક્ષમતા</th>
                            </tr>
                          </thead>
                          <tbody>
                            {billData.extraCosts.map((cost, index) => (
                              <tr key={cost.id} className="bg-white">
                                <td className="px-4 py-2">
                                  <input
                                    type="date"
                                    value={cost.date}
                                    onChange={(e) => {
                                      const newCosts = [...billData.extraCosts];
                                      newCosts[index] = {
                                        ...cost,
                                        date: e.target.value,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        extraCosts: newCosts,
                                      }));
                                    }}
                                    className="px-2 py-1 border rounded w-36"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    value={cost.note}
                                    onChange={(e) => {
                                      const newCosts = [...billData.extraCosts];
                                      newCosts[index] = {
                                        ...cost,
                                        note: e.target.value,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        extraCosts: newCosts,
                                      }));
                                    }}
                                    placeholder=" નોંધ "
                                    className="w-full px-2 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    value={cost.pieces}
                                    onChange={(e) => {
                                      const pieces = parseInt(e.target.value) || 0;
                                      const newCosts = [...billData.extraCosts];
                                      newCosts[index] = {
                                        ...cost,
                                        pieces,
                                        total: pieces * cost.pricePerPiece,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        extraCosts: newCosts,
                                      }));
                                    }}
                                    min="0"
                                    className="w-20 px-2 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    value={cost.pricePerPiece}
                                    onChange={(e) => {
                                      const price = parseFloat(e.target.value) || 0;
                                      const newCosts = [...billData.extraCosts];
                                      newCosts[index] = {
                                        ...cost,
                                        pricePerPiece: price,
                                        total: cost.pieces * price,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        extraCosts: newCosts,
                                      }));
                                    }}
                                    min="0"
                                    step="0.01"
                                    className="w-24 px-2 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  ₹{cost.total.toLocaleString("en-IN")}
                                </td>
                                <td className="px-4 py-2">
                                  <button
                                    onClick={() => {
                                      const newCosts = billData.extraCosts.filter(
                                        (c) => c.id !== cost.id
                                      );
                                      setBillData((prev) => ({
                                        ...prev,
                                        extraCosts: newCosts,
                                      }));
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {billData.extraCosts.length > 0 && (
                              <tr className="font-medium bg-gray-50">
                                <td colSpan={4} className="px-4 py-3 text-right">
                                  કુલ ચાર્જિસ:
                                </td>
                                <td colSpan={2} className="px-4 py-3">
                                  ₹
                                  {billData.extraCosts
                                    .reduce((sum, cost) => sum + cost.total, 0)
                                    .toLocaleString("en-IN")}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="space-y-3 md:hidden">
                        {billData.extraCosts.map((cost, index) => (
                          <div key={cost.id} className="relative p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-end">
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">તારીખ</label>
                                <input
                                  type="date"
                                  value={cost.date}
                                  onChange={(e) => {
                                    const newCosts = [...billData.extraCosts];
                                    newCosts[index] = {
                                      ...cost,
                                      date: e.target.value,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      extraCosts: newCosts,
                                    }));
                                  }}
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">નોંધ</label>
                                <input
                                  type="text"
                                  value={cost.note}
                                  onChange={(e) => {
                                    const newCosts = [...billData.extraCosts];
                                    newCosts[index] = {
                                      ...cost,
                                      note: e.target.value,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      extraCosts: newCosts,
                                    }));
                                  }}
                                  placeholder="નોંધ"
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const newCosts = billData.extraCosts.filter(
                                    (c) => c.id !== cost.id
                                  );
                                  setBillData((prev) => ({
                                    ...prev,
                                    extraCosts: newCosts,
                                  }));
                                }}
                                className="p-2 mb-0.5 text-red-600 transition-colors rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">સંખ્યા</label>
                                <input
                                  type="number"
                                  value={cost.pieces}
                                  onChange={(e) => {
                                    const pieces = parseInt(e.target.value) || 0;
                                    const newCosts = [...billData.extraCosts];
                                    newCosts[index] = {
                                      ...cost,
                                      pieces,
                                      total: pieces * cost.pricePerPiece,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      extraCosts: newCosts,
                                    }));
                                  }}
                                  min="0"
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">નંગ</label>
                                <input
                                  type="number"
                                  value={cost.pricePerPiece}
                                  onChange={(e) => {
                                    const price = parseFloat(e.target.value) || 0;
                                    const newCosts = [...billData.extraCosts];
                                    newCosts[index] = {
                                      ...cost,
                                      pricePerPiece: price,
                                      total: cost.pieces * price,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      extraCosts: newCosts,
                                    }));
                                  }}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">કુલ</label>
                                <div className="px-2 py-1 text-sm font-medium text-gray-900">
                                  ₹{cost.total.toLocaleString("en-IN")}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Mobile Total */}
                        <div className="flex justify-between p-3 font-medium border-t-2 border-gray-300 bg-gray-50">
                          <span>કુલ ચાર્જિસ:</span>
                          <span>
                            ₹{billData.extraCosts
                              .reduce((sum, cost) => sum + cost.total, 0)
                              .toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Section E: Discounts */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-medium text-gray-900">
                      છૂટ
                    </h4>
                    <div className="flex items-center gap-2">
                      {billData.discounts.length > 0 && (
                        <button
                          onClick={() => {
                            setBillData((prev) => ({
                              ...prev,
                              discounts: [],
                            }));
                          }}
                          className="block p-1 text-red-600 transition-colors rounded hover:bg-red-50 md:hidden"
                          title="Clear all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setBillData((prev) => ({
                            ...prev,
                            discounts: [
                              ...prev.discounts,
                              {
                                id: crypto.randomUUID(),
                                date: format(new Date(), "yyyy-MM-dd"),
                                note: "",
                                pieces: 0,
                                discountPerPiece: 0,
                                total: 0,
                              },
                            ],
                          }));
                        }}
                        className="items-center hidden gap-2 px-4 py-2 text-sm font-medium bg-gray-100 rounded-md md:flex hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                        છૂટ ઉમેરો
                      </button>
                    </div>
                  </div>


                  {billData.discounts.length > 0 && (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-sm text-left text-gray-500">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th className="px-4 py-3">તારીખ</th>
                              <th className="px-4 py-3">નોંધ</th>
                              <th className="px-4 py-3">સંખ્યા</th>
                              <th className="px-4 py-3">નંગ</th>
                              <th className="px-4 py-3">કુલ</th>
                              <th className="px-4 py-3">ક્ષમતા</th>
                            </tr>
                          </thead>
                          <tbody>
                            {billData.discounts.map((discount, index) => (
                              <tr key={discount.id} className="bg-white">
                                <td className="px-4 py-2">
                                  <input
                                    type="date"
                                    value={discount.date}
                                    onChange={(e) => {
                                      const newDiscounts = [...billData.discounts];
                                      newDiscounts[index] = {
                                        ...discount,
                                        date: e.target.value,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        discounts: newDiscounts,
                                      }));
                                    }}
                                    className="px-2 py-1 border rounded w-36"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    value={discount.note}
                                    onChange={(e) => {
                                      const newDiscounts = [...billData.discounts];
                                      newDiscounts[index] = {
                                        ...discount,
                                        note: e.target.value,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        discounts: newDiscounts,
                                      }));
                                    }}
                                    placeholder="Enter note"
                                    className="w-full px-2 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    value={discount.pieces}
                                    onChange={(e) => {
                                      const pieces = parseInt(e.target.value) || 0;
                                      const newDiscounts = [...billData.discounts];
                                      newDiscounts[index] = {
                                        ...discount,
                                        pieces,
                                        total: pieces * discount.discountPerPiece,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        discounts: newDiscounts,
                                      }));
                                    }}
                                    min="0"
                                    className="w-20 px-2 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    value={discount.discountPerPiece}
                                    onChange={(e) => {
                                      const discountPerPiece = parseFloat(e.target.value) || 0;
                                      const newDiscounts = [...billData.discounts];
                                      newDiscounts[index] = {
                                        ...discount,
                                        discountPerPiece,
                                        total: discount.pieces * discountPerPiece,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        discounts: newDiscounts,
                                      }));
                                    }}
                                    min="0"
                                    step="0.01"
                                    className="w-24 px-2 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  ₹{discount.total.toLocaleString("en-IN")}
                                </td>
                                <td className="px-4 py-2">
                                  <button
                                    onClick={() => {
                                      const newDiscounts = billData.discounts.filter(
                                        (d) => d.id !== discount.id
                                      );
                                      setBillData((prev) => ({
                                        ...prev,
                                        discounts: newDiscounts,
                                      }));
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {billData.discounts.length > 0 && (
                              <tr className="font-medium bg-gray-50">
                                <td colSpan={4} className="px-4 py-3 text-right">
                                  કુલ છૂટ:
                                </td>
                                <td colSpan={2} className="px-4 py-3">
                                  ₹
                                  {billData.discounts
                                    .reduce((sum, discount) => sum + discount.total, 0)
                                    .toLocaleString("en-IN")}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="space-y-3 md:hidden">
                        {billData.discounts.map((discount, index) => (
                          <div key={discount.id} className="relative p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-end">
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">તારીખ</label>
                                <input
                                  type="date"
                                  value={discount.date}
                                  onChange={(e) => {
                                    const newDiscounts = [...billData.discounts];
                                    newDiscounts[index] = {
                                      ...discount,
                                      date: e.target.value,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      discounts: newDiscounts,
                                    }));
                                  }}
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">નોંધ</label>
                                <input
                                  type="text"
                                  value={discount.note}
                                  onChange={(e) => {
                                    const newDiscounts = [...billData.discounts];
                                    newDiscounts[index] = {
                                      ...discount,
                                      note: e.target.value,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      discounts: newDiscounts,
                                    }));
                                  }}
                                  placeholder="નોંધ"
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const newDiscounts = billData.discounts.filter(
                                    (d) => d.id !== discount.id
                                  );
                                  setBillData((prev) => ({
                                    ...prev,
                                    discounts: newDiscounts,
                                  }));
                                }}
                                className="p-2 mb-0.5 text-red-600 transition-colors rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">સંખ્યા</label>
                                <input
                                  type="number"
                                  value={discount.pieces}
                                  onChange={(e) => {
                                    const pieces = parseInt(e.target.value) || 0;
                                    const newDiscounts = [...billData.discounts];
                                    newDiscounts[index] = {
                                      ...discount,
                                      pieces,
                                      total: pieces * discount.discountPerPiece,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      discounts: newDiscounts,
                                    }));
                                  }}
                                  min="0"
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">નંગ</label>
                                <input
                                  type="number"
                                  value={discount.discountPerPiece}
                                  onChange={(e) => {
                                    const discountPerPiece = parseFloat(e.target.value) || 0;
                                    const newDiscounts = [...billData.discounts];
                                    newDiscounts[index] = {
                                      ...discount,
                                      discountPerPiece,
                                      total: discount.pieces * discountPerPiece,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      discounts: newDiscounts,
                                    }));
                                  }}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">કુલ</label>
                                <div className="px-2 py-1 text-sm font-medium text-gray-900">
                                  ₹{discount.total.toLocaleString("en-IN")}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Mobile Total */}
                        <div className="flex justify-between p-3 font-medium border-t-2 border-gray-300 bg-gray-50">
                          <span>કુલ છૂટ:</span>
                          <span>
                            ₹{billData.discounts
                              .reduce((sum, discount) => sum + discount.total, 0)
                              .toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Section F: Payments */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-medium text-gray-900">
                      ચુકવણી
                    </h4>
                    <div className="flex items-center gap-2">
                      {billData.payments.length > 0 && (
                        <button
                          onClick={() => {
                            setBillData((prev) => ({
                              ...prev,
                              payments: [],
                            }));
                          }}
                          className="block p-1 text-red-600 transition-colors rounded hover:bg-red-50 md:hidden"
                          title="Clear all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setBillData((prev) => ({
                            ...prev,
                            payments: [
                              ...prev.payments,
                              {
                                id: crypto.randomUUID(),
                                date: format(new Date(), "yyyy-MM-dd"),
                                note: "",
                                amount: 0,
                                method: "cash",
                              },
                            ],
                          }));
                        }}
                        className="items-center hidden gap-2 px-4 py-2 text-sm font-medium bg-gray-100 rounded-md md:flex hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                        ચુકવણી ઉમેરો
                      </button>
                    </div>
                  </div>


                  {billData.payments.length > 0 && (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-sm text-left text-gray-500">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th className="px-4 py-3">તારીખ</th>
                              <th className="px-4 py-3">નોંધ</th>
                              <th className="px-4 py-3">પેમેન્ટ મેથડ</th>
                              <th className="px-4 py-3">પેમેન્ટ</th>
                              <th className="px-4 py-3">ક્ષમતા</th>
                            </tr>
                          </thead>
                          <tbody>
                            {billData.payments.map((payment, index) => (
                              <tr key={payment.id} className="bg-white">
                                <td className="px-4 py-2">
                                  <input
                                    type="date"
                                    value={payment.date}
                                    onChange={(e) => {
                                      const newPayments = [...billData.payments];
                                      newPayments[index] = {
                                        ...payment,
                                        date: e.target.value,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        payments: newPayments,
                                      }));
                                    }}
                                    className="px-2 py-1 border rounded w-36"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    value={payment.note}
                                    onChange={(e) => {
                                      const newPayments = [...billData.payments];
                                      newPayments[index] = {
                                        ...payment,
                                        note: e.target.value,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        payments: newPayments,
                                      }));
                                    }}
                                    placeholder="Enter note"
                                    className="w-full px-2 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <select
                                    value={payment.method}
                                    onChange={(e) => {
                                      const newPayments = [...billData.payments];
                                      newPayments[index] = {
                                        ...payment,
                                        method: e.target.value as Payment["method"],
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        payments: newPayments,
                                      }));
                                    }}
                                    className="w-32 px-2 py-1 border rounded"
                                  >
                                    <option value="cash">રોકડ</option>
                                    <option value="bank">બેંક</option>
                                    <option value="upi">UPI</option>
                                    <option value="cheque">ચેક</option>
                                    <option value="card">કાર્ડ</option>
                                    <option value="other">અન્ય</option>
                                  </select>
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    value={payment.amount}
                                    onChange={(e) => {
                                      const amount = parseFloat(e.target.value) || 0;
                                      const newPayments = [...billData.payments];
                                      newPayments[index] = {
                                        ...payment,
                                        amount,
                                      };
                                      setBillData((prev) => ({
                                        ...prev,
                                        payments: newPayments,
                                      }));
                                    }}
                                    min="0"
                                    step="0.01"
                                    className="w-32 px-2 py-1 border rounded"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <button
                                    onClick={() => {
                                      const newPayments = billData.payments.filter(
                                        (p) => p.id !== payment.id
                                      );
                                      setBillData((prev) => ({
                                        ...prev,
                                        payments: newPayments,
                                      }));
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {billData.payments.length > 0 && (
                              <tr className="font-medium bg-gray-50">
                                <td colSpan={3} className="px-4 py-3 text-right">
                                  કુલ પેમેન્ટ:
                                </td>
                                <td colSpan={2} className="px-4 py-3">
                                  ₹
                                  {billData.payments
                                    .reduce((sum, payment) => sum + payment.amount, 0)
                                    .toLocaleString("en-IN")}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="space-y-3 md:hidden">
                        {billData.payments.map((payment, index) => (
                          <div key={payment.id} className="relative p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-end">
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">તારીખ</label>
                                <input
                                  type="date"
                                  value={payment.date}
                                  onChange={(e) => {
                                    const newPayments = [...billData.payments];
                                    newPayments[index] = {
                                      ...payment,
                                      date: e.target.value,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      payments: newPayments,
                                    }));
                                  }}
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">નોંધ</label>
                                <input
                                  type="text"
                                  value={payment.note}
                                  onChange={(e) => {
                                    const newPayments = [...billData.payments];
                                    newPayments[index] = {
                                      ...payment,
                                      note: e.target.value,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      payments: newPayments,
                                    }));
                                  }}
                                  placeholder="નોંધ"
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const newPayments = billData.payments.filter(
                                    (p) => p.id !== payment.id
                                  );
                                  setBillData((prev) => ({
                                    ...prev,
                                    payments: newPayments,
                                  }));
                                }}
                                className="p-2 mb-0.5 text-red-600 transition-colors rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">મેથડ</label>
                                <select
                                  value={payment.method}
                                  onChange={(e) => {
                                    const newPayments = [...billData.payments];
                                    newPayments[index] = {
                                      ...payment,
                                      method: e.target.value as Payment["method"],
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      payments: newPayments,
                                    }));
                                  }}
                                  className="w-full px-2 py-1 text-sm border rounded"
                                >
                                  <option value="cash">રોકડ</option>
                                  <option value="bank">બેંક</option>
                                  <option value="upi">UPI</option>
                                  <option value="cheque">ચેક</option>
                                  <option value="card">કાર્ડ</option>
                                  <option value="other">અન્ય</option>
                                </select>
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-gray-600">પેમેન્ટ</label>
                                <input
                                  type="number"
                                  value={payment.amount}
                                  onChange={(e) => {
                                    const amount = parseFloat(e.target.value) || 0;
                                    const newPayments = [...billData.payments];
                                    newPayments[index] = {
                                      ...payment,
                                      amount,
                                    };
                                    setBillData((prev) => ({
                                      ...prev,
                                      payments: newPayments,
                                    }));
                                  }}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-2 py-1 text-sm border rounded"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Mobile Total */}
                        <div className="flex justify-between p-3 font-medium border-t-2 border-gray-300 bg-gray-50">
                          <span>કુલ પેમેન્ટ:</span>
                          <span>
                            ₹{billData.payments
                              .reduce((sum, payment) => sum + payment.amount, 0)
                              .toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}


          {/* Section G: Bill Summary */}
          {showLedger && billData.fromDate && (
            <div className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
              <h4 className="mb-4 text-base font-medium text-gray-900">
                બિલ સારાંશ
              </h4>
              <div className="space-y-3 text-sm">
                {Object.entries(summaryMap as Record<string, number>).map(
                  ([label, amount]) => (
                    <div
                      key={label}
                      className={`flex justify-between items-center ${label.startsWith("Sub Total") ||
                        label.startsWith("GRAND TOTAL") ||
                        label.startsWith("DUE PAYMENT")
                        ? "pt-2 text-base font-semibold border-t border-gray-200"
                        : ""
                        } ${label.startsWith("DUE PAYMENT")
                          ? amount > 0
                            ? "text-red-600"
                            : "text-green-600"
                          : label.startsWith("GRAND TOTAL")
                            ? "text-blue-600"
                            : ""
                        }`}
                    >
                      <span>{label}:</span>
                      <span>₹{Math.abs(amount).toLocaleString("en-IN")}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Section H: Main Note */}
          {showLedger && billData.fromDate && (
            <div className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
              <h4 className="mb-4 text-base font-medium text-gray-900">
                મુખ્ય નોંધ
              </h4>
              <textarea
                value={billData.mainNote}
                onChange={(e) =>
                  setBillData((prev) => ({ ...prev, mainNote: e.target.value }))
                }
                placeholder="શરતો ..."
                className="w-full h-32 px-3 py-2 border rounded-lg resize-none"
              />
            </div>
          )}

          {/* Section I: Action Buttons */}
          {showLedger && billData.fromDate && (
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowPreview(true)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                પ્રિવ્યુ
              </button>
              <button
                onClick={handleGenerateBill}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                બિલ જનરેટ કરો
              </button>
            </div>
          )}

        </div>
      </div>
      <Toaster />

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">બિલ પ્રિવ્યુ</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto overflow-x-hidden bg-gray-100 flex-1 flex justify-center">
              <div className="bg-white shadow-lg origin-top transform scale-[0.45] sm:scale-75 md:scale-100 shrink-0 w-[794px]">
                <BillInvoiceTemplate
                  companyDetails={{
                    name: "Nilkanth Plate Depot",
                    address: "Street Address",
                    phone: "Phone Number",
                  }}
                  billDetails={{
                    billNumber: billData.billNumber,
                    billDate: billData.billDate,
                    fromDate: billData.fromDate || "",
                    toDate: billData.toDate,
                    dailyRent: billData.dailyRent,
                  }}
                  clientDetails={{
                    name: client?.client_name || "",
                    nicName: client?.client_nic_name || "",
                    site: client?.site || "",
                    phone: client?.primary_phone_number || "",
                  }}
                  rentalCharges={billResult?.billingPeriods.periods.map(period => ({
                    size: "All",
                    pieces: period.plateCount,
                    days: period.days,
                    rate: billData.dailyRent,
                    amount: period.plateCount * period.days * billData.dailyRent,
                  })) || []}
                  extraCosts={billData.extraCosts.map(cost => ({
                    id: cost.id,
                    date: cost.date,
                    description: cost.note,
                    amount: cost.total,
                  }))}
                  discounts={billData.discounts.map(discount => ({
                    id: discount.id,
                    date: discount.date,
                    description: discount.note,
                    amount: discount.total,
                  }))}
                  payments={billData.payments.map(payment => ({
                    id: payment.id,
                    date: payment.date,
                    method: payment.method,
                    note: payment.note,
                    amount: payment.amount,
                  }))}
                  summary={fullSummary}
                  mainNote={billData.mainNote}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                બંધ કરો
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleGenerateBill();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                બિલ જનરેટ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Bill Template for JPEG generation */}
      <div id="invoice-template" style={{ position: 'absolute', left: '-9999px' }}>
        <BillInvoiceTemplate
          companyDetails={{
            name: "Nilkanth Plate Depot",
            address: "Street Address",
            phone: "Phone Number",
          }}
          billDetails={{
            billNumber: billData.billNumber,
            billDate: billData.billDate,
            fromDate: billData.fromDate || "",
            toDate: billData.toDate,
            dailyRent: billData.dailyRent,
          }}
          clientDetails={{
            name: client?.client_name || "",
            nicName: client?.client_nic_name || "",
            site: client?.site || "",
            phone: client?.primary_phone_number || "",
          }}
          rentalCharges={billResult?.billingPeriods.periods.map(period => ({
            size: "All",
            pieces: period.plateCount,
            days: period.days,
            rate: billData.dailyRent,
            amount: period.plateCount * period.days * billData.dailyRent,
          })) || []}
          extraCosts={billData.extraCosts.map(cost => ({
            id: cost.id,
            date: cost.date,
            description: cost.note,
            amount: cost.total,
          }))}
          discounts={billData.discounts.map(discount => ({
            id: discount.id,
            date: discount.date,
            description: discount.note,
            amount: discount.total,
          }))}
          payments={billData.payments.map(payment => ({
            id: payment.id,
            date: payment.date,
            method: payment.method,
            note: payment.note,
            amount: payment.amount,
          }))}
          summary={fullSummary}
          mainNote={billData.mainNote}
        />
      </div>
    </div >
  );
}
