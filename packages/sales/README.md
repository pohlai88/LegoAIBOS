# @aibos/sales

Sales module for AI-BOS ERP.

## Features (v1.0.0)
- Sales Invoice posting with tax calculation
- Emits `sales.INVOICE_POSTED` event for downstream AR JE auto-draft

## Event Lane
- **Emits**: `sales.INVOICE_POSTED`
- **Consumes**: None

## Services
- `postSalesInvoice`: Posts invoice, calculates tax, emits event

## Related ADRs
- ADR-012: Sales→AR Auto-JE Draft
