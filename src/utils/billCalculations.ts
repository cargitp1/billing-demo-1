import { parseISO, differenceInDays } from 'date-fns';

interface SizeBalance {
  size: string;
  total: number;
}

interface ExtraCost {
  date: string;
  note: string;
  pieces: number;
  pricePerPiece: number;
  total: number;
}

interface Discount {
  date: string;
  note: string;
  pieces: number;
  discountPerPiece: number;
  total: number;
}

interface Payment {
  date: string;
  method: 'cash' | 'bank' | 'upi' | 'cheque' | 'card' | 'other';
  note: string;
  amount: number;
}

export const calculateDays = (fromDate: string, toDate: string): number => {
  try {
    // Parse the dates and ensure they're valid
    const start = parseISO(fromDate);
    const end = parseISO(toDate);
    
    // Calculate days including both start and end dates
    return differenceInDays(end, start) + 1;
  } catch (error) {
    console.error('Error calculating days:', error);
    return 0;
  }
};

export const calculateRentForSize = (
  pieces: number,
  days: number,
  dailyRent: number
): number => {
  // Ensure all values are numbers and not null/undefined
  const validPieces = Number(pieces) || 0;
  const validDays = Number(days) || 0;
  const validDailyRent = Number(dailyRent) || 0;

  // Calculate with decimal precision
  return Math.round((validPieces * validDays * validDailyRent) * 100) / 100;
};

export const calculateTotalRent = (
  sizeBalances: Record<string, SizeBalance>,
  days: number,
  dailyRent: number
): number => {
  // Handle null/undefined sizeBalances
  if (!sizeBalances) return 0;

  return Object.values(sizeBalances).reduce((total, { total: pieces }) => {
    return total + calculateRentForSize(pieces || 0, days, dailyRent);
  }, 0);
};

export const calculateTotalExtraCosts = (extraCosts: ExtraCost[]): number => {
  // Handle null/undefined extraCosts
  if (!extraCosts) return 0;

  return extraCosts.reduce((total, cost) => {
    // Ensure the total is a valid number
    const costTotal = Number(cost.total) || 0;
    return total + costTotal;
  }, 0);
};

export const calculateTotalDiscounts = (discounts: Discount[]): number => {
  // Handle null/undefined discounts
  if (!discounts) return 0;

  return discounts.reduce((total, discount) => {
    // Ensure the total is a valid number
    const discountTotal = Number(discount.total) || 0;
    return total + discountTotal;
  }, 0);
};

export const calculateTotalPayments = (payments: Payment[]): number => {
  // Handle null/undefined payments
  if (!payments) return 0;

  return payments.reduce((total, payment) => {
    // Ensure the amount is a valid number
    const amount = Number(payment.amount) || 0;
    return total + amount;
  }, 0);
};

export const calculateGrandTotal = (
  totalRent: number,
  totalExtraCosts: number,
  totalDiscounts: number
): number => {
  // Ensure all values are numbers
  const validRent = Number(totalRent) || 0;
  const validExtraCosts = Number(totalExtraCosts) || 0;
  const validDiscounts = Number(totalDiscounts) || 0;

  // Calculate with decimal precision
  return Math.round((validRent + validExtraCosts - validDiscounts) * 100) / 100;
};

export const calculateDuePayment = (
  grandTotal: number,
  totalPayments: number
): number => {
  // Ensure all values are numbers
  const validGrandTotal = Number(grandTotal) || 0;
  const validTotalPayments = Number(totalPayments) || 0;

  // Calculate with decimal precision
  return Math.round((validGrandTotal - validTotalPayments) * 100) / 100;
};

export const getBillSummary = (
  fromDate: string,
  toDate: string,
  dailyRent: number,
  sizeBalances: Record<string, SizeBalance>,
  extraCosts: ExtraCost[],
  discounts: Discount[],
  payments: Payment[]
) => {
  // Step 1: Calculate days
  const days = calculateDays(fromDate, toDate);

  // Step 2 & 3: Calculate total rent across all sizes
  const totalRent = calculateTotalRent(sizeBalances, days, dailyRent);

  // Step 4: Calculate total extra costs
  const totalExtraCosts = calculateTotalExtraCosts(extraCosts);

  // Step 5: Calculate total discounts
  const totalDiscounts = calculateTotalDiscounts(discounts);

  // Step 6: Calculate total payments
  const totalPayments = calculateTotalPayments(payments);

  // Step 7: Calculate grand total
  const grandTotal = calculateGrandTotal(totalRent, totalExtraCosts, totalDiscounts);

  // Step 8: Calculate due payment
  const duePayment = calculateDuePayment(grandTotal, totalPayments);

  return {
    days,
    totalRent,
    totalExtraCosts,
    totalDiscounts,
    grandTotal,
    totalPayments,
    duePayment,
  };
};