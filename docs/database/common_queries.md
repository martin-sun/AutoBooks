# AutoBooks 常见查询示例

本文档提供了AutoBooks系统中常见的SQL查询示例，帮助开发者理解如何正确查询和操作数据库。这些查询示例涵盖了系统中的主要功能和业务场景。

## 工作空间相关查询

### 获取用户的所有工作空间
```sql
SELECT * FROM workspaces 
WHERE user_id = auth.uid() AND is_deleted = FALSE
ORDER BY created_at;
```

### 获取用户的默认个人工作空间
```sql
SELECT * FROM workspaces 
WHERE user_id = auth.uid() AND type = 'personal' AND is_deleted = FALSE
LIMIT 1;
```

### 获取用户的所有商业工作空间
```sql
SELECT * FROM workspaces 
WHERE user_id = auth.uid() AND type = 'business' AND is_deleted = FALSE
ORDER BY name;
```

## 会计科目和账户查询

### 获取工作空间的会计科目表
```sql
SELECT * FROM chart_of_accounts 
WHERE workspace_id = :workspace_id AND is_deleted = FALSE
ORDER BY type, name;
```

### 按类型获取会计科目
```sql
SELECT * FROM chart_of_accounts 
WHERE workspace_id = :workspace_id AND type = :type AND is_deleted = FALSE
ORDER BY name;
```

### 获取适合作为银行账户的科目
```sql
SELECT * FROM chart_of_accounts 
WHERE workspace_id = :workspace_id AND is_payment = TRUE AND is_deleted = FALSE
ORDER BY type, name;
```

### 获取工作空间的所有账户
```sql
SELECT a.*, c.type AS account_type
FROM accounts a
JOIN chart_of_accounts c ON a.chart_id = c.id
WHERE a.workspace_id = :workspace_id AND a.is_deleted = FALSE
ORDER BY c.type, a.name;
```

### 获取银行账户及余额
```sql
SELECT 
  a.id,
  a.name,
  a.description,
  coa.type AS account_type,
  a.opening_balance,
  (a.opening_balance + COALESCE(SUM(tl.amount), 0)) AS current_balance,
  a.currency
FROM 
  accounts a
JOIN 
  chart_of_accounts coa ON a.chart_id = coa.id
LEFT JOIN 
  transaction_lines tl ON a.id = tl.account_id
LEFT JOIN
  transactions t ON tl.transaction_id = t.id AND t.is_deleted = FALSE
WHERE 
  a.workspace_id = :workspace_id
  AND a.is_deleted = FALSE
  AND coa.is_payment = TRUE
GROUP BY 
  a.id, a.name, a.description, coa.type, a.opening_balance, a.currency
ORDER BY 
  a.name;
```

## 会计年度和余额查询

### 获取工作空间的会计年度
```sql
SELECT * FROM fiscal_years
WHERE workspace_id = :workspace_id AND is_deleted = FALSE
ORDER BY start_date;
```

### 获取当前会计年度
```sql
SELECT * FROM fiscal_years
WHERE workspace_id = :workspace_id AND is_current = TRUE AND is_deleted = FALSE
LIMIT 1;
```

### 获取账户在特定会计年度的余额
```sql
SELECT 
  a.id AS account_id,
  a.name AS account_name,
  coa.type AS account_type,
  fy.name AS fiscal_year_name,
  ayb.opening_balance,
  ayb.closing_balance,
  COALESCE(SUM(tl.amount), 0) AS transaction_total,
  (ayb.opening_balance + COALESCE(SUM(tl.amount), 0)) AS current_balance
FROM 
  accounts a
JOIN 
  chart_of_accounts coa ON a.chart_id = coa.id
JOIN 
  fiscal_years fy ON fy.id = :fiscal_year_id
LEFT JOIN 
  account_year_balances ayb ON a.id = ayb.account_id AND fy.id = ayb.fiscal_year_id
LEFT JOIN 
  transaction_lines tl ON a.id = tl.account_id
LEFT JOIN
  transactions t ON tl.transaction_id = t.id AND t.fiscal_year_id = fy.id AND t.is_deleted = FALSE
WHERE 
  a.workspace_id = :workspace_id
  AND a.id = :account_id
  AND a.is_deleted = FALSE
GROUP BY 
  a.id, a.name, coa.type, fy.name, ayb.opening_balance, ayb.closing_balance;
```

## 交易相关查询

### 获取工作空间的所有交易
```sql
SELECT t.*, fy.name AS fiscal_year_name
FROM transactions t
LEFT JOIN fiscal_years fy ON t.fiscal_year_id = fy.id
WHERE t.workspace_id = :workspace_id AND t.is_deleted = FALSE
ORDER BY t.txn_date DESC;
```

### 获取特定会计年度的交易
```sql
SELECT t.*
FROM transactions t
WHERE t.workspace_id = :workspace_id 
  AND t.fiscal_year_id = :fiscal_year_id 
  AND t.is_deleted = FALSE
ORDER BY t.txn_date DESC;
```

### 获取特定日期范围的交易
```sql
SELECT t.*
FROM transactions t
WHERE t.workspace_id = :workspace_id 
  AND t.txn_date BETWEEN :start_date AND :end_date
  AND t.is_deleted = FALSE
ORDER BY t.txn_date DESC;
```

### 获取交易详情（包括交易行）
```sql
SELECT 
  t.*,
  json_agg(
    json_build_object(
      'id', tl.id,
      'account_id', tl.account_id,
      'account_name', a.name,
      'amount', tl.amount,
      'description', tl.description
    )
  ) AS transaction_lines
FROM 
  transactions t
JOIN 
  transaction_lines tl ON t.id = tl.transaction_id
JOIN 
  accounts a ON tl.account_id = a.id
WHERE 
  t.id = :transaction_id
  AND t.is_deleted = FALSE
GROUP BY 
  t.id;
```

### 获取账户的交易历史
```sql
SELECT 
  t.id,
  t.txn_date,
  t.reference,
  t.memo,
  tl.amount,
  tl.description,
  (
    SELECT json_agg(
      json_build_object(
        'id', tl2.id,
        'account_id', tl2.account_id,
        'account_name', a2.name,
        'amount', tl2.amount,
        'description', tl2.description
      )
    )
    FROM transaction_lines tl2
    JOIN accounts a2 ON tl2.account_id = a2.id
    WHERE tl2.transaction_id = t.id AND tl2.id != tl.id
  ) AS other_lines
FROM 
  transactions t
JOIN 
  transaction_lines tl ON t.id = tl.transaction_id
WHERE 
  tl.account_id = :account_id
  AND t.is_deleted = FALSE
ORDER BY 
  t.txn_date DESC;
```

## 资产管理查询

### 获取工作空间的所有资产
```sql
SELECT 
  a.*,
  ac.name AS category_name,
  acc.name AS account_name
FROM 
  assets a
JOIN 
  asset_categories ac ON a.category_id = ac.id
JOIN 
  accounts acc ON a.account_id = acc.id
WHERE 
  a.workspace_id = :workspace_id
  AND a.is_deleted = FALSE
ORDER BY 
  ac.name, a.name;
```

### 获取资产详情（包括相关交易）
```sql
SELECT 
  a.*,
  ac.name AS category_name,
  acc.name AS account_name,
  json_agg(
    json_build_object(
      'transaction_id', at.transaction_id,
      'txn_date', t.txn_date,
      'reference', t.reference,
      'memo', t.memo,
      'amount', at.amount,
      'type', at.type
    )
  ) AS transactions
FROM 
  assets a
JOIN 
  asset_categories ac ON a.category_id = ac.id
JOIN 
  accounts acc ON a.account_id = acc.id
LEFT JOIN 
  asset_transactions at ON a.id = at.asset_id
LEFT JOIN 
  transactions t ON at.transaction_id = t.id
WHERE 
  a.id = :asset_id
  AND a.is_deleted = FALSE
GROUP BY 
  a.id, ac.name, acc.name;
```

## 报表和分析查询

### 收入支出汇总（按月）
```sql
SELECT 
  date_trunc('month', t.txn_date) AS month,
  coa.type,
  SUM(CASE WHEN coa.type = 'income' THEN tl.amount ELSE 0 END) AS income,
  SUM(CASE WHEN coa.type = 'expense' THEN ABS(tl.amount) ELSE 0 END) AS expense
FROM 
  transactions t
JOIN 
  transaction_lines tl ON t.id = tl.transaction_id
JOIN 
  accounts a ON tl.account_id = a.id
JOIN 
  chart_of_accounts coa ON a.chart_id = coa.id
WHERE 
  t.workspace_id = :workspace_id
  AND t.is_deleted = FALSE
  AND coa.type IN ('income', 'expense')
  AND t.txn_date BETWEEN :start_date AND :end_date
GROUP BY 
  month, coa.type
ORDER BY 
  month;
```

### 资产负债表
```sql
WITH asset_accounts AS (
  SELECT 
    a.id,
    a.name,
    a.opening_balance,
    COALESCE(SUM(tl.amount), 0) AS transaction_total,
    (a.opening_balance + COALESCE(SUM(tl.amount), 0)) AS current_balance
  FROM 
    accounts a
  JOIN 
    chart_of_accounts coa ON a.chart_id = coa.id
  LEFT JOIN 
    transaction_lines tl ON a.id = tl.account_id
  LEFT JOIN
    transactions t ON tl.transaction_id = t.id AND t.is_deleted = FALSE
  WHERE 
    a.workspace_id = :workspace_id
    AND a.is_deleted = FALSE
    AND coa.type = 'asset'
  GROUP BY 
    a.id, a.name, a.opening_balance
),
liability_accounts AS (
  SELECT 
    a.id,
    a.name,
    a.opening_balance,
    COALESCE(SUM(tl.amount), 0) AS transaction_total,
    (a.opening_balance + COALESCE(SUM(tl.amount), 0)) AS current_balance
  FROM 
    accounts a
  JOIN 
    chart_of_accounts coa ON a.chart_id = coa.id
  LEFT JOIN 
    transaction_lines tl ON a.id = tl.account_id
  LEFT JOIN
    transactions t ON tl.transaction_id = t.id AND t.is_deleted = FALSE
  WHERE 
    a.workspace_id = :workspace_id
    AND a.is_deleted = FALSE
    AND coa.type = 'liability'
  GROUP BY 
    a.id, a.name, a.opening_balance
),
equity_accounts AS (
  SELECT 
    a.id,
    a.name,
    a.opening_balance,
    COALESCE(SUM(tl.amount), 0) AS transaction_total,
    (a.opening_balance + COALESCE(SUM(tl.amount), 0)) AS current_balance
  FROM 
    accounts a
  JOIN 
    chart_of_accounts coa ON a.chart_id = coa.id
  LEFT JOIN 
    transaction_lines tl ON a.id = tl.account_id
  LEFT JOIN
    transactions t ON tl.transaction_id = t.id AND t.is_deleted = FALSE
  WHERE 
    a.workspace_id = :workspace_id
    AND a.is_deleted = FALSE
    AND coa.type = 'equity'
  GROUP BY 
    a.id, a.name, a.opening_balance
)
SELECT 
  'Assets' AS section,
  aa.name,
  aa.current_balance
FROM 
  asset_accounts aa
UNION ALL
SELECT 
  'Liabilities' AS section,
  la.name,
  la.current_balance
FROM 
  liability_accounts la
UNION ALL
SELECT 
  'Equity' AS section,
  ea.name,
  ea.current_balance
FROM 
  equity_accounts ea
ORDER BY 
  section, name;
```

### 税务汇总报表
```sql
SELECT 
  tx.name AS tax_name,
  tx.rate AS tax_rate,
  EXTRACT(YEAR FROM t.txn_date) AS tax_year,
  EXTRACT(QUARTER FROM t.txn_date) AS tax_quarter,
  SUM(tt.tax_amount) AS tax_amount
FROM 
  transactions t
JOIN 
  transaction_taxes tt ON t.id = tt.transaction_id
JOIN 
  taxes tx ON tt.tax_id = tx.id
WHERE 
  t.workspace_id = :workspace_id
  AND t.is_deleted = FALSE
  AND t.txn_date BETWEEN :start_date AND :end_date
GROUP BY 
  tx.name, tx.rate, tax_year, tax_quarter
ORDER BY 
  tax_year, tax_quarter, tx.name;
```

## 侧边栏菜单查询

### 获取工作空间的菜单配置
```sql
WITH RECURSIVE menu_tree AS (
  -- 获取顶级菜单项
  SELECT 
    smi.id,
    smi.name,
    smi.icon,
    smi.route,
    smi.parent_id,
    smi.order_index,
    smi.is_active,
    1 AS level,
    ARRAY[smi.order_index] AS path
  FROM 
    sidebar_menu_items smi
  JOIN 
    workspace_menu_configs wmc ON smi.template_id = wmc.template_id
  WHERE 
    wmc.workspace_id = :workspace_id
    AND smi.parent_id IS NULL
    AND smi.is_active = TRUE
    
  UNION ALL
  
  -- 递归获取子菜单项
  SELECT 
    smi.id,
    smi.name,
    smi.icon,
    smi.route,
    smi.parent_id,
    smi.order_index,
    smi.is_active,
    mt.level + 1,
    mt.path || smi.order_index
  FROM 
    sidebar_menu_items smi
  JOIN 
    menu_tree mt ON smi.parent_id = mt.id
  WHERE 
    smi.is_active = TRUE
)
SELECT 
  id,
  name,
  icon,
  route,
  parent_id,
  order_index,
  level
FROM 
  menu_tree
ORDER BY 
  path;
```

## 注意事项

1. 所有查询都应考虑RLS策略，确保只访问用户有权限的数据
2. 使用参数化查询避免SQL注入风险
3. 对于复杂查询，考虑使用SECURITY DEFINER函数以提高性能
4. 查询中的`:param`表示参数，实际使用时应替换为参数化查询语法
5. 按会计年度优化的余额计算方案要求使用account_year_balances表，而不是直接计算所有交易

## 性能优化建议

1. 对于频繁使用的查询，创建适当的索引
2. 使用EXPLAIN ANALYZE分析查询性能
3. 对于大型工作空间，考虑使用分页查询
4. 避免在应用层进行可以在数据库中完成的计算
5. 对于复杂报表，考虑使用物化视图或预计算
