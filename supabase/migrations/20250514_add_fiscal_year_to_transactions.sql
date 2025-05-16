-- 向transactions表添加fiscal_year_id字段
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS fiscal_year_id UUID REFERENCES fiscal_years(id),
ADD COLUMN IF NOT EXISTS is_closing_entry BOOLEAN DEFAULT FALSE;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_transactions_fiscal_year ON transactions(fiscal_year_id);

-- 创建一个函数，根据交易日期自动确定会计年度
CREATE OR REPLACE FUNCTION determine_fiscal_year(
  workspace_id_param UUID,
  txn_date_param DATE
)
RETURNS UUID AS $$
DECLARE
  fiscal_year_id UUID;
BEGIN
  -- 查找包含交易日期的会计年度
  SELECT id INTO fiscal_year_id
  FROM fiscal_years
  WHERE workspace_id = workspace_id_param
    AND txn_date_param BETWEEN start_date AND end_date
    AND is_deleted IS NOT TRUE;
  
  -- 如果找不到合适的会计年度，使用当前会计年度
  IF fiscal_year_id IS NULL THEN
    SELECT id INTO fiscal_year_id
    FROM fiscal_years
    WHERE workspace_id = workspace_id_param
      AND is_current = TRUE
      AND is_deleted IS NOT TRUE;
  END IF;
  
  -- 如果仍然找不到，使用最近的会计年度
  IF fiscal_year_id IS NULL THEN
    SELECT id INTO fiscal_year_id
    FROM fiscal_years
    WHERE workspace_id = workspace_id_param
      AND is_deleted IS NOT TRUE
    ORDER BY end_date DESC
    LIMIT 1;
  END IF;
  
  RETURN fiscal_year_id;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器，在插入或更新交易时自动设置fiscal_year_id
CREATE OR REPLACE FUNCTION set_transaction_fiscal_year()
RETURNS TRIGGER AS $$
BEGIN
  -- 只有在未指定fiscal_year_id时才自动设置
  IF NEW.fiscal_year_id IS NULL THEN
    NEW.fiscal_year_id := determine_fiscal_year(NEW.workspace_id, NEW.txn_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transaction_fiscal_year
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_transaction_fiscal_year();

-- 更新现有交易的fiscal_year_id
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN SELECT id, workspace_id, txn_date FROM transactions WHERE fiscal_year_id IS NULL AND is_deleted IS NOT TRUE LOOP
    UPDATE transactions
    SET fiscal_year_id = determine_fiscal_year(t.workspace_id, t.txn_date)
    WHERE id = t.id;
  END LOOP;
END;
$$;
