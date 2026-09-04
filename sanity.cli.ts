import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./sanity/env";

/**
 * CLI config for `npx sanity deploy`.
 *
 * The Studio is hosted by Sanity at https://shabywurld.sanity.studio rather
 * than embedded in the Next.js app. Embedding it added 4.7 MB to the Worker
 * bundle — pushing it past Cloudflare's 3 MB free-plan limit — for a page only
 * the shop owner ever opens. Sanity hosts it for free.
 *
 * `studioHost` is set so deploys are non-interactive.
 */
export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "shabywurld",
  deployment: { autoUpdates: true },
});
