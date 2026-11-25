import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Next.js app routes live outside `src/views`; slice reference graph is incomplete in static analysis.
      "fsd/insignificant-slice": "off",
    },
  },
]);