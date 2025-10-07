/*
  # Challan CRUD Operations with Stock Management

  1. New RPC Functions
    - `update_udhar_challan_with_stock` - Updates Udhar challan and adjusts stock
    - `update_jama_challan_with_stock` - Updates Jama challan and adjusts stock
    - `delete_udhar_challan_with_stock` - Deletes Udhar challan and reverts stock
    - `delete_jama_challan_with_stock` - Deletes Jama challan and reverts stock

  2. How It Works
    - UPDATE: Calculates difference between old and new values, adjusts stock accordingly
    - DELETE: Reverts stock changes by decrementing (Udhar) or incrementing (Jama)
    - All operations are atomic (transaction-based)
    - Returns JSON with success status and message

  3. Stock Management
    - Udhar (giving items): Increments on_rent_stock and borrowed_stock
    - Jama (receiving items): Decrements on_rent_stock and borrowed_stock
    - UPDATE: Adjusts based on difference (old vs new)
    - DELETE: Complete reversal of original operation
*/

-- =============================================================================
-- UPDATE UDHAR CHALLAN WITH STOCK
-- =============================================================================
CREATE OR REPLACE FUNCTION update_udhar_challan_with_stock(
  p_challan_number TEXT,
  p_client_id UUID,
  p_alternative_site TEXT,
  p_secondary_phone_number TEXT,
  p_udhar_date DATE,
  p_driver_name TEXT,
  -- Old items (for calculating difference)
  p_old_size_1_qty INTEGER, p_old_size_2_qty INTEGER, p_old_size_3_qty INTEGER,
  p_old_size_4_qty INTEGER, p_old_size_5_qty INTEGER, p_old_size_6_qty INTEGER,
  p_old_size_7_qty INTEGER, p_old_size_8_qty INTEGER, p_old_size_9_qty INTEGER,
  p_old_size_1_borrowed INTEGER, p_old_size_2_borrowed INTEGER, p_old_size_3_borrowed INTEGER,
  p_old_size_4_borrowed INTEGER, p_old_size_5_borrowed INTEGER, p_old_size_6_borrowed INTEGER,
  p_old_size_7_borrowed INTEGER, p_old_size_8_borrowed INTEGER, p_old_size_9_borrowed INTEGER,
  -- New items
  p_new_size_1_qty INTEGER, p_new_size_2_qty INTEGER, p_new_size_3_qty INTEGER,
  p_new_size_4_qty INTEGER, p_new_size_5_qty INTEGER, p_new_size_6_qty INTEGER,
  p_new_size_7_qty INTEGER, p_new_size_8_qty INTEGER, p_new_size_9_qty INTEGER,
  p_new_size_1_borrowed INTEGER, p_new_size_2_borrowed INTEGER, p_new_size_3_borrowed INTEGER,
  p_new_size_4_borrowed INTEGER, p_new_size_5_borrowed INTEGER, p_new_size_6_borrowed INTEGER,
  p_new_size_7_borrowed INTEGER, p_new_size_8_borrowed INTEGER, p_new_size_9_borrowed INTEGER,
  p_new_size_1_note TEXT, p_new_size_2_note TEXT, p_new_size_3_note TEXT,
  p_new_size_4_note TEXT, p_new_size_5_note TEXT, p_new_size_6_note TEXT,
  p_new_size_7_note TEXT, p_new_size_8_note TEXT, p_new_size_9_note TEXT,
  p_new_main_note TEXT
)
RETURNS JSON AS $$
DECLARE
  v_old_qty INTEGER;
  v_old_borrowed INTEGER;
  v_new_qty INTEGER;
  v_new_borrowed INTEGER;
  v_qty_diff INTEGER;
  v_borrowed_diff INTEGER;
BEGIN
  UPDATE udhar_challans
  SET
    client_id = p_client_id,
    alternative_site = p_alternative_site,
    secondary_phone_number = p_secondary_phone_number,
    udhar_date = p_udhar_date,
    driver_name = p_driver_name
  WHERE udhar_challan_number = p_challan_number;

  UPDATE udhar_items
  SET
    size_1_qty = p_new_size_1_qty, size_2_qty = p_new_size_2_qty, size_3_qty = p_new_size_3_qty,
    size_4_qty = p_new_size_4_qty, size_5_qty = p_new_size_5_qty, size_6_qty = p_new_size_6_qty,
    size_7_qty = p_new_size_7_qty, size_8_qty = p_new_size_8_qty, size_9_qty = p_new_size_9_qty,
    size_1_borrowed = p_new_size_1_borrowed, size_2_borrowed = p_new_size_2_borrowed, size_3_borrowed = p_new_size_3_borrowed,
    size_4_borrowed = p_new_size_4_borrowed, size_5_borrowed = p_new_size_5_borrowed, size_6_borrowed = p_new_size_6_borrowed,
    size_7_borrowed = p_new_size_7_borrowed, size_8_borrowed = p_new_size_8_borrowed, size_9_borrowed = p_new_size_9_borrowed,
    size_1_note = p_new_size_1_note, size_2_note = p_new_size_2_note, size_3_note = p_new_size_3_note,
    size_4_note = p_new_size_4_note, size_5_note = p_new_size_5_note, size_6_note = p_new_size_6_note,
    size_7_note = p_new_size_7_note, size_8_note = p_new_size_8_note, size_9_note = p_new_size_9_note,
    main_note = p_new_main_note
  WHERE udhar_challan_number = p_challan_number;

  FOR i IN 1..9 LOOP
    CASE i
      WHEN 1 THEN v_old_qty := p_old_size_1_qty; v_old_borrowed := p_old_size_1_borrowed; v_new_qty := p_new_size_1_qty; v_new_borrowed := p_new_size_1_borrowed;
      WHEN 2 THEN v_old_qty := p_old_size_2_qty; v_old_borrowed := p_old_size_2_borrowed; v_new_qty := p_new_size_2_qty; v_new_borrowed := p_new_size_2_borrowed;
      WHEN 3 THEN v_old_qty := p_old_size_3_qty; v_old_borrowed := p_old_size_3_borrowed; v_new_qty := p_new_size_3_qty; v_new_borrowed := p_new_size_3_borrowed;
      WHEN 4 THEN v_old_qty := p_old_size_4_qty; v_old_borrowed := p_old_size_4_borrowed; v_new_qty := p_new_size_4_qty; v_new_borrowed := p_new_size_4_borrowed;
      WHEN 5 THEN v_old_qty := p_old_size_5_qty; v_old_borrowed := p_old_size_5_borrowed; v_new_qty := p_new_size_5_qty; v_new_borrowed := p_new_size_5_borrowed;
      WHEN 6 THEN v_old_qty := p_old_size_6_qty; v_old_borrowed := p_old_size_6_borrowed; v_new_qty := p_new_size_6_qty; v_new_borrowed := p_new_size_6_borrowed;
      WHEN 7 THEN v_old_qty := p_old_size_7_qty; v_old_borrowed := p_old_size_7_borrowed; v_new_qty := p_new_size_7_qty; v_new_borrowed := p_new_size_7_borrowed;
      WHEN 8 THEN v_old_qty := p_old_size_8_qty; v_old_borrowed := p_old_size_8_borrowed; v_new_qty := p_new_size_8_qty; v_new_borrowed := p_new_size_8_borrowed;
      WHEN 9 THEN v_old_qty := p_old_size_9_qty; v_old_borrowed := p_old_size_9_borrowed; v_new_qty := p_new_size_9_qty; v_new_borrowed := p_new_size_9_borrowed;
    END CASE;

    v_qty_diff := v_new_qty - v_old_qty;
    v_borrowed_diff := v_new_borrowed - v_old_borrowed;

    IF v_qty_diff != 0 OR v_borrowed_diff != 0 THEN
      UPDATE stock
      SET
        on_rent_stock = on_rent_stock + v_qty_diff,
        borrowed_stock = borrowed_stock + v_borrowed_diff
      WHERE size = i;
    END IF;
  END LOOP;

  RETURN json_build_object('success', true, 'message', 'Udhar challan updated successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- UPDATE JAMA CHALLAN WITH STOCK
-- =============================================================================
CREATE OR REPLACE FUNCTION update_jama_challan_with_stock(
  p_challan_number TEXT,
  p_client_id UUID,
  p_alternative_site TEXT,
  p_secondary_phone_number TEXT,
  p_jama_date DATE,
  p_driver_name TEXT,
  -- Old items
  p_old_size_1_qty INTEGER, p_old_size_2_qty INTEGER, p_old_size_3_qty INTEGER,
  p_old_size_4_qty INTEGER, p_old_size_5_qty INTEGER, p_old_size_6_qty INTEGER,
  p_old_size_7_qty INTEGER, p_old_size_8_qty INTEGER, p_old_size_9_qty INTEGER,
  p_old_size_1_borrowed INTEGER, p_old_size_2_borrowed INTEGER, p_old_size_3_borrowed INTEGER,
  p_old_size_4_borrowed INTEGER, p_old_size_5_borrowed INTEGER, p_old_size_6_borrowed INTEGER,
  p_old_size_7_borrowed INTEGER, p_old_size_8_borrowed INTEGER, p_old_size_9_borrowed INTEGER,
  -- New items
  p_new_size_1_qty INTEGER, p_new_size_2_qty INTEGER, p_new_size_3_qty INTEGER,
  p_new_size_4_qty INTEGER, p_new_size_5_qty INTEGER, p_new_size_6_qty INTEGER,
  p_new_size_7_qty INTEGER, p_new_size_8_qty INTEGER, p_new_size_9_qty INTEGER,
  p_new_size_1_borrowed INTEGER, p_new_size_2_borrowed INTEGER, p_new_size_3_borrowed INTEGER,
  p_new_size_4_borrowed INTEGER, p_new_size_5_borrowed INTEGER, p_new_size_6_borrowed INTEGER,
  p_new_size_7_borrowed INTEGER, p_new_size_8_borrowed INTEGER, p_new_size_9_borrowed INTEGER,
  p_new_size_1_note TEXT, p_new_size_2_note TEXT, p_new_size_3_note TEXT,
  p_new_size_4_note TEXT, p_new_size_5_note TEXT, p_new_size_6_note TEXT,
  p_new_size_7_note TEXT, p_new_size_8_note TEXT, p_new_size_9_note TEXT,
  p_new_main_note TEXT
)
RETURNS JSON AS $$
DECLARE
  v_old_qty INTEGER;
  v_old_borrowed INTEGER;
  v_new_qty INTEGER;
  v_new_borrowed INTEGER;
  v_qty_diff INTEGER;
  v_borrowed_diff INTEGER;
BEGIN
  UPDATE jama_challans
  SET
    client_id = p_client_id,
    alternative_site = p_alternative_site,
    secondary_phone_number = p_secondary_phone_number,
    jama_date = p_jama_date,
    driver_name = p_driver_name
  WHERE jama_challan_number = p_challan_number;

  UPDATE jama_items
  SET
    size_1_qty = p_new_size_1_qty, size_2_qty = p_new_size_2_qty, size_3_qty = p_new_size_3_qty,
    size_4_qty = p_new_size_4_qty, size_5_qty = p_new_size_5_qty, size_6_qty = p_new_size_6_qty,
    size_7_qty = p_new_size_7_qty, size_8_qty = p_new_size_8_qty, size_9_qty = p_new_size_9_qty,
    size_1_borrowed = p_new_size_1_borrowed, size_2_borrowed = p_new_size_2_borrowed, size_3_borrowed = p_new_size_3_borrowed,
    size_4_borrowed = p_new_size_4_borrowed, size_5_borrowed = p_new_size_5_borrowed, size_6_borrowed = p_new_size_6_borrowed,
    size_7_borrowed = p_new_size_7_borrowed, size_8_borrowed = p_new_size_8_borrowed, size_9_borrowed = p_new_size_9_borrowed,
    size_1_note = p_new_size_1_note, size_2_note = p_new_size_2_note, size_3_note = p_new_size_3_note,
    size_4_note = p_new_size_4_note, size_5_note = p_new_size_5_note, size_6_note = p_new_size_6_note,
    size_7_note = p_new_size_7_note, size_8_note = p_new_size_8_note, size_9_note = p_new_size_9_note,
    main_note = p_new_main_note
  WHERE jama_challan_number = p_challan_number;

  FOR i IN 1..9 LOOP
    CASE i
      WHEN 1 THEN v_old_qty := p_old_size_1_qty; v_old_borrowed := p_old_size_1_borrowed; v_new_qty := p_new_size_1_qty; v_new_borrowed := p_new_size_1_borrowed;
      WHEN 2 THEN v_old_qty := p_old_size_2_qty; v_old_borrowed := p_old_size_2_borrowed; v_new_qty := p_new_size_2_qty; v_new_borrowed := p_new_size_2_borrowed;
      WHEN 3 THEN v_old_qty := p_old_size_3_qty; v_old_borrowed := p_old_size_3_borrowed; v_new_qty := p_new_size_3_qty; v_new_borrowed := p_new_size_3_borrowed;
      WHEN 4 THEN v_old_qty := p_old_size_4_qty; v_old_borrowed := p_old_size_4_borrowed; v_new_qty := p_new_size_4_qty; v_new_borrowed := p_new_size_4_borrowed;
      WHEN 5 THEN v_old_qty := p_old_size_5_qty; v_old_borrowed := p_old_size_5_borrowed; v_new_qty := p_new_size_5_qty; v_new_borrowed := p_new_size_5_borrowed;
      WHEN 6 THEN v_old_qty := p_old_size_6_qty; v_old_borrowed := p_old_size_6_borrowed; v_new_qty := p_new_size_6_qty; v_new_borrowed := p_new_size_6_borrowed;
      WHEN 7 THEN v_old_qty := p_old_size_7_qty; v_old_borrowed := p_old_size_7_borrowed; v_new_qty := p_new_size_7_qty; v_new_borrowed := p_new_size_7_borrowed;
      WHEN 8 THEN v_old_qty := p_old_size_8_qty; v_old_borrowed := p_old_size_8_borrowed; v_new_qty := p_new_size_8_qty; v_new_borrowed := p_new_size_8_borrowed;
      WHEN 9 THEN v_old_qty := p_old_size_9_qty; v_old_borrowed := p_old_size_9_borrowed; v_new_qty := p_new_size_9_qty; v_new_borrowed := p_new_size_9_borrowed;
    END CASE;

    v_qty_diff := v_new_qty - v_old_qty;
    v_borrowed_diff := v_new_borrowed - v_old_borrowed;

    IF v_qty_diff != 0 OR v_borrowed_diff != 0 THEN
      UPDATE stock
      SET
        on_rent_stock = GREATEST(0, on_rent_stock - v_qty_diff),
        borrowed_stock = GREATEST(0, borrowed_stock - v_borrowed_diff)
      WHERE size = i;
    END IF;
  END LOOP;

  RETURN json_build_object('success', true, 'message', 'Jama challan updated successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DELETE UDHAR CHALLAN WITH STOCK
-- =============================================================================
CREATE OR REPLACE FUNCTION delete_udhar_challan_with_stock(
  p_challan_number TEXT,
  p_size_1_qty INTEGER, p_size_2_qty INTEGER, p_size_3_qty INTEGER,
  p_size_4_qty INTEGER, p_size_5_qty INTEGER, p_size_6_qty INTEGER,
  p_size_7_qty INTEGER, p_size_8_qty INTEGER, p_size_9_qty INTEGER,
  p_size_1_borrowed INTEGER, p_size_2_borrowed INTEGER, p_size_3_borrowed INTEGER,
  p_size_4_borrowed INTEGER, p_size_5_borrowed INTEGER, p_size_6_borrowed INTEGER,
  p_size_7_borrowed INTEGER, p_size_8_borrowed INTEGER, p_size_9_borrowed INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_qty INTEGER;
  v_borrowed INTEGER;
BEGIN
  FOR i IN 1..9 LOOP
    CASE i
      WHEN 1 THEN v_qty := p_size_1_qty; v_borrowed := p_size_1_borrowed;
      WHEN 2 THEN v_qty := p_size_2_qty; v_borrowed := p_size_2_borrowed;
      WHEN 3 THEN v_qty := p_size_3_qty; v_borrowed := p_size_3_borrowed;
      WHEN 4 THEN v_qty := p_size_4_qty; v_borrowed := p_size_4_borrowed;
      WHEN 5 THEN v_qty := p_size_5_qty; v_borrowed := p_size_5_borrowed;
      WHEN 6 THEN v_qty := p_size_6_qty; v_borrowed := p_size_6_borrowed;
      WHEN 7 THEN v_qty := p_size_7_qty; v_borrowed := p_size_7_borrowed;
      WHEN 8 THEN v_qty := p_size_8_qty; v_borrowed := p_size_8_borrowed;
      WHEN 9 THEN v_qty := p_size_9_qty; v_borrowed := p_size_9_borrowed;
    END CASE;

    IF v_qty > 0 OR v_borrowed > 0 THEN
      UPDATE stock
      SET
        on_rent_stock = GREATEST(0, on_rent_stock - v_qty),
        borrowed_stock = GREATEST(0, borrowed_stock - v_borrowed)
      WHERE size = i;
    END IF;
  END LOOP;

  DELETE FROM udhar_challans WHERE udhar_challan_number = p_challan_number;

  RETURN json_build_object('success', true, 'message', 'Udhar challan deleted successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- DELETE JAMA CHALLAN WITH STOCK
-- =============================================================================
CREATE OR REPLACE FUNCTION delete_jama_challan_with_stock(
  p_challan_number TEXT,
  p_size_1_qty INTEGER, p_size_2_qty INTEGER, p_size_3_qty INTEGER,
  p_size_4_qty INTEGER, p_size_5_qty INTEGER, p_size_6_qty INTEGER,
  p_size_7_qty INTEGER, p_size_8_qty INTEGER, p_size_9_qty INTEGER,
  p_size_1_borrowed INTEGER, p_size_2_borrowed INTEGER, p_size_3_borrowed INTEGER,
  p_size_4_borrowed INTEGER, p_size_5_borrowed INTEGER, p_size_6_borrowed INTEGER,
  p_size_7_borrowed INTEGER, p_size_8_borrowed INTEGER, p_size_9_borrowed INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_qty INTEGER;
  v_borrowed INTEGER;
BEGIN
  FOR i IN 1..9 LOOP
    CASE i
      WHEN 1 THEN v_qty := p_size_1_qty; v_borrowed := p_size_1_borrowed;
      WHEN 2 THEN v_qty := p_size_2_qty; v_borrowed := p_size_2_borrowed;
      WHEN 3 THEN v_qty := p_size_3_qty; v_borrowed := p_size_3_borrowed;
      WHEN 4 THEN v_qty := p_size_4_qty; v_borrowed := p_size_4_borrowed;
      WHEN 5 THEN v_qty := p_size_5_qty; v_borrowed := p_size_5_borrowed;
      WHEN 6 THEN v_qty := p_size_6_qty; v_borrowed := p_size_6_borrowed;
      WHEN 7 THEN v_qty := p_size_7_qty; v_borrowed := p_size_7_borrowed;
      WHEN 8 THEN v_qty := p_size_8_qty; v_borrowed := p_size_8_borrowed;
      WHEN 9 THEN v_qty := p_size_9_qty; v_borrowed := p_size_9_borrowed;
    END CASE;

    IF v_qty > 0 OR v_borrowed > 0 THEN
      UPDATE stock
      SET
        on_rent_stock = on_rent_stock + v_qty,
        borrowed_stock = borrowed_stock + v_borrowed
      WHERE size = i;
    END IF;
  END LOOP;

  DELETE FROM jama_challans WHERE jama_challan_number = p_challan_number;

  RETURN json_build_object('success', true, 'message', 'Jama challan deleted successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;