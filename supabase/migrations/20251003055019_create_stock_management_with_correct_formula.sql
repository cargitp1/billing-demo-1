/*
  # Stock Management System Migration

  1. New Tables
    - `stock`
      - `size` (integer, primary key, 1-9) - Plate size identifier
      - `total_stock` (integer, default 0) - Total inventory owned
      - `on_rent_stock` (integer, default 0) - Currently rented out (auto-updated by challans)
      - `borrowed_stock` (integer, default 0) - Borrowed from partners (tracked separately)
      - `lost_stock` (integer, default 0) - Lost/damaged stock
      - `available_stock` (integer, computed) - Formula: total - on_rent - lost (excludes borrowed)
      - `updated_at` (timestamp) - Last modification time

  2. Available Stock Logic
    - IMPORTANT: borrowed_stock does NOT affect available_stock
    - Borrowed plates are from partners, not our owned inventory
    - Formula: available_stock = total_stock - on_rent_stock - lost_stock

  3. RPC Functions
    - `increment_stock` - Called when Udhar challan is created (increases on_rent/borrowed counts)
    - `decrement_stock` - Called when Jama challan is created (decreases on_rent/borrowed counts)

  4. Triggers
    - Auto-update timestamp on stock changes

  5. Security
    - Enable RLS on `stock` table
    - Add policies for authenticated users to read and update stock

  6. Initial Data
    - Insert 9 rows (one for each plate size 1-9)
*/

-- Create stock table
CREATE TABLE IF NOT EXISTS stock (
  size INTEGER PRIMARY KEY CHECK (size >= 1 AND size <= 9),
  total_stock INTEGER DEFAULT 0 NOT NULL CHECK (total_stock >= 0),
  on_rent_stock INTEGER DEFAULT 0 NOT NULL CHECK (on_rent_stock >= 0),
  borrowed_stock INTEGER DEFAULT 0 NOT NULL CHECK (borrowed_stock >= 0),
  lost_stock INTEGER DEFAULT 0 NOT NULL CHECK (lost_stock >= 0),
  available_stock INTEGER GENERATED ALWAYS AS (total_stock - on_rent_stock - lost_stock) STORED,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initialize with 9 rows (one for each size)
INSERT INTO stock (size, total_stock, on_rent_stock, borrowed_stock, lost_stock)
VALUES
  (1, 0, 0, 0, 0),
  (2, 0, 0, 0, 0),
  (3, 0, 0, 0, 0),
  (4, 0, 0, 0, 0),
  (5, 0, 0, 0, 0),
  (6, 0, 0, 0, 0),
  (7, 0, 0, 0, 0),
  (8, 0, 0, 0, 0),
  (9, 0, 0, 0, 0)
ON CONFLICT (size) DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_stock_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
DROP TRIGGER IF EXISTS stock_updated_at ON stock;
CREATE TRIGGER stock_updated_at
BEFORE UPDATE ON stock
FOR EACH ROW
EXECUTE FUNCTION update_stock_timestamp();

-- Create RPC function to increment stock (for Udhar challan)
CREATE OR REPLACE FUNCTION increment_stock(
  p_size INTEGER,
  p_on_rent_increment INTEGER,
  p_borrowed_increment INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE stock
  SET
    on_rent_stock = on_rent_stock + p_on_rent_increment,
    borrowed_stock = borrowed_stock + p_borrowed_increment
  WHERE size = p_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to decrement stock (for Jama challan)
CREATE OR REPLACE FUNCTION decrement_stock(
  p_size INTEGER,
  p_on_rent_decrement INTEGER,
  p_borrowed_decrement INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE stock
  SET
    on_rent_stock = GREATEST(0, on_rent_stock - p_on_rent_decrement),
    borrowed_stock = GREATEST(0, borrowed_stock - p_borrowed_decrement)
  WHERE size = p_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;

-- Create policies for stock table
CREATE POLICY "Authenticated users can view stock"
  ON stock
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update stock"
  ON stock
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
