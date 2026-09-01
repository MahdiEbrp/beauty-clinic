import type { AdminEmailTemplate } from "@/lib/email/template-service";

export type EmailTemplateFormState = {
  key: string;
  messageType: AdminEmailTemplate["messageType"];
  contentFormat: AdminEmailTemplate["contentFormat"];
  faName: string;
  faSubject: string;
  faContent: string;
  enName: string;
  enSubject: string;
  enContent: string;
  variables: string;
  displayOrder: string;
  isActive: boolean;
};

export type EmailTemplateFormSetter = <K extends keyof EmailTemplateFormState>(
  key: K,
  value: EmailTemplateFormState[K],
) => void;