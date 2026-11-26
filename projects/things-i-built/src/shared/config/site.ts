const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const siteConfig = {
  name: "Bohdan Maistrenko",
  shortName: "Things I Built",
  title: "Bohdan Maistrenko: crypto research analyst",
  role: "Crypto research analyst",
  description:
    "Crypto research analyst. Three trading research tools built with AI coding assistants. Community manager at Arkham, former process engineer at P&G.",
  url: siteUrl,
  locale: "en_US",
  cvPath: "/cv.pdf",
  location: "Remote · CET",
  contacts: {
    email: "mstrnkbgdn@gmail.com",
    telegram: "https://t.me/w18room",
    linkedin: "https://www.linkedin.com/in/bohdanmaistrenko/",
    github: "https://github.com/osobennyj",
  },
} as const;

export const navigation = [
  { href: "/#projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
] as const;
