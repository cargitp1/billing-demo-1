import { supabase } from './supabase';

interface BillData {
  bill_number: string;
  client_id: string;
  from_date: string;
  to_date: string;
  bill_date: string;
  daily_rent: number;
  total_rent: number;
  extra_costs_total: number;
  discounts_total: number;
  total_paid: number;
  grand_total: number;
  due_payment: number;
  status?: 'draft' | 'generated' | 'cancelled';
}

interface ExtraCost {
  date: string;
  note: string;
  pieces: number;
  pricePerPiece: number;
}

interface Discount {
  date: string;
  note: string;
  pieces: number;
  discountPerPiece: number;
}

interface Payment {
  date: string;
  note: string;
  amount: number;
  method: 'cash' | 'bank' | 'upi' | 'cheque' | 'card' | 'other';
}

export const validateBillData = async (billData: BillData): Promise<{ valid: boolean; error?: string }> => {
  // Check for required fields
  const requiredFields = [
    'bill_number',
    'client_id',
    'from_date',
    'to_date',
    'billing_date',
    'daily_rent'
  ];

  for (const field of requiredFields) {
    if (!billData[field as keyof BillData]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Verify bill number uniqueness
  const { data: existingBill } = await supabase
    .from('bills')
    .select('bill_number')
    .eq('bill_number', billData.bill_number)
    .single();

  if (existingBill) {
    return { valid: false, error: 'Bill number already exists' };
  }

  // Validate date formats
  const dateFields = ['from_date', 'to_date', 'bill_date'];
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  for (const field of dateFields) {
    if (!dateRegex.test(billData[field as keyof BillData] as string)) {
      return { valid: false, error: `Invalid date format for ${field}` };
    }
  }

  // Validate numeric fields
  const numericFields = [
    'daily_rent',
    'total_rent',
    'extra_costs_total',
    'discounts_total',
    'total_paid',
    'grand_total',
    'due_payment'
  ];

  for (const field of numericFields) {
    const value = billData[field as keyof BillData];
    if (typeof value !== 'number' || isNaN(value)) {
      return { valid: false, error: `Invalid numeric value for ${field}` };
    }
  }

  return { valid: true };
};

export const saveBill = async (
  billData: BillData,
  extraCosts: ExtraCost[] = [],
  discounts: Discount[] = [],
  payments: Payment[] = []
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First validate the bill data
    const validation = await validateBillData(billData);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    console.log('Saving bill data:', {
      billNumber: billData.bill_number,
      clientId: billData.client_id,
      totalAmount: billData.total_rent_amount,
      extraCostsCount: extraCosts.length,
      discountsCount: discounts.length,
      paymentsCount: payments.length
    });

    // Start a Supabase transaction
    const billWithStatus = {
      ...billData,
      status: 'generated' as const
    };

    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert(billWithStatus)
      .select()
      .single();

    if (billError) {
      console.error('Error saving bill:', billError);
      return { success: false, error: 'Failed to save bill' };
    }

    // Save extra costs if any
    if (extraCosts.length > 0) {
      const { error: extraError } = await supabase
        .from('bill_extra_costs')
        .insert(
          extraCosts.map(cost => ({
            bill_number: billData.bill_number,
            date: cost.date,
            note: cost.note,
            pieces: cost.pieces,
            price_per_piece: cost.pricePerPiece
          }))
        );

      if (extraError) {
        console.error('Error saving extra costs:', extraError);
        return { success: false, error: 'Failed to save extra costs' };
      }
    }

    // Save discounts if any
    if (discounts.length > 0) {
      const { error: discountError } = await supabase
        .from('bill_discounts')
        .insert(
          discounts.map(discount => ({
            bill_number: billData.bill_number,
            date: discount.date,
            note: discount.note,
            pieces: discount.pieces,
            discount_per_piece: discount.discountPerPiece
          }))
        );

      if (discountError) {
        console.error('Error saving discounts:', discountError);
        return { success: false, error: 'Failed to save discounts' };
      }
    }

    // Save payments if any
    if (payments.length > 0) {
      const { error: paymentError } = await supabase
        .from('bill_payments')
        .insert(
          payments.map(payment => ({
            bill_number: billData.bill_number,
            date: payment.date,
            note: payment.note,
            amount: payment.amount,
            payment_method: payment.method
          }))
        );

      if (paymentError) {
        console.error('Error saving payments:', paymentError);
        return { success: false, error: 'Failed to save payments' };
      }
    }

      console.log('Bill saved successfully:', {
        billNumber: bill.bill_number,
        totalRent: billData.total_rent,
        grandTotal: billData.grand_total
      });    return { success: true };
  } catch (error) {
    console.error('Unexpected error saving bill:', error);
    return { success: false, error: 'Unexpected error saving bill' };
  }
}