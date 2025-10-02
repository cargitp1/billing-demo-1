export interface StockData {
  size: number;
  total_stock: number;
  on_rent_stock: number;
  borrowed_stock: number;
  lost_stock: number;
  available_stock: number;
  updated_at: string;
}

export interface StockSummary {
  totalInventory: number;
  onRent: number;
  borrowed: number;
  available: number;
}

export const calculateStockSummary = (stockData: StockData[]): StockSummary => {
  return stockData.reduce(
    (acc, stock) => ({
      totalInventory: acc.totalInventory + stock.total_stock,
      onRent: acc.onRent + stock.on_rent_stock,
      borrowed: acc.borrowed + stock.borrowed_stock,
      available: acc.available + stock.available_stock,
    }),
    { totalInventory: 0, onRent: 0, borrowed: 0, available: 0 }
  );
};

export const validateStockAvailability = (
  stockData: StockData[],
  items: Array<{ size: number; quantity: number }>
): { valid: boolean; insufficientSizes: number[] } => {
  const insufficientSizes: number[] = [];

  items.forEach(item => {
    const stock = stockData.find(s => s.size === item.size);
    if (!stock || stock.available_stock < item.quantity) {
      insufficientSizes.push(item.size);
    }
  });

  return {
    valid: insufficientSizes.length === 0,
    insufficientSizes,
  };
};
