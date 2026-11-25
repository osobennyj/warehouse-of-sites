import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectLinks, ProjectStatusBadge } from "@/entities/project";
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
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
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

        <header className="max-w-3xl border-b border-border pb-10">
          <div className="flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            {project.tags.map((tag) => (
              <span key={tag} className="font-mono text-xs tracking-wide text-muted uppercase">
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{project.title}</h1>
          <p className="mt-4 text-xl leading-relaxed text-muted">{project.tagline}</p>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">Key metric</dt>
              <dd className="mt-1 font-mono text-lg text-accent">{project.metric.value}</dd>
              <dd className="text-muted">{project.metric.label}</dd>
            </div>
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="mt-1">{project.role}</dd>
            </div>
            <div>
              <dt className="text-muted">Started</dt>
              <dd className="mt-1">{formatMonthYear(project.date)}</dd>
            </div>
          </dl>
          <ProjectLinks project={project} size="md" className="relative z-10 mt-8 flex flex-wrap gap-2" />
        </header>

        <section aria-label="Case study" className="mt-12">
          <MarkdownContent html={html} />
        </section>

        <footer className="mt-16 border-t border-border pt-10">
          <p className="text-muted">Explore the repo or view the live demo when it ships.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/projects/" variant="secondary">
              ← All projects
            </ButtonLink>
            <ProjectLinks project={project} size="md" />
          </div>
        </footer>
      </Container>
    </article>
  );
}