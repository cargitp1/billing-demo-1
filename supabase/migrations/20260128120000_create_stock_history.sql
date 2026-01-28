-- Create stock_history table
CREATE TABLE IF NOT EXISTS stock_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz DEFAULT now(),
  type text CHECK (type IN ('add', 'remove')) NOT NULL,
  party_name text,
  note text,
  amount numeric DEFAULT 0,
  items jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- Create policies (modify as per your auth setup, assuming implicit public/anon access for now based on other tables)
CREATE POLICY "Allow public select on stock_history" ON stock_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert on stock_history" ON stock_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on stock_history" ON stock_history FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on stock_history" ON stock_history FOR DELETE USING (true);
