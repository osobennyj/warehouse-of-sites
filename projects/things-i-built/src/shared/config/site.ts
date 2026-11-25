const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const siteConfig = {
  name: "Bohdan Maistrenko",
  shortName: "Things I Built",
  title: "Bohdan Maistrenko: on-chain research and builder",
  role: "On-chain research and builder",
  description:
    "I turn crypto research into working tools: dashboards, bots and agents. Arkham community manager, former P&G process engineer.",
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
  { href: "/projects/", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
] as const;
