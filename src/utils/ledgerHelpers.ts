import { supabase } from './supabase';

export interface ItemsData {
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
  size_1_note: string | null;
  size_2_note: string | null;
  size_3_note: string | null;
  size_4_note: string | null;
  size_5_note: string | null;
  size_6_note: string | null;
  size_7_note: string | null;
  size_8_note: string | null;
  size_9_note: string | null;
  main_note: string | null;
}

export interface Transaction {
  type: 'udhar' | 'jama';
  challanNumber: string;
  date: string;
  site: string;
  phone: string;
  driver: string | null;
  items: ItemsData;
  grandTotal: number;
}

export const fetchClientTransactions = async (clientId: string): Promise<Transaction[]> => {
  const { data: udharData } = await supabase
    .from('udhar_challans')
    .select(`
      udhar_challan_number,
      udhar_date,
      alternative_site,
      secondary_phone_number,
      driver_name,
      client:clients!udhar_challans_client_id_fkey (
        site,
        primary_phone_number
      ),
      items:udhar_items!udhar_items_udhar_challan_number_fkey (*)
    `)
    .eq('client_id', clientId);

  const { data: jamaData } = await supabase
    .from('jama_challans')
    .select(`
      jama_challan_number,
      jama_date,
      alternative_site,
      secondary_phone_number,
      driver_name,
      client:clients!jama_challans_client_id_fkey (
        site,
        primary_phone_number
      ),
      items:jama_items!jama_items_jama_challan_number_fkey (*)
    `)
    .eq('client_id', clientId);

  const udhar: Transaction[] = (udharData || []).map((c: any) => ({
    type: 'udhar' as const,
    challanNumber: c.udhar_challan_number,
    date: c.udhar_date,
    site: c.alternative_site || c.client?.site || '',
    phone: c.secondary_phone_number || c.client?.primary_phone_number || '',
    driver: c.driver_name,
    items: c.items?.[0] || createEmptyItems(),
    grandTotal: calculateTotal(c.items?.[0] || createEmptyItems())
  }));

  const jama: Transaction[] = (jamaData || []).map((c: any) => ({
    type: 'jama' as const,
    challanNumber: c.jama_challan_number,
    date: c.jama_date,
    site: c.alternative_site || c.client?.site || '',
    phone: c.secondary_phone_number || c.client?.primary_phone_number || '',
    driver: c.driver_name,
    items: c.items?.[0] || createEmptyItems(),
    grandTotal: calculateTotal(c.items?.[0] || createEmptyItems())
  }));

  return [...udhar, ...jama].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const calculateCurrentBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((balance, txn) => {
    const total = txn.grandTotal;
    return txn.type === 'udhar'
      ? balance + total
      : balance - total;
  }, 0);
};

export const calculateTotal = (items: ItemsData): number => {
  let total = 0;
  for (let i = 1; i <= 9; i++) {
    total += ((items as any)[`size_${i}_qty`] || 0) + ((items as any)[`size_${i}_borrowed`] || 0);
  }
  return total;
};

export const createEmptyItems = (): ItemsData => ({
  size_1_qty: 0, size_2_qty: 0, size_3_qty: 0, size_4_qty: 0, size_5_qty: 0,
  size_6_qty: 0, size_7_qty: 0, size_8_qty: 0, size_9_qty: 0,
  size_1_borrowed: 0, size_2_borrowed: 0, size_3_borrowed: 0, size_4_borrowed: 0, size_5_borrowed: 0,
  size_6_borrowed: 0, size_7_borrowed: 0, size_8_borrowed: 0, size_9_borrowed: 0,
  size_1_note: null, size_2_note: null, size_3_note: null, size_4_note: null, size_5_note: null,
  size_6_note: null, size_7_note: null, size_8_note: null, size_9_note: null,
  main_note: null,
});

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};
