export type Locale = "en" | "fa";

/** The namespaces that render the shared group-wizard steps. */
export type GroupWizardNamespace = "groupWizard" | "categoryWizard" | "guideWizard";

export type LangContent = {
  name: string;
  description: string;
};

export type LangSeo = {
  title: string;
  description: string;
};

export type FieldErrors = {
  slug?: string;
  enName?: string;
  faName?: string;
};
