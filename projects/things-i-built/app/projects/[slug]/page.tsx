import { buildProjectMetadata, getProjectStaticParams, ProjectDetailsPage } from "@/views/project-details";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProjectStaticParams();
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return buildProjectMetadata(slug) ?? {};
}

export default ProjectDetailsPage;