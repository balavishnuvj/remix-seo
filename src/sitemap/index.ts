import { EntryContext } from "@remix-run/server-runtime";
import { SEOOptions } from "../types";
import { getSitemapXml } from "./utils";

export async function generateSitemap(
  request: Request,
  remixEntryContent: EntryContext,
  options: SEOOptions
) {
  const { siteUrl, headers } = options;
  const sitemap = await getSitemapXml(request, remixEntryContent, {
    siteUrl,
  });
  return new Response(sitemap, {
    headers: {
      ...headers,
      "Content-Type": "application/xml",
      "Content-Length": String(Buffer.byteLength(sitemap)),
    },
  });
}
