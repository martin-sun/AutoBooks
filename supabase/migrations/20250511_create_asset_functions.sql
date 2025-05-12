-- Asset Management Functions for AutoBooks
-- Created: 2025-05-11

-- Function to update an asset's current value
CREATE OR REPLACE FUNCTION update_asset_value(p_asset_id UUID, p_value_change NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE assets
  SET current_value = current_value + p_value_change,
      updated_at = now()
  WHERE id = p_asset_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate depreciation for an asset
CREATE OR REPLACE FUNCTION calculate_asset_depreciation(p_asset_id UUID, p_date DATE)
RETURNS NUMERIC AS $$
DECLARE
  v_asset RECORD;
  v_depreciation_amount NUMERIC := 0;
  v_months_owned INTEGER;
  v_monthly_depreciation NUMERIC;
BEGIN
  -- Get the asset details
  SELECT * INTO v_asset FROM assets WHERE id = p_asset_id;
  
  -- If no depreciation method or it's set to 'none', return 0
  IF v_asset.depreciation_method IS NULL OR v_asset.depreciation_method = 'none' THEN
    RETURN 0;
  END IF;
  
  -- Calculate months owned
  v_months_owned := EXTRACT(YEAR FROM AGE(p_date, v_asset.purchase_date)) * 12 + 
                   EXTRACT(MONTH FROM AGE(p_date, v_asset.purchase_date));
  
  -- If the asset is not owned yet or fully depreciated, return 0
  IF v_months_owned <= 0 OR v_months_owned > v_asset.depreciation_period THEN
    RETURN 0;
  END IF;
  
  -- Calculate depreciation based on method
  IF v_asset.depreciation_method = 'straight_line' THEN
    -- Straight line: equal amounts each period
    v_monthly_depreciation := v_asset.purchase_value / v_asset.depreciation_period;
    v_depreciation_amount := v_monthly_depreciation;
  ELSIF v_asset.depreciation_method = 'reducing_balance' THEN
    -- Reducing balance: percentage of remaining value
    v_depreciation_amount := (v_asset.current_value * v_asset.depreciation_rate / 100) / 12;
  END IF;
  
  RETURN ROUND(v_depreciation_amount, 2);
END;
$$ LANGUAGE plpgsql;
