# Bank Reconciliation Matching Algorithm

## Overview

This document outlines the intelligent matching algorithm used for bank reconciliation in AutoBooks. The system is designed to handle multiple currencies (with CAD as primary) and supports both manual file uploads (CSV/OFX) and future API integrations (e.g., Plaid/TrueLayer).

## Design Goals

- **Matching Accuracy**: Achieve ≥90% match rate for common income/expense patterns
- **Performance**: Render 500 transactions with <100ms latency
- **Auditability**: Maintain complete audit trail of all matching decisions
- **Extensibility**: Support future AI/ML enhancements

## Architecture Layers

| Layer | Tables | Purpose |
|-------|--------|---------|
| **Bank Statement Layer** | `bank_statements`, `bank_statement_lines` | Immutable raw transaction data |
| **Accounting Layer** | `transactions`, `transaction_lines` | Source of truth for all accounting entries |
| **Matching Bridge** | `statement_line_matches` | N:M relationships between bank and accounting entries |
| **Reconciliation Session** | `reconciliations` | Tracks reconciliation process (e.g., "Feb 2025 Chequing Account") |

> **Core Principle**: The bridge table only stores relationships, not amounts.

## Matching Fields

| Category | Fields | Notes |
|----------|--------|-------|
| **Amount** | `bank_statement_lines.amount` vs `transaction_lines.amount` | Convert to common currency before comparison |
| **Date** | `txn_date` comparison | Configurable tolerance (±3 business days) |
| **Description** | `bank_statement_lines.description`, `transactions.memo` | Case-insensitive, stop words removed, standardized encoding |
| **Account Hint** | `transaction_lines.account_id` | Higher weight for `is_bank_primary` accounts |
| **Periodic Pattern** | `hash(description, amount, weekday)` | Improves matching for recurring transactions |

## Scoring Model (v1)

```
score = 0.5 * amount_score
      + 0.3 * date_score
      + 0.15 * desc_score
      + 0.05 * bonus_score
```

### Score Components

1. **Amount Score**: 1.0 if within tolerance, else 0
2. **Date Score**: 1.0 (same day), 0.85 (±3 days), 0 (beyond)
3. **Description Score**: Jaccard similarity ≥0.7 (linearly mapped)
4. **Bonus**: +0.05 for matching templates/rules

### Matching Thresholds

- `score ≥ 0.95`: Auto-match
- `0.80 ≤ score < 0.95`: Suggested match (requires confirmation)
- `score < 0.80`: Ignore

## Matching Process

1. **Candidate Selection** for each `bank_statement_line`:
   - Same `workspace_id`
   - Amount within 2%
   - Date within ±7 days

2. **Scoring**
   - Calculate score for each candidate
   - Sort by score (descending)

3. **Matching**
   - 1:1 exact matches first
   - Then attempt split matches (multiple transactions sum to statement amount)

4. **Persistence**
   - Write to `statement_line_matches`
   - Update `match_status`
   - Check reconciliation session completion

## Performance Optimization

### Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `bank_statement_lines` | `(workspace_id, amount, txn_date)` | Candidate lookup |
| `transaction_lines` | `(workspace_id, amount, txn_date)` | Candidate lookup |
| `statement_line_matches` | `(statement_line_id)` | Fast joins |
| `statement_line_matches` | `(transaction_line_id)` | Fast joins |

### Batch Processing
- Process transactions in batches (10k rows/s)
- Limit date ranges to recent 60 days by default
- Use `COPY` for bulk inserts

## AI/ML Roadmap

| Version | Technology | Training Data | Goal |
|---------|------------|---------------|------|
| v1.1 | GBDT Ranking | User match/reject history | 95% auto-match rate |
| v2 | Mini-LM Embeddings | 20k rows/tenant | Better description matching |
| v3 | Sequence Models | Stripe/POS data | Improved split detection |
| v4 | LLM + RAG | User prompts | Rule generation |

## Security & Compliance

- **Feature Flags**: Toggle ML features independently
- **Audit Logs**: All match actions in `journal_events`
- **Rollback**: Cascading deletes with idempotent recomputation
- **RBAC**: `bookkeeper` vs `viewer` roles

## Implementation Notes

1. All database operations are workspace-scoped
2. Currency conversion uses daily rates from `exchange_rates`
3. Matching rules are configurable per workspace
4. All automated matches are reviewable
5. Full history of changes is maintained for audit

## Related Documents

- [Database Schema](../database/schemas/README.md)
- [Transaction Processing](./transactions.md)
- [API Documentation](../../api/reconciliation.md)

## Changelog

- **2025-05-16**: Initial version

## Future Enhancements

1. Real-time matching as transactions are created
2. Machine learning model training pipeline
3. Support for additional file formats
4. Integration with more banking APIs
5. Advanced reporting on matching performance
