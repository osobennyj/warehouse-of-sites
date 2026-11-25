import { buildResearchMetadata, getResearchStaticParams, ResearchDetailsPage } from "@/views/research-details";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getResearchStaticParams();
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return (await buildResearchMetadata(slug)) ?? {};
}

export default ResearchDetailsPage;