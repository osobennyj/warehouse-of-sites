import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectLinks, ProjectStatusBadge } from "@/entities/project";
import { ProjectLivePreview } from "@/widgets/project-live-preview";
import { getProjectCaseStudy, getProjects } from "@/entities/project/server";
import { formatMonthYear } from "@/shared/lib";
import { buildPageMetadata } from "@/shared/seo";
import { ButtonLink, Container, MarkdownContent } from "@/shared/ui";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export function buildProjectMetadata(slug: string) {
  const project = getProjects().find((item) => item.slug === slug);
  if (!project) return null;
  return buildPageMetadata({
    title: project.title,
    description: project.description,
    path: `/projects/${project.slug}/`,
    type: "article",
  });
}

export function getProjectStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function ProjectDetailsPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const study = await getProjectCaseStudy(slug);
  if (!study) notFound();

  const { project, html } = study;

  return (
    <article className="pb-20">
      <Container className="pt-12 sm:pt-16">
        <nav aria-label="Breadcrumb" className="text-muted mb-8 text-sm">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/projects/" className="hover:text-fg">
                Projects
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-fg">{project.title}</li>
          </ol>
        </nav>

        <header className="border-border max-w-3xl border-b pb-10">
          <div className="flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{project.title}</h1>
          <p className="text-muted mt-4 text-xl leading-relaxed">{project.tagline}</p>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">Key metric</dt>
              <dd className="text-accent mt-1 font-mono text-lg">{project.metric.value}</dd>
              <dd className="text-muted">{project.metric.label}</dd>
            </div>
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="mt-1">{project.role}</dd>
            </div>
            <div>
              <dt className="text-muted">Date</dt>
              <dd className="mt-1">{formatMonthYear(project.date)}</dd>
            </div>
          </dl>
          {(project.solves || project.decision) && (
            <dl className="border-accent/60 mt-6 space-y-2 border-l-2 pl-4 text-base leading-relaxed">
              {project.solves && (
                <div>
                  <dt className="inline font-medium">Problem: </dt>
                  <dd className="text-muted inline">{project.solves}</dd>
                </div>
              )}
              {project.decision && (
                <div>
                  <dt className="inline font-medium">My call: </dt>
                  <dd className="text-muted inline">{project.decision}</dd>
                </div>
              )}
            </dl>
          )}
          <ProjectLinks project={project} size="md" className="relative z-10 mt-8 flex flex-wrap gap-2" />
        </header>

        <ProjectLivePreview project={project} />

        <section aria-label="Case study" className="mt-12">
          <MarkdownContent html={html} />
        </section>

        <footer className="border-border mt-16 border-t pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <ButtonLink href="/projects/" variant="secondary">
              ← All projects
            </ButtonLink>
            <p className="text-muted text-sm">Research and journaling tool. Not investment advice.</p>
          </div>
        </footer>
      </Container>
    </article>
  );
}
