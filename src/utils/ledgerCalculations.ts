import { supabase } from './supabase';

export interface SizeBalance {
  main: number;
  borrowed: number;
  total: number;
}

export interface Transaction {
  type: 'udhar' | 'jama';
  challanNumber: string;
  date: string;
  grandTotal: number;
  sizes: { [key: string]: { qty: number; borrowed: number } };
  site: string;
  driverName: string;
  items: any;
  challanId: string;
}

export interface ClientBalance {
  grandTotal: number;
  sizes: { [key: string]: SizeBalance };
}

export interface ClientLedgerData {
  clientId: string;
  clientNicName: string;
  clientFullName: string;
  clientSite: string;
  clientPhone: string;
  currentBalance: ClientBalance;
  transactions: Transaction[];
}

export async function fetchClientLedger(clientId: string): Promise<ClientLedgerData | null> {
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .maybeSingle();

  if (clientError || !client) {
    console.error('Error fetching client:', clientError);
    return null;
  }

  const { data: udharChallans, error: udharError } = await supabase
    .from('udhar_challans')
    .select(`
      udhar_challan_number,
      udhar_date,
      driver_name,
      alternative_site,
      id,
      items:udhar_items!udhar_items_udhar_challan_number_fkey (
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
    `)
    .eq('client_id', clientId)
    .order('udhar_date', { ascending: true });

  const { data: jamaChallans, error: jamaError } = await supabase
    .from('jama_challans')
    .select(`
      jama_challan_number,
      jama_date,
      driver_name,
      alternative_site,
      id,
      items:jama_items!jama_items_jama_challan_number_fkey (
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
    `)
    .eq('client_id', clientId)
    .order('jama_date', { ascending: true });

  if (udharError || jamaError) {
    console.error('Error fetching challans:', udharError || jamaError);
    return null;
  }

  const transactions: Transaction[] = [];

  (udharChallans || []).forEach((challan: any) => {
    const rawItems = challan.items;
    const itemRow = Array.isArray(rawItems) ? (rawItems[0] || {}) : (rawItems || {});

    const sizes: { [key: string]: { qty: number; borrowed: number } } = {};
    let grandTotal = 0;

    for (let i = 1; i <= 9; i++) {
      const qty = itemRow[`size_${i}_qty`] || 0;
      const borrowed = itemRow[`size_${i}_borrowed`] || 0;
      sizes[i] = { qty, borrowed };
      grandTotal += qty + borrowed;
    }

    transactions.push({
      type: 'udhar',
      challanNumber: challan.udhar_challan_number,
      date: challan.udhar_date,
      grandTotal,
      sizes,
      site: challan.alternative_site || client.site,
      driverName: challan.driver_name || '',
      items: itemRow,
      challanId: challan.id
    });
  });

  (jamaChallans || []).forEach((challan: any) => {
    const rawItems = challan.items;
    const itemRow = Array.isArray(rawItems) ? (rawItems[0] || {}) : (rawItems || {});

    const sizes: { [key: string]: { qty: number; borrowed: number } } = {};
    let grandTotal = 0;

    for (let i = 1; i <= 9; i++) {
      const qty = itemRow[`size_${i}_qty`] || 0;
      const borrowed = itemRow[`size_${i}_borrowed`] || 0;
      sizes[i] = { qty, borrowed };
      grandTotal += qty + borrowed;
    }

    transactions.push({
      type: 'jama',
      challanNumber: challan.jama_challan_number,
      date: challan.jama_date,
      grandTotal,
      sizes,
      site: challan.alternative_site || client.site,
      driverName: challan.driver_name || '',
      items: itemRow,
      challanId: challan.id
    });
  });

  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentBalance = calculateBalance(transactions);

  return {
    clientId: client.id,
    clientNicName: client.client_nic_name,
    clientFullName: client.client_name,
    clientSite: client.site,
    clientPhone: client.primary_phone_number,
    currentBalance,
    transactions
  };
}

export function calculateBalance(transactions: Transaction[]): ClientBalance {
  const balance: ClientBalance = {
    grandTotal: 0,
    sizes: {}
  };

  for (let i = 1; i <= 9; i++) {
    balance.sizes[i] = { main: 0, borrowed: 0, total: 0 };
  }

  transactions.forEach(transaction => {
    for (let i = 1; i <= 9; i++) {
      const size = transaction.sizes[i];
      if (transaction.type === 'udhar') {
        balance.sizes[i].main += size.qty;
        balance.sizes[i].borrowed += size.borrowed;
      } else {
        balance.sizes[i].main -= size.qty;
        balance.sizes[i].borrowed -= size.borrowed;
      }
      balance.sizes[i].total = balance.sizes[i].main + balance.sizes[i].borrowed;
    }
  });

  balance.grandTotal = Object.values(balance.sizes).reduce((sum, size) => sum + size.total, 0);

  return balance;
}

export async function fetchAllClientLedgers(): Promise<ClientLedgerData[]> {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('client_nic_name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  const ledgers = await Promise.all(
    (clients || []).map(async (client) => {
      const ledger = await fetchClientLedger(client.id);
      return ledger;
    })
  );

  return ledgers.filter((ledger): ledger is ClientLedgerData => ledger !== null);
}
