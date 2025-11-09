-- Step 1: Add a comment to refresh schema cache
COMMENT ON COLUMN bills.bill_date IS 'Date when the bill was generated';

-- Step 2: Create an index on bill_date to improve query performance
CREATE INDEX IF NOT EXISTS bills_bill_date_idx ON bills(bill_date);