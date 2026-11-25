"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label="Toggle color theme"
      className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-card hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* Both icons are rendered and toggled with CSS to avoid a hydration mismatch before the theme is known. */}
      <Sun aria-hidden className="hidden size-[1.1rem] dark:block" />
      <Moon aria-hidden className="block size-[1.1rem] dark:hidden" />
    </button>
  );
}
