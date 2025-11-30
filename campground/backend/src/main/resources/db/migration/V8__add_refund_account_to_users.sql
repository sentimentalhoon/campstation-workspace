-- Add refund account information to users table
ALTER TABLE users ADD COLUMN refund_bank_name VARCHAR(50);
ALTER TABLE users ADD COLUMN refund_account_number VARCHAR(50);
ALTER TABLE users ADD COLUMN refund_account_holder VARCHAR(50);

-- Create index for refund account lookup
CREATE INDEX idx_users_refund_account ON users(refund_account_number) WHERE refund_account_number IS NOT NULL;
