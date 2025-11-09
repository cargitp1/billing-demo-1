-- First, check if the table exists and drop it if it does
DROP TABLE IF EXISTS bills CASCADE;

-- Create the bills table with all required columns
CREATE TABLE bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    billdate DATE NOT NULL,  -- Note: changed from bill_date to billdate
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    daily_rent DECIMAL(10,2) NOT NULL,
    total_rent DECIMAL(10,2) NOT NULL,
    extra_costs_total DECIMAL(10,2) DEFAULT 0,
    discounts_total DECIMAL(10,2) DEFAULT 0,
    grand_total DECIMAL(10,2) NOT NULL,
    total_paid DECIMAL(10,2) DEFAULT 0,
    due_payment DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add helpful comments
COMMENT ON TABLE bills IS 'Stores all billing information for clients';
COMMENT ON COLUMN bills.status IS 'Current status of the bill: draft, generated, or cancelled';
COMMENT ON COLUMN bills.billdate IS 'Date when the bill was generated';
COMMENT ON COLUMN bills.total_rent IS 'Total rental charges for the billing period';
COMMENT ON COLUMN bills.extra_costs_total IS 'Sum of all additional charges';
COMMENT ON COLUMN bills.discounts_total IS 'Sum of all discounts applied';
COMMENT ON COLUMN bills.grand_total IS 'Final amount after adding extra costs and subtracting discounts';
COMMENT ON COLUMN bills.total_paid IS 'Total amount paid so far';
COMMENT ON COLUMN bills.due_payment IS 'Remaining amount to be paid';

-- Enable Row Level Security
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Create policies for bills table
-- Allow authenticated users to view bills
CREATE POLICY "View bills" ON bills
    FOR SELECT
    TO authenticated
    USING (true);  -- All authenticated users can view bills

-- Allow authenticated users to insert bills
CREATE POLICY "Insert bills" ON bills
    FOR INSERT
    TO authenticated
    WITH CHECK (true);  -- All authenticated users can create bills

-- Allow authenticated users to update bills
CREATE POLICY "Update bills" ON bills
    FOR UPDATE
    TO authenticated
    USING (true)  -- Can see the row
    WITH CHECK (true);  -- Can update the row

-- Allow authenticated users to delete bills
CREATE POLICY "Delete bills" ON bills
    FOR DELETE
    TO authenticated
    USING (true);  -- All authenticated users can delete bills

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_bills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION update_bills_updated_at();