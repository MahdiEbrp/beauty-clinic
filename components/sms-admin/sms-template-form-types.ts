import type { AdminSmsTemplate } from "@/lib/sms/template-service";

export type SmsTemplateFormState = {
  key: string;
  externalTemplateId: string;
  messageType: AdminSmsTemplate["messageType"];
  faName: string;
  faContent: string;
  enName: string;
  enContent: string;
  variables: string;
  displayOrder: string;
  isActive: boolean;
};

export type SmsTemplateFormSetter = <K extends keyof SmsTemplateFormState>(
  key: K,
  value: SmsTemplateFormState[K],
) => void;
