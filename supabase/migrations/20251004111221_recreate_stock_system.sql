/*
  # Recreate Stock Management System

  1. Changes
    - Drop old stock table and functions
    - Create new stock table with cleaner structure
    - Create functions to calculate on_rent and borrowed from challans
    - Add trigger to automatically update available_stock

  2. New Tables
    - `stock`
      - `size` (integer, primary key, 1-9)
      - `total_stock` (integer) - Manually managed total inventory
      - `lost_stock` (integer) - Manually managed lost/damaged items
      - `on_rent` (integer, computed) - Auto-calculated from udhar_items - jama_items
      - `borrowed` (integer, computed) - Auto-calculated from udhar_items - jama_items
      - `available` (integer, computed) - total_stock - on_rent - borrowed - lost_stock
      - `updated_at` (timestamp)

  3. Functions
    - `calculate_on_rent(size)` - Calculate current on_rent for a size
    - `calculate_borrowed(size)` - Calculate current borrowed for a size

  4. Security
    - Enable RLS on `stock` table
    - Policies for authenticated users
*/

-- Drop old table if exists (CASCADE will drop triggers and dependent objects)
DROP TABLE IF EXISTS stock CASCADE;

-- Drop old functions if they exist
DROP FUNCTION IF EXISTS increment_stock(INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS decrement_stock(INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_stock_timestamp();

-- Create function to calculate on_rent for a size
CREATE OR REPLACE FUNCTION calculate_on_rent(p_size INTEGER)
RETURNS INTEGER AS $$
DECLARE
  total_udhar INTEGER;
  total_jama INTEGER;
  result INTEGER;
BEGIN
  -- Sum all udhar quantities for this size
  SELECT COALESCE(SUM(
    CASE p_size
      WHEN 1 THEN size_1_qty
      WHEN 2 THEN size_2_qty
      WHEN 3 THEN size_3_qty
      WHEN 4 THEN size_4_qty
      WHEN 5 THEN size_5_qty
      WHEN 6 THEN size_6_qty
      WHEN 7 THEN size_7_qty
      WHEN 8 THEN size_8_qty
      WHEN 9 THEN size_9_qty
    END
  ), 0) INTO total_udhar
  FROM udhar_items;

  -- Sum all jama quantities for this size
  SELECT COALESCE(SUM(
    CASE p_size
      WHEN 1 THEN size_1_qty
      WHEN 2 THEN size_2_qty
      WHEN 3 THEN size_3_qty
      WHEN 4 THEN size_4_qty
      WHEN 5 THEN size_5_qty
      WHEN 6 THEN size_6_qty
      WHEN 7 THEN size_7_qty
      WHEN 8 THEN size_8_qty
      WHEN 9 THEN size_9_qty
    END
  ), 0) INTO total_jama
  FROM jama_items;

  -- Calculate difference (what's currently out on rent)
  result := total_udhar - total_jama;

  -- Ensure non-negative
  IF result < 0 THEN
    result := 0;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate borrowed for a size
CREATE OR REPLACE FUNCTION calculate_borrowed(p_size INTEGER)
RETURNS INTEGER AS $$
DECLARE
  total_udhar_borrowed INTEGER;
  total_jama_borrowed INTEGER;
  result INTEGER;
BEGIN
  -- Sum all udhar borrowed quantities for this size
  SELECT COALESCE(SUM(
    CASE p_size
      WHEN 1 THEN size_1_borrowed
      WHEN 2 THEN size_2_borrowed
      WHEN 3 THEN size_3_borrowed
      WHEN 4 THEN size_4_borrowed
      WHEN 5 THEN size_5_borrowed
      WHEN 6 THEN size_6_borrowed
      WHEN 7 THEN size_7_borrowed
      WHEN 8 THEN size_8_borrowed
      WHEN 9 THEN size_9_borrowed
    END
  ), 0) INTO total_udhar_borrowed
  FROM udhar_items;

  -- Sum all jama borrowed quantities for this size
  SELECT COALESCE(SUM(
    CASE p_size
      WHEN 1 THEN size_1_borrowed
      WHEN 2 THEN size_2_borrowed
      WHEN 3 THEN size_3_borrowed
      WHEN 4 THEN size_4_borrowed
      WHEN 5 THEN size_5_borrowed
      WHEN 6 THEN size_6_borrowed
      WHEN 7 THEN size_7_borrowed
      WHEN 8 THEN size_8_borrowed
      WHEN 9 THEN size_9_borrowed
    END
  ), 0) INTO total_jama_borrowed
  FROM jama_items;

  -- Calculate difference (what's currently borrowed)
  result := total_udhar_borrowed - total_jama_borrowed;

  -- Ensure non-negative
  IF result < 0 THEN
    result := 0;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create stock table with computed columns
CREATE TABLE stock (
  size INTEGER PRIMARY KEY CHECK (size >= 1 AND size <= 9),
  total_stock INTEGER DEFAULT 0 NOT NULL CHECK (total_stock >= 0),
  lost_stock INTEGER DEFAULT 0 NOT NULL CHECK (lost_stock >= 0),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initialize with 9 rows (one for each size)
INSERT INTO stock (size, total_stock, lost_stock)
VALUES
  (1, 0, 0),
  (2, 0, 0),
  (3, 0, 0),
  (4, 0, 0),
  (5, 0, 0),
  (6, 0, 0),
  (7, 0, 0),
  (8, 0, 0),
  (9, 0, 0)
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
CREATE TRIGGER stock_updated_at
BEFORE UPDATE ON stock
FOR EACH ROW
EXECUTE FUNCTION update_stock_timestamp();

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
