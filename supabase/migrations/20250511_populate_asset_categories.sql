-- Populate Asset Categories for AutoBooks
-- Created: 2025-05-11

-- Personal Asset Categories
INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
-- Top level categories
('Cash and Bank Accounts', 'personal', NULL, TRUE),
('Investments', 'personal', NULL, TRUE),
('Real Estate', 'personal', NULL, TRUE),
('Vehicles', 'personal', NULL, TRUE),
('Personal Items', 'personal', NULL, TRUE);

-- Get the IDs of the top-level categories
DO $$
DECLARE
    cash_bank_id UUID;
    investments_id UUID;
    real_estate_id UUID;
    vehicles_id UUID;
    personal_items_id UUID;
BEGIN
    SELECT id INTO cash_bank_id FROM asset_categories WHERE name = 'Cash and Bank Accounts' AND type = 'personal';
    SELECT id INTO investments_id FROM asset_categories WHERE name = 'Investments' AND type = 'personal';
    SELECT id INTO real_estate_id FROM asset_categories WHERE name = 'Real Estate' AND type = 'personal';
    SELECT id INTO vehicles_id FROM asset_categories WHERE name = 'Vehicles' AND type = 'personal';
    SELECT id INTO personal_items_id FROM asset_categories WHERE name = 'Personal Items' AND type = 'personal';

    -- Cash and Bank subcategories
    INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
    ('Cash on Hand', 'personal', cash_bank_id, TRUE),
    ('Checking Accounts', 'personal', cash_bank_id, TRUE),
    ('Savings Accounts', 'personal', cash_bank_id, TRUE),
    ('Credit Cards', 'personal', cash_bank_id, TRUE);

    -- Investments subcategories
    INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
    ('Stocks', 'personal', investments_id, TRUE),
    ('Bonds', 'personal', investments_id, TRUE),
    ('Retirement Accounts', 'personal', investments_id, TRUE),
    ('Mutual Funds', 'personal', investments_id, TRUE);

    -- Real Estate subcategories
    INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
    ('Primary Residence', 'personal', real_estate_id, TRUE),
    ('Vacation Properties', 'personal', real_estate_id, TRUE),
    ('Rental Properties', 'personal', real_estate_id, TRUE);

    -- Vehicles subcategories
    INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
    ('Cars', 'personal', vehicles_id, TRUE),
    ('Motorcycles', 'personal', vehicles_id, TRUE),
    ('Boats', 'personal', vehicles_id, TRUE);

    -- Personal Items subcategories
    INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
    ('Electronics', 'personal', personal_items_id, TRUE),
    ('Jewelry', 'personal', personal_items_id, TRUE),
    ('Collectibles', 'personal', personal_items_id, TRUE),
    ('Furniture', 'personal', personal_items_id, TRUE);
END $$;

-- Business Asset Categories
INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
-- Top level categories
('Cash and Bank Accounts', 'business', NULL, TRUE),
('Accounts Receivable', 'business', NULL, TRUE),
('Inventory', 'business', NULL, TRUE),
('Fixed Assets', 'business', NULL, TRUE),
('Intangible Assets', 'business', NULL, TRUE);

-- Get the IDs of the top-level business categories
DO $$
DECLARE
    cash_bank_id UUID;
    fixed_assets_id UUID;
    intangible_assets_id UUID;
BEGIN
    SELECT id INTO cash_bank_id FROM asset_categories WHERE name = 'Cash and Bank Accounts' AND type = 'business';
    SELECT id INTO fixed_assets_id FROM asset_categories WHERE name = 'Fixed Assets' AND type = 'business';
    SELECT id INTO intangible_assets_id FROM asset_categories WHERE name = 'Intangible Assets' AND type = 'business';

    -- Cash and Bank subcategories (Business)
    INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
    ('Cash on Hand', 'business', cash_bank_id, TRUE),
    ('Operating Accounts', 'business', cash_bank_id, TRUE),
    ('Reserve Accounts', 'business', cash_bank_id, TRUE),
    ('Business Credit Cards', 'business', cash_bank_id, TRUE);

    -- Fixed Assets subcategories
    INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
    ('Office Equipment', 'business', fixed_assets_id, TRUE),
    ('Machinery', 'business', fixed_assets_id, TRUE),
    ('Vehicles', 'business', fixed_assets_id, TRUE),
    ('Buildings', 'business', fixed_assets_id, TRUE),
    ('Leasehold Improvements', 'business', fixed_assets_id, TRUE);

    -- Intangible Assets subcategories
    INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
    ('Software', 'business', intangible_assets_id, TRUE),
    ('Patents', 'business', intangible_assets_id, TRUE),
    ('Trademarks', 'business', intangible_assets_id, TRUE),
    ('Goodwill', 'business', intangible_assets_id, TRUE);
END $$;

-- Shared Asset Categories (applicable to both personal and business)
INSERT INTO asset_categories (name, type, parent_id, system_defined) VALUES
('Other Assets', 'both', NULL, TRUE);
