"use client";

import { useTranslations } from "next-intl";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { Mail, MessageSquareText } from "lucide-react";

const itemClass =
  "inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-control border text-body font-medium transition-colors cursor-pointer select-none " +
  "border-form-input-border bg-form-input-bg text-content-secondary hover:border-border-interactive hover:text-accent " +
  "data-[state=checked]:border-accent data-[state=checked]:bg-surface-tertiary data-[state=checked]:text-accent " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:opacity-60 disabled:pointer-events-none";

export function ChannelPicker({
  value,
  onChange,
  disabled,
}: {
  value: "sms" | "email";
  onChange: (channel: "sms" | "email") => void;
  disabled?: boolean;
}) {
  const t = useTranslations();

  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onChange(next as "sms" | "email")}
      disabled={disabled}
      aria-label={t("login.otp.channelLabel")}
      className="grid grid-cols-2 gap-3"
    >
      <RadioGroupPrimitive.Item value="sms" className={itemClass}>
        <MessageSquareText
          className="w-5 h-5"
          strokeWidth={2}
          aria-hidden="true"
        />
        {t("login.otp.channelSms")}
      </RadioGroupPrimitive.Item>
      <RadioGroupPrimitive.Item value="email" className={itemClass}>
        <Mail className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
        {t("login.otp.channelEmail")}
      </RadioGroupPrimitive.Item>
    </RadioGroupPrimitive.Root>
  );
}
