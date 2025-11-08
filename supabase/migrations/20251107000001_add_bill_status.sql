-- Add status column to bills table
ALTER TABLE bills
ADD COLUMN status VARCHAR(20) DEFAULT 'draft'
CHECK (status IN ('draft', 'generated', 'cancelled'));

-- Add comment for the status column
COMMENT ON COLUMN bills.status IS 'Status of the bill: draft, generated, or cancelled';

-- Update existing bills to have a default status if any exist
UPDATE bills SET status = 'generated' WHERE status IS NULL;