// 参照: https://github.com/brookslybrand/remix-gh-pages/blob/main/vite.config.ts

import { copyFileSync } from "node:fs";
import { join } from "node:path";
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const basename = "/kyukai-kun-proto/";

export default defineConfig({
  base: basename,
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      ssr: false,
      basename,
      buildEnd: ({ viteConfig }) => {
        if (!viteConfig.isProduction) {
          return;
        }

        const buildPath = viteConfig.build.outDir;
        copyFileSync(
          join(buildPath, "index.html"),
          join(buildPath, "404.html")
        );
      },
    }),
    tsconfigPaths(),
  ],
});
