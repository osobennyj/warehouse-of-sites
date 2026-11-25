import { ButtonLink, Container } from "@/shared/ui";

export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center py-32 text-center">
      <p className="font-mono text-sm tracking-widest text-accent uppercase">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">This route does not exist. Try the projects grid or head home.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/projects/" variant="secondary">
          Projects
        </ButtonLink>
      </div>
    </Container>
  );
}