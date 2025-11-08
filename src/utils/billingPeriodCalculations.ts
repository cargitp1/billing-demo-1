import { addDays, parseISO, differenceInDays } from 'date-fns';

interface ChallanEntry {
  date: string;
  effectiveDate: string;
  type: 'udhar' | 'jama';
  plateCount: number;
  challanNumber: string;
  sortPriority: 1 | 2;
}

interface LedgerEntry {
  transactionDate: string;
  effectiveDate: string;
  balanceBefore: number;
  udharAmount?: number;
  jamaAmount?: number;
  balanceAfter: number;
  entryType: 'udhar' | 'jama';
  challanNumber: string;
  sortPriority: 1 | 2;
}

interface BillingPeriod {
  startDate: string;
  endDate: string;
  plateCount: number;
  days: number;
  rent: number;
  causeType: 'udhar' | 'jama';
  challanNumber: string;
}

export interface BillingPeriodResult {
  entries: ChallanEntry[];
  ledger: LedgerEntry[];
  periods: BillingPeriod[];
  totalRent: number;
}

export function createCombinedEntryList(
  udharChallans: Array<{ 
    udhar_date: string; 
    udhar_challan_number: string;
    items: any; // Can be array or single item
  }>,
  jamaReturns: Array<{
    jama_date: string;
    jama_challan_number: string;
    items: any; // Can be array or single item
  }>
): ChallanEntry[] {
  console.log('Processing Challans:', {
    udharCount: udharChallans.length,
    jamaCount: jamaReturns.length,
    firstUdhar: udharChallans[0],
    firstJama: jamaReturns[0]
  });
  const entries: ChallanEntry[] = [];

  // Process Udhar challans
  udharChallans.forEach(challan => {
    // Ensure items is an array, if not, wrap the single item in an array
    const itemsArray = Array.isArray(challan.items) ? challan.items : [challan.items];
    
    const totalPlates = itemsArray.reduce((sum, item) => {
      if (!item) return sum;
      // Sum up all size quantities and borrowed quantities
      let total = 0;
      for (let i = 1; i <= 9; i++) {
        total += (item[`size_${i}_qty`] || 0) + (item[`size_${i}_borrowed`] || 0);
      }
      return sum + total;
    }, 0);

    entries.push({
      date: challan.udhar_date,
      effectiveDate: challan.udhar_date, // Same day for Udhar
      type: 'udhar',
      plateCount: totalPlates,
      challanNumber: challan.udhar_challan_number,
      sortPriority: 1
    });
  });

  // Process Jama returns
  jamaReturns.forEach(jama => {
    // Ensure items is an array, if not, wrap the single item in an array
    const itemsArray = Array.isArray(jama.items) ? jama.items : [jama.items];
    
    const totalPlates = itemsArray.reduce((sum, item) => {
      if (!item) return sum;
      // Sum up all size quantities and borrowed quantities
      let total = 0;
      for (let i = 1; i <= 9; i++) {
        total += (item[`size_${i}_qty`] || 0) + (item[`size_${i}_borrowed`] || 0);
      }
      return sum + total;
    }, 0);

    // For Jama, effective date is next day
    const effectiveDate = addDays(parseISO(jama.jama_date), 1).toISOString().split('T')[0];

    entries.push({
      date: jama.jama_date,
      effectiveDate,
      type: 'jama',
      plateCount: totalPlates,
      challanNumber: jama.jama_challan_number,
      sortPriority: 2
    });
  });

  // Sort by date and priority
  return entries.sort((a, b) => {
    const dateCompare = a.effectiveDate.localeCompare(b.effectiveDate);
    if (dateCompare !== 0) return dateCompare;
    return a.sortPriority - b.sortPriority;
  });
}

export function buildTransactionLedger(entries: ChallanEntry[]): LedgerEntry[] {
  let currentBalance = 0;
  const ledger: LedgerEntry[] = [];

  entries.forEach(entry => {
    const balanceBefore = currentBalance;

    if (entry.type === 'udhar') {
      currentBalance += entry.plateCount;
    } else {
      currentBalance -= entry.plateCount;
    }

    ledger.push({
      transactionDate: entry.date,
      effectiveDate: entry.effectiveDate,
      balanceBefore,
      [entry.type === 'udhar' ? 'udharAmount' : 'jamaAmount']: entry.plateCount,
      balanceAfter: currentBalance,
      entryType: entry.type,
      challanNumber: entry.challanNumber,
      sortPriority: entry.sortPriority
    });
  });

  return ledger;
}

export function calculateBillingPeriods(
  entries: ChallanEntry[],
  billDate: string,
  dailyRate: number
): BillingPeriodResult {
  let currentBalance = 0;
  const ledger = buildTransactionLedger(entries);
  const periods: BillingPeriod[] = [];
  let totalRent = 0;

  // Group changes by effective date
  const balanceChanges = entries.reduce((acc, entry) => {
    const date = entry.effectiveDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, ChallanEntry[]>);

  // Process each date's changes in sequence
  const dates = Object.keys(balanceChanges).sort();
  
  for (let i = 0; i < dates.length; i++) {
    const currentDate = dates[i];
    const nextDate = i < dates.length - 1 ? dates[i + 1] : billDate;
    
    // Apply all changes for this date
    balanceChanges[currentDate].forEach(change => {
      if (change.type === 'udhar') {
        currentBalance += change.plateCount;
      } else {
        currentBalance -= change.plateCount;
      }
    });

    // If we have a positive balance and days until next change
    if (currentBalance > 0) {
      const days = differenceInDays(parseISO(nextDate), parseISO(currentDate));
      if (days > 0) {
        const rent = currentBalance * days * dailyRate;
        totalRent += rent;

        periods.push({
          startDate: currentDate,
          endDate: nextDate,
          plateCount: currentBalance,
          days,
          rent,
          causeType: balanceChanges[currentDate][0].type,
          challanNumber: balanceChanges[currentDate][0].challanNumber
        });
      }
    }
  }

  return {
    entries,
    ledger,
    periods,
    totalRent
  };
}

export function calculateBill(
  udharChallans: any[],
  jamaReturns: any[],
  billDate: string,
  dailyRate: number,
  extraCharges: Array<{ amount: number }> = [],
  discounts: Array<{ amount: number }> = [],
  payments: Array<{ amount: number }> = [],
  serviceRate: number = 10
): {
  billingPeriods: BillingPeriodResult;
  extraChargesTotal: number;
  discountsTotal: number;
  paymentsTotal: number;
  serviceChargeTotal: number;
  grandTotal: number;
  dueAmount: number;
} {
  // Calculate billing periods and rent
  const entries = createCombinedEntryList(udharChallans, jamaReturns);
  const billingPeriods = calculateBillingPeriods(entries, billDate, dailyRate);

  // Calculate other components
  const extraChargesTotal = extraCharges.reduce((sum, charge) => sum + charge.amount, 0);
  const discountsTotal = discounts.reduce((sum, discount) => sum + discount.amount, 0);
  const paymentsTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate service charge (₹10 per plate by default)
  const serviceChargeTotal = billingPeriods.periods.reduce((sum, period) => {
    return sum + (period.plateCount * serviceRate);
  }, 0);

  // Calculate final totals
  const grandTotal = billingPeriods.totalRent + extraChargesTotal + serviceChargeTotal - discountsTotal;
  const dueAmount = grandTotal - paymentsTotal;

  return {
    billingPeriods,
    extraChargesTotal,
    discountsTotal,
    paymentsTotal,
    serviceChargeTotal,
    grandTotal,
    dueAmount
  };
}