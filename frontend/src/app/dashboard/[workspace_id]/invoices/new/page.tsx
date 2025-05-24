"use client";

import { useParams } from "next/navigation";
import { InvoiceForm } from "@/features/invoices/components/InvoiceForm";
import { useInvoiceForm } from "@/features/invoices/hooks/useInvoiceForm";

export default function NewInvoicePage() {
  const params = useParams();
  const workspaceId = params?.workspace_id as string;

  // Use the invoice form hook to manage form state and logic
  const {
    form,
    fields,
    loading,
    submitting,
    customers,
    products,
    templates,
    handleProductSelect,
    calculateLineAmount,
    addInvoiceLine,
    removeInvoiceLine,
    onSubmit,
    onCancel,
  } = useInvoiceForm({ workspaceId });

  return (
    <div className="space-y-6">
      <InvoiceForm
        form={form}
        fields={fields}
        workspaceId={workspaceId}
        customers={customers}
        products={products}
        templates={templates}
        loading={loading}
        submitting={submitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
        handleProductSelect={handleProductSelect}
        calculateLineAmount={calculateLineAmount}
        addInvoiceLine={addInvoiceLine}
        removeInvoiceLine={removeInvoiceLine}
      />
    </div>
  );
}
