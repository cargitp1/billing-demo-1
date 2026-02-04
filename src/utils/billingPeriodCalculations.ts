import { addDays, parseISO, differenceInDays, format } from 'date-fns';

/**
 * BILLING PERIOD CALCULATION SYSTEM
 * -------------------------------
 * Updated to include transactionAmount
 * 
 * EDGE CASES HANDLED:
 * 
 * 1. Same-Day Events
 *    Problem: Udhar and Jama on same day
 *    Solution: sortPriority (Udhar=1, Jama=2)
 *    Example:
 *    ┌─ Jan 10: Udhar 100 (priority 1)
 *    └─ Jan 10: Jama 50  (priority 2)
 *    Result: Balance = 50 plates (100 - 50)
 * 
 * 2. Bill Date Inclusion
 *    Problem: Last period must include bill date
 *    Solution: +1 day for final period
 *    Example:
 *    Jan 20 Udhar → Jan 31 Bill
 *    Days = 12 (Jan 20-31 inclusive)
 * 
 * 3. Zero/Invalid Cases
 *    Problems:
 *    - Zero days between events
 *    - Zero/negative plate balance
 *    - Invalid date ranges
 *    Solution: Multiple validation checks
 *    ┌─ if (currentBalance > 0)     // Valid plate count
 *    ├─ if (daysToCharge > 0)       // Valid period length
 *    └─ parseISO() validation       // Valid dates
 * 
 * KEY FORMULAS AND RULES:
 * 
 * 1. Day Calculations:
 *    - Between dates: differenceInDays(endDate, startDate)
 *    - For Jama periods: Add +1 to include return date
 *    - For final period: Add +1 to include bill date
 * 
 * 2. Rent Calculations:
 *    - Per period: plates × days × daily_rate
 *    - Total rent: Sum of all period rents
 * 
 * 3. Date Handling:
 *    - Udhar effective_date = issue_date (immediate)
 *    - Jama effective_date = return_date + 1 day
 *    - Period end = next_event_date - 1 (unless Jama)
 * 
 * EXAMPLE TIMELINE:
 * Jan 1 (Udhar 100) → Jan 10 (Jama 50) → Jan 20 (Udhar 30) → Jan 31 (Bill)
 * 
 * Period 1: Jan 1-10 (10 days, 100 plates)
 * ├─ Start: Jan 1 (Udhar date)
 * └─ End: Jan 10 (Include Jama date)
 * 
 * Period 2: Jan 11-19 (9 days, 50 plates)
 * ├─ Start: Jan 11 (Day after Jama)
 * └─ End: Jan 19 (Before next Udhar)
 * 
 * Period 3: Jan 20-31 (12 days, 80 plates)
 * ├─ Start: Jan 20 (Udhar date)
 * └─ End: Jan 31 (Include bill date)
 * 
 * WHY THIS WORKS:
 * ✓ No gaps: Every day has a plate balance
 * ✓ No overlaps: Clear period boundaries
 * ✓ Fair billing: Charge for actual possession days
 * ✓ Accurate transitions: Clean handoffs between periods
 */

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
  txnQty: number;
  udharQty?: number;  // Individual udhar quantity if both types on same date
  jamaQty?: number;   // Individual jama quantity if both types on same date
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

    console.log('Udhar Entry plateCount:', totalPlates, 'from items:', itemsArray);

    entries.push({
      date: challan.udhar_date,           // When plates were issued
      effectiveDate: challan.udhar_date,  // Start billing from issue date
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

    // Special Case: If Udhar and Jama are on the SAME DAY, use the same effective date
    // This allows the return to net out the udhar immediately, resulting in 0 rent for that day
    // "check challan date if its same... count it combainly... adding extra cost"
    const hasUdharSameDay = udharChallans.some(u => u.udhar_date === jama.jama_date);

    let effectiveDate: string;
    if (hasUdharSameDay) {
      effectiveDate = jama.jama_date; // No +1 shift
    } else {
      effectiveDate = format(addDays(parseISO(jama.jama_date), 1), 'yyyy-MM-dd');
    }

    entries.push({
      date: jama.jama_date,          // Actual return date (when plates were returned)
      effectiveDate: effectiveDate,   // First day with no plates (no rent charged)
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

  // Sort entries by actual transaction date (not effective date)
  // This ensures the ledger shows events in chronological order
  const sortedEntries = [...entries].sort((a, b) => {
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    return dateCompare === 0 ? a.sortPriority - b.sortPriority : dateCompare;
  });

  sortedEntries.forEach(entry => {
    const balanceBefore = currentBalance;

    // For display purposes:
    // - Udhar reduces balance immediately
    // - Jama keeps same balance on return date (changes next day)
    if (entry.type === 'udhar') {
      currentBalance += entry.plateCount;
    } else {
      // For Jama, the balance changes on effective date (next day)
      currentBalance -= entry.plateCount;
    }

    ledger.push({
      transactionDate: entry.date,         // Actual event date (for display)
      effectiveDate: entry.effectiveDate,  // When balance actually changes
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
  const periods: BillingPeriod[] = [];
  let totalRent = 0;

  // First sort entries by date and priority
  // This ensures when Udhar and Jama happen on the same date:
  // 1. Process Udhar first (priority 1) - Add plates to balance
  // 2. Then process Jama (priority 2) - Remove plates from balance
  entries.sort((a, b) => {
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    return dateCompare === 0 ? (a.sortPriority - b.sortPriority) : dateCompare;
  });

  const ledger = buildTransactionLedger(entries);

  // Filter entries to strictly exclude anything after the bill date
  // This ensures the bill stops exactly at the "To Date"
  const filteredEntries = entries.filter(entry => entry.date <= billDate);

  // Group changes by effective date (when balance actually changes)
  // For billing calculations:
  // - Udhar: Use issue date (balance changes immediately)
  // - Jama: Use next day (balance changes day after return)
  const balanceChanges = filteredEntries.reduce((acc, entry) => {
    // Use effectiveDate for balance changes:
    // Udhar: Same as transaction date
    // Jama: Next day after return
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
    /**
     * EDGE CASE 1: Same-Day Events
     * --------------------------
     * When Udhar and Jama happen on the same day:
     * 1. Sort by priority (Udhar=1, Jama=2)
     * 2. Process Udhar first (add plates)
     * 3. Then process Jama (remove plates)
     * 
     * Example:
     * Jan 10: Udhar 100 plates → Balance = 100
     * Jan 10: Jama 50 plates  → Balance = 50
     */
    const sortedChanges = [...balanceChanges[currentDate]].sort((a, b) => a.sortPriority - b.sortPriority);

    sortedChanges.forEach(change => {
      // Validate plate count
      if (change.plateCount <= 0) {
        console.warn(`Invalid plate count in ${change.type} challan ${change.challanNumber}`);
        return;
      }

      if (change.type === 'udhar') {
        currentBalance += change.plateCount;  // Add plates from Udhar
      } else {
        // Prevent negative balance from Jama
        if (currentBalance < change.plateCount) {
          console.warn(`Warning: Jama ${change.plateCount} plates exceeds current balance of ${currentBalance}`);
          currentBalance = 0;  // Set to zero instead of negative
        } else {
          currentBalance -= change.plateCount;  // Remove plates from Jama
        }
      }
    });

    // Only calculate rent if there are plates to charge for
    if (currentBalance > 0) {
      /**
       * PERIOD CALCULATION BLOCK
       * -----------------------
       * Calculate period details including:
       * 1. Start and end dates
       * 2. Number of days to charge
       * 3. Validation and error handling
       */

      // Initialize period data
      let periodData: { days: number; endDate: string; } | null = null;

      try {
        // Start date is simply the effective date of the change
        const effectiveStartDate = parseISO(currentDate);

        if (isNaN(effectiveStartDate.getTime())) {
          throw new Error(`Invalid start date: ${currentDate}`);
        }

        if (i < dates.length - 1) {
          // Regular period with next event
          const endDateObj = parseISO(nextDate);
          if (isNaN(endDateObj.getTime())) {
            throw new Error(`Invalid end date: ${nextDate}`);
          }

          // Use the start date directly
          periodData = {
            days: differenceInDays(endDateObj, effectiveStartDate),
            endDate: nextDate
          };
        } else {
          // Last period - include bill date
          const billDateObj = parseISO(billDate);
          if (isNaN(billDateObj.getTime())) {
            throw new Error(`Invalid bill date: ${billDate}`);
          }

          periodData = {
            days: differenceInDays(billDateObj, effectiveStartDate) + 1,
            endDate: format(addDays(billDateObj, 1), 'yyyy-MM-dd')
          };
        }
      } catch (error) {
        console.error('Date processing error:', error);
        continue;  // Skip invalid periods
      }

      // Create period if we have valid data with positive days
      if (periodData && periodData.days > 0) {

        // Final days calculation
        let finalDays = periodData.days;

        // Recalculate rent with corrected days
        const rateInPaise = Math.round(dailyRate * 100);
        const rentInPaise = currentBalance * finalDays * rateInPaise;
        const rent = Math.round(rentInPaise) / 100;

        // Get transaction quantities - check if there are both udhar and jama on this date
        const changesOnDate = balanceChanges[currentDate];
        const udharChange = changesOnDate.find(c => c.type === 'udhar');
        const jamaChange = changesOnDate.find(c => c.type === 'jama');

        const txnQty = changesOnDate[0].plateCount || 0;
        const udharQty = udharChange ? udharChange.plateCount : undefined;
        const jamaQty = jamaChange ? jamaChange.plateCount : undefined;

        console.log('Period txnQty:', txnQty, 'udharQty:', udharQty, 'jamaQty:', jamaQty, 'from date:', currentDate);

        // Add the billing period with full details
        periods.push({
          startDate: currentDate,
          endDate: periodData.endDate,
          plateCount: currentBalance,
          days: finalDays,
          rent,
          causeType: balanceChanges[currentDate][0].type,
          challanNumber: balanceChanges[currentDate][0].challanNumber,
          txnQty,
          udharQty,
          jamaQty
        });

        // Update total rent
        totalRent += rent;
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
  serviceRate: number = 10,
  fromDate?: string // New optional parameter
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
  let billingPeriods = calculateBillingPeriods(entries, billDate, dailyRate);

  // If fromDate is provided, filter and clamp periods
  if (fromDate) {
    const clampedPeriods: BillingPeriod[] = [];
    let clampedTotalRent = 0;

    billingPeriods.periods.forEach(period => {
      // 1. Period ends before fromDate: Skip completely
      if (period.endDate < fromDate) {
        return;
      }

      // 2. Period starts after or on fromDate: Keep as is
      if (period.startDate >= fromDate) {
        clampedPeriods.push(period);
        clampedTotalRent += period.rent;
        return;
      }

      // 3. Period overlaps (Start < fromDate < End): Clamp Start
      // Recalculate days and rent

      const newStartDate = fromDate;
      const rateInPaise = Math.round(dailyRate * 100);

      // Determine if we need +1 day logic (if it was the last period ending on billDate)
      // Original logic:
      // If last period (ends on billDate): days = diff + 1
      // If normal period: days = diff

      // Check if original period treated endDate as inclusive (Last Period)
      // Standard logic: differenceInDays(end, start)
      // If days > diff(end, start), then it was inclusive.

      const rawDiff = differenceInDays(parseISO(period.endDate), parseISO(period.startDate));
      const isInclusiveEnd = period.days > rawDiff;

      const newDiff = differenceInDays(parseISO(period.endDate), parseISO(newStartDate));
      const newDays = isInclusiveEnd ? newDiff + 1 : newDiff;

      if (newDays > 0) {
        const rentInPaise = period.plateCount * newDays * rateInPaise;
        const newRent = Math.round(rentInPaise) / 100;

        clampedPeriods.push({
          ...period,
          startDate: newStartDate,
          days: newDays,
          rent: newRent
        });
        clampedTotalRent += newRent;
      }
    });

    // Update billingPeriods with clamped data
    billingPeriods = {
      ...billingPeriods,
      periods: clampedPeriods,
      totalRent: clampedTotalRent
    };
  }

  // Calculate other components
  const extraChargesTotal = extraCharges.reduce((sum, charge) => sum + charge.amount, 0);
  const discountsTotal = discounts.reduce((sum, discount) => sum + discount.amount, 0);
  const paymentsTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate service charge (₹10 per plate by default)
  // Logic update: Ensure service charge only applies to visible periods?
  // Usually service charge is per period or per bill. Assuming per period plate count is correct.
  const serviceChargeTotal = billingPeriods.periods.reduce((sum, period) => {
    return sum + (period.plateCount * serviceRate);
  }, 0);

  // Calculate total rent from periods in paise to avoid decimal issues
  const totalRentInPaise = billingPeriods.periods.reduce((sum, period) => {
    const rentInPaise = Math.round(period.rent * 100);
    return sum + rentInPaise;
  }, 0);
  const totalRent = Math.round(totalRentInPaise) / 100;

  // Calculate final totals in paise
  const grandTotalInPaise = Math.round((totalRent * 100) + (extraChargesTotal * 100) + (serviceChargeTotal * 100) - (discountsTotal * 100));
  const grandTotal = Math.round(grandTotalInPaise) / 100;
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