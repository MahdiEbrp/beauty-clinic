import RulesContent, { generateMetadata } from "@/components/RulesContent";

export { generateMetadata };

interface RulesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RulesPage({ params }: RulesPageProps) {
  const { locale } = await params;
  return <RulesContent locale={locale} />;
}
