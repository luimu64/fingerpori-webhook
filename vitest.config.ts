import { defineConfig } from "vitest/config";

// Scrapers are plain fetch + cheerio logic, so the node environment is enough.
// The worker bundle itself is validated by `wrangler deploy --dry-run`.
export default defineConfig({
	test: {
		environment: "node",
	},
});
