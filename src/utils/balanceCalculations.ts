import { format } from 'date-fns';

interface Balance {
  [size: string]: {
    main: number;
    borrowed: number;
    total?: number;
  };
}

interface ChallanItem {
  [key: string]: number;  // For size_N_qty and size_N_borrowed fields
}

interface Challan {
  udhar_date?: string;
  jama_date?: string;
  items: ChallanItem[];
}

export const calculateBalance = (
  udharChallans: Challan[], 
  jamaChallans: Challan[], 
  toDate: string
): Balance => {
  // Initialize balance object for all 9 sizes
  const balance: Balance = {};
  for (let i = 1; i <= 9; i++) {
    balance[i] = { main: 0, borrowed: 0 };
  }

  const toDateTime = new Date(toDate).getTime();

  // Log initial state
  console.log('Balance Calculation Starting:', {
    toDate,
    udharCount: udharChallans?.length || 0,
    jamaCount: jamaChallans?.length || 0
  });

  // Process Udhar challans (additions)
  udharChallans?.forEach((challan, index) => {
    if (!challan.udhar_date) {
      console.warn(`Udhar challan at index ${index} missing date`);
      return;
    }

    const challanDate = new Date(challan.udhar_date).getTime();
    if (challanDate <= toDateTime) {
      if (!challan.items?.[0]) {
        console.warn(`Udhar challan at index ${index} has no items`);
        return;
      }

      for (let size = 1; size <= 9; size++) {
        const mainQty = Number(challan.items[0][`size_${size}_qty`]) || 0;
        const borrowedQty = Number(challan.items[0][`size_${size}_borrowed`]) || 0;

        balance[size].main += mainQty;
        balance[size].borrowed += borrowedQty;

        // Log significant changes
        if (mainQty > 0 || borrowedQty > 0) {
          console.log(`Udhar Addition for Size ${size}:`, {
            date: challan.udhar_date,
            main: mainQty,
            borrowed: borrowedQty,
            newBalance: { ...balance[size] }
          });
        }
      }
    }
  });

  // Process Jama challans (subtractions)
  jamaChallans?.forEach((challan, index) => {
    if (!challan.jama_date) {
      console.warn(`Jama challan at index ${index} missing date`);
      return;
    }

    const challanDate = new Date(challan.jama_date).getTime();
    if (challanDate <= toDateTime) {
      if (!challan.items?.[0]) {
        console.warn(`Jama challan at index ${index} has no items`);
        return;
      }

      for (let size = 1; size <= 9; size++) {
        const mainQty = Number(challan.items[0][`size_${size}_qty`]) || 0;
        const borrowedQty = Number(challan.items[0][`size_${size}_borrowed`]) || 0;

        balance[size].main -= mainQty;
        balance[size].borrowed -= borrowedQty;

        // Check for negative balances (shouldn't happen)
        if (balance[size].main < 0 || balance[size].borrowed < 0) {
          console.warn(`Negative balance detected for Size ${size}:`, {
            date: challan.jama_date,
            main: balance[size].main,
            borrowed: balance[size].borrowed
          });
        }

        // Log significant changes
        if (mainQty > 0 || borrowedQty > 0) {
          console.log(`Jama Subtraction for Size ${size}:`, {
            date: challan.jama_date,
            main: mainQty,
            borrowed: borrowedQty,
            newBalance: { ...balance[size] }
          });
        }
      }
    }
  });

  // Calculate totals and do final validation
  Object.keys(balance).forEach(size => {
    balance[size].total = balance[size].main + balance[size].borrowed;
    
    // Ensure no negative values in final balance
    if (balance[size].main < 0) balance[size].main = 0;
    if (balance[size].borrowed < 0) balance[size].borrowed = 0;
    if (balance[size].total! < 0) balance[size].total = 0;
  });

  // Log final balance
  console.log('Final Balance:', balance);

  return balance;
};

export const calculateFromDate = (udharChallans: Challan[]): string | null => {
  if (!Array.isArray(udharChallans) || udharChallans.length === 0) {
    console.log('No udhar challans found for from date calculation');
    return null;
  }

  // Filter out challans without dates
  const validChallans = udharChallans.filter(c => c.udhar_date);
  
  if (validChallans.length === 0) {
    console.warn('No valid dates found in udhar challans');
    return null;
  }

  // Get all valid dates
  const dates = validChallans.map(c => new Date(c.udhar_date!).getTime());
  
  // Find earliest date
  const earliestDate = new Date(Math.min(...dates));
  
  // Format date as YYYY-MM-DD
  const formattedDate = format(earliestDate, 'yyyy-MM-dd');
  
  console.log('From Date Calculation:', {
    totalChallans: udharChallans.length,
    validChallans: validChallans.length,
    earliestDate: formattedDate
  });

  return formattedDate;
};