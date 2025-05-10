-- Add is_payment column to accounts table for payment account distinction
ALTER TABLE accounts
ADD COLUMN is_payment BOOLEAN DEFAULT FALSE;

-- Optional: Update existing records for common payment accounts
-- UPDATE accounts SET is_payment = TRUE WHERE name IN ('Bank', 'Cash on Hand', 'Credit Card');

-- This column allows the UI to distinguish between payment accounts (for Account dropdown)
-- and all other accounts (for Category dropdown).
