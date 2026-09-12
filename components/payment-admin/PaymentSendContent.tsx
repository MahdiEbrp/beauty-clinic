"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Panel, Field, inputClass } from "@/components/create-group/ui";
import WizardHeader from "@/components/create-group/WizardHeader";
import WizardActionBar from "@/components/create-group/WizardActionBar";
import { PAYMENT_API_ROUTES } from "@/lib/payment/constants";
import { PaymentSelect } from "./PaymentSelect";
import { useRouter } from "@/src/i18n/navigation";

const SEND_STEPS = [
  { id: 1, key: "recipients" },
  { id: 2, key: "content" },
  { id: 3, key: "review" },
] as const;

export function PaymentSendContent({ providerItems }: { providerItems: { id: string; name: string }[] }) {
  const t = useTranslations("paymentSend");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [providerId, setProviderId] = useState(providerItems[0]?.id ?? "");
  const [groupRef, setGroupRef] = useState("");
  const [amount, setAmount] = useState("100000");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const canSend = providerItems.length > 0;

  const validate = () => {
    if (step === 1 && !/^NF-\d{5}$/.test(groupRef.trim())) {
      setError("Enter valid group ref e.g. NF-12345");
      return false;
    }
    if (step === 2 && (!providerId || !amount.trim() || Number(amount) < 1000)) {
      setError("Select provider and valid amount");
      return false;
    }
    setError(null);
    return true;
  };

  const goNext = () => {
    if (validate()) setStep((s) => Math.min(3, s + 1));
  };

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(PAYMENT_API_ROUTES.transactions, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingGroupRef: groupRef.trim(), amount: Number(amount), description, providerId }),
      });
      const json = (await res.json().catch(() => null)) as { error?: { message?: string }; data?: { paymentUrl?: string } } | null;
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      toast.success("Payment request created");
      const paymentUrl = json?.data?.paymentUrl ?? undefined;
      if (paymentUrl) window.location.href = paymentUrl;
      else router.push("/dashboard/payment/transactions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      toast.error("Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!canSend) {
    return (
      <div className="rounded-panel border border-dashed border-surface-variant/50 bg-surface-secondary p-8 text-center">
        <p className="text-dash-body text-content-secondary">No active payment providers. Add a provider first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <WizardHeader step={step} currentStepKey={SEND_STEPS[step - 1].key} total={SEND_STEPS.length} lang="en" langAware={false} heading={t("heading")} subtitle={t("description")} onLangChange={() => undefined} onGoTo={(n) => { if (n <= step || validate()) setStep(n); }} ns="paymentSend" steps={SEND_STEPS} backHref="/dashboard/payment" />

      <form ref={formRef} onSubmit={(e) => void onSubmit(e)} className="space-y-6">
        {step === 1 && (
          <Panel>
            <Field id="payment-group-ref" label="Booking Group Ref" hint="NF-XXXXX" required>
              <input id="payment-group-ref" value={groupRef} onChange={(e) => setGroupRef(e.target.value)} placeholder="NF-12345" dir="ltr" className={inputClass(Boolean(error))} />
            </Field>
          </Panel>
        )}
        {step === 2 && (
          <Panel>
            <div className="grid gap-5 md:grid-cols-2">
              <Field id="payment-provider" label="Gateway" required>
                <PaymentSelect value={providerId} onValueChange={setProviderId} options={providerItems.map((p) => ({ value: p.id, label: p.name }))} placeholder="Select gateway" ariaLabel="Gateway" />
              </Field>
              <Field id="payment-amount" label="Amount (Toman)" hint="Will be converted to Rial ×10 for ZarinPal" required>
                <input id="payment-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass(false)} />
              </Field>
              <div className="md:col-span-2">
                <Field id="payment-description" label="Description" hint="Max 500 chars">
                  <textarea id="payment-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} className={inputClass(false)} placeholder="Payment for booking NF-12345" />
                </Field>
              </div>
            </div>
          </Panel>
        )}
        {step === 3 && (
          <Panel>
            <div className="space-y-3 p-5">
              <p className="text-dash-body font-semibold text-content-primary">Review</p>
              <p className="text-dash-body-sm text-content-secondary">Group: {groupRef} — Amount: {amount} Toman</p>
              <p className="text-dash-body-sm text-content-secondary">Gateway: {providerItems.find((p) => p.id === providerId)?.name}</p>
              <p className="text-dash-body-sm text-content-secondary">Description: {description || "-"}</p>
              {error && <p className="text-dash-body-sm text-error">{error}</p>}
            </div>
          </Panel>
        )}
        {error && step !== 3 && <p className="text-dash-body-sm text-error" role="alert">{error}</p>}
      </form>

      <WizardActionBar step={step} total={SEND_STEPS.length} submitting={submitting} onBack={() => setStep((s) => Math.max(1, s - 1))} onPrimary={() => { if (step === SEND_STEPS.length) formRef.current?.requestSubmit(); else goNext(); }} ns="paymentSend" />
    </div>
  );
}
