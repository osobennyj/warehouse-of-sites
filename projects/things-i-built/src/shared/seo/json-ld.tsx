import { siteConfig } from "@/shared/config";

type JsonLdData = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function personJsonLd(): JsonLdData {
  const { contacts } = siteConfig;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: siteConfig.role,
    description: siteConfig.description,
    url: siteConfig.url,
    email: `mailto:${contacts.email}`,
    sameAs: [contacts.linkedin, contacts.github, contacts.telegram],
    alumniOf: ["Tallinn University of Technology", "Hamburg University of Technology"],
    knowsAbout: ["On-chain analytics", "Tokenomics", "DeFi", "TypeScript", "Python", "AI-assisted development"],
  };
}
