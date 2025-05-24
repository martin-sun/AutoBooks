# AutoBooks

AutoBooks is a modern, multi-tenant bookkeeping and accounting system inspired by Wave, designed for small business owners, freelancers, and personal finance enthusiasts. It features robust double-entry accounting, advanced tax handling for Canada, and a flexible workspace model to support both personal and business finances in a single platform.

## Design Philosophy

- **Multi-Tenancy & Workspace Isolation**: Every user can create multiple workspaces (personal or business). All data is strictly isolated at the workspace level using PostgreSQL Row Level Security (RLS), ensuring privacy and security for each tenant.
- **Double-Entry Accounting**: All financial transactions use the double-entry bookkeeping model, ensuring data integrity and compliance with accounting best practices.
- **Tax Engine for Canada**: Built-in support for GST, PST, HST, and ITC (Input Tax Credit) reporting. The system allows for user-defined tax types and stacking, with full auditability.
- **Soft Delete & Audit Log**: All major tables support soft deletion and automatic audit logging for compliance and traceability.
- **API-First**: Designed for API-first development, supporting both REST and GraphQL access patterns.
- **Extensibility**: The architecture is future-proof, supporting multi-currency, OCR for receipts, payroll, and electronic tax filing integrations.

## Key Features

- **User Management**: Single sign-on with email/password. Each user can own multiple isolated workspaces.
- **Workspace Model**: Separate accounting books for personal and business, with the ability to settle funds between workspaces (e.g., reimbursements).
- **Chart of Accounts**: Each workspace maintains its own customizable chart of accounts.
- **Accounts & Transactions**: Bank, credit card, cash, income, and expense accounts. Transactions are recorded with double-entry lines.
- **Fiscal Year Management**: Define custom fiscal years and optimize performance with year-based balance calculations.
- **Cross-Workspace Reimbursement**: Personal payments for business expenses are tracked and settled automatically between workspaces.
- **Tagging System**: Customizable tags (including tax-deductible flags) for advanced reporting (e.g., medical, donation summaries).
- **Tax Engine**: User-defined taxes, stackable, with support for recoverable taxes (ITC). Automated GST/PST/HST calculations and reporting.
- **Reporting**: Budget vs. Actual, Balance Sheet, Profit & Loss, Cash Flow, ITC summary, and deductible expense reports.
- **Security**: Row-level security (RLS) on all tables, soft delete, audit logs, and timezone handling (all timestamps in UTC).

## Advanced Design Concepts

### Double-Entry Transaction Structure

AutoBooks implements a comprehensive double-entry bookkeeping system with the following key components:

- **Chart of Accounts**: Hierarchical structure categorizing all financial accounts

  - **Asset Accounts**: Bank accounts, receivables, inventory, etc.
  - **Liability Accounts**: Payables, loans, credit cards, taxes payable
  - **Equity Accounts**: Owner investments, retained earnings
  - **Revenue Accounts**: Income from various business activities
  - **Expense Accounts**: Operational costs and overhead

- **Transaction Model**:
  - Primary transaction records contain metadata (date, reference, memo)
  - Transaction lines implement the double-entry system with debits and credits
  - Each transaction must balance (sum of all lines equals zero)
  - Tax information is linked to relevant transaction lines

### Fiscal Year-Based Balance Calculation

AutoBooks implements an optimized approach to account balance calculation based on fiscal years:

- **Fiscal Year Management**: Define and manage custom fiscal years for each workspace
- **Year-End Processing**: Automated year-end closing entries and balance carryforward
- **Performance Optimization**: Account balances are calculated efficiently by:
  - Storing opening balances for each account at the start of each fiscal year
  - Calculating current balances as: Opening Balance + Sum of Current Year Transactions
  - Eliminating the need to process historical transactions for balance inquiries
- **Historical Reporting**: Full support for point-in-time balance reporting within any fiscal year
- **Audit Trail**: Complete tracking of year-end closing processes and balance carryforwards

### Complex Business Scenarios Support

The system is designed to handle diverse and complex business scenarios across various industries:

- **Multi-component Revenue**: Support for businesses with multiple revenue streams and complex pricing structures
- **Diverse Payment Methods**: Comprehensive handling of various payment channels including digital transfers, credit cards, cash, and third-party payment platforms
- **Fee and Commission Structures**: Ability to record split transactions with service fees, commissions, and third-party charges
- **Tax Compliance**: Automatic calculation and tracking of different tax types (GST/PST/HST) with appropriate rules for each revenue category
- **Industry-specific Reporting**: Flexible reporting framework adaptable to various business models and regulatory requirements

For example, a food delivery business with multiple revenue components (food sales, delivery fees, tips), various payment methods, and complex tax considerations can be fully supported by the system architecture.

### Bank Reconciliation System

A dual-track approach for transaction recording and verification:

1. **Business Transactions (`transactions` table)**:

   - Represent the accounting view of business activities
   - Include complete details about revenue/expense categorization
   - Created when business events occur (sales, purchases, etc.)
   - Form the basis for financial reporting and tax filings

2. **Bank Transactions (`bank_transactions` table)**:

   - Represent the banking view of financial activities
   - Imported directly from bank statements or APIs
   - Contain limited information (date, amount, bank description)
   - Used for verification and cash flow tracking

3. **Reconciliation Process**:
   - Links business transactions to corresponding bank transactions
   - Identifies unmatched items (timing differences, missing entries)
   - Ensures accounting completeness and accuracy
   - Provides audit trail for financial verification

### Tax Reporting Considerations

- **Business Transaction Primacy**: Tax reports (T2, GST/HST) are generated from business transactions, not bank transactions
- **Accrual vs. Cash Basis**: System supports both accounting methods with appropriate reporting
- **Tax Categorization**: Transactions automatically categorize amounts for different tax purposes
- **Reconciliation Status**: Reports indicate reconciliation status to highlight potential issues
- **Audit Support**: Complete transaction history and reconciliation data support tax audit requirements

### Advanced Extension Points

The system architecture includes strategic extension points for future development:

- **Payment Method Tracking**: Optional `payment_method` field for enhanced sales analytics
- **Extended Transaction Details**: Support for additional business-specific transaction metadata
- **Custom Categorization**: User-defined tags and categories for specialized reporting
- **Integration APIs**: Hooks for integration with industry-specific platforms and services

## Technology Stack

- **Database**: PostgreSQL 14+ (with RLS, soft delete, audit triggers)
- **Backend Platform**: Supabase (Postgres + Auth + API)
- **API**: REST & GraphQL (auto-generated by Supabase)
- **Frontend**: (To be implemented, recommended: React, Next.js, or SvelteKit)
- **Infrastructure-as-Code**: Database schema and migrations managed via Supabase CLI

## Getting Started

1. Clone the repository
2. Install dependencies and initialize Supabase:
   ```bash
   npm install # or yarn
   supabase init
   supabase start
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
3. Configure your environment variables in `.env`
4. (Optional) Generate TypeScript types from your database:
   ```bash
   supabase gen types typescript --project-id <your-project-ref> > src/types/supabase.ts
   ```
5. Start building your API or frontend!

## Project Structure

- `.windsurf/rules.json` — Project rules and conventions
- `.gitignore` — Standard ignores for Node, Supabase, and IDEs
- `supabase/migrations/` — All database schema migrations (including initial schema)
- `supabase/config.toml` — Supabase local/remote project configuration
- `src/` — Application source code (frontend/backend)
- `tests/` — Automated tests

## Future Roadmap

- Multi-currency support and real-time FX rates
- OCR for invoice/receipt uploads
- Payroll and electronic tax filing (CRA XML-Filing)
- More advanced reporting and dashboard features

## License

[MIT](LICENSE)

---

AutoBooks is designed to be extensible, auditable, and secure, making modern accounting accessible for everyone. Contributions and feedback are welcome!
