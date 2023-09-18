# Remix SEO

A fork of https://github.com/balavishnuvj/remix-seo with some added bug fixes and features.

Collection of SEO utilities like sitemap, robots.txt, etc. for a [Remix](https://remix.run/)

# Features

- Generate Sitemap
- Generate Robots.txt

# Installation

To use it, install it from npm (or yarn):

```sh
npm install @nasa-gcn/remix-seo
```

# Usage

For all miscellaneous routes in root like `/robots.txt`, `/sitemap.xml`. We can create a single function to handle all of them instead polluting our `routes` folder.

For that, lets create a file called `otherRootRoutes.server.ts` (file could be anything, make sure it is import only in server by ending with`.server.{ts|js}`)

```ts
// otherRootRoutes.server.ts

import { EntryContext } from "remix";

type Handler = (
  request: Request,
  remixContext: EntryContext
) => Promise<Response | null> | null;

export const otherRootRoutes: Record<string, Handler> = {};

export const otherRootRouteHandlers: Array<Handler> = [
  ...Object.entries(otherRootRoutes).map(([path, handler]) => {
    return (request: Request, remixContext: EntryContext) => {
      if (new URL(request.url).pathname !== path) return null;
      return handler(request, remixContext);
    };
  }),
];
```

and import this file in your `entry.server.tsx`

```diff
import { renderToString } from "react-dom/server";
import { RemixServer } from "remix";
import type { EntryContext } from "remix";
+import { otherRootRouteHandlers } from "./otherRootRoutes.server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
+  for (const handler of otherRootRouteHandlers) {
+    const otherRouteResponse = await handler(request, remixContext);
+    if (otherRouteResponse) return otherRouteResponse;
+  }
  let markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
```

## Sitemap

To generate sitemap, `@nasa-gcn/remix-seo` would need context of all your routes.

If you have already created a file to handle all root routes. If not, [check above](#usage)

Add config for your sitemap

```ts
import { EntryContext } from "remix";
import { generateSitemap } from "@nasa-gcn/remix-seo";

type Handler = (
  request: Request,
  remixContext: EntryContext
) => Promise<Response | null> | null;

export const otherRootRoutes: Record<string, Handler> = {
  "/sitemap.xml": async (request, remixContext) => {
    return generateSitemap(request, remixContext, {
      siteUrl: "https://balavishnuvj.com",
    });
  },
};

export const otherRootRouteHandlers: Array<Handler> = [
  ...Object.entries(otherRootRoutes).map(([path, handler]) => {
    return (request: Request, remixContext: EntryContext) => {
      if (new URL(request.url).pathname !== path) return null;

      return handler(request, remixContext);
    };
  }),
];
```

`generateSitemap` takes three params `request`, `EntryContext`, and `SEOOptions`.

### Configuration

- `SEOOptions` lets you configure the sitemap

```ts
export type SEOOptions = {
  siteUrl: string; // URL where the site is hosted, eg. https://balavishnuvj.com
  headers?: HeadersInit; // Additional headers
  /*
    eg:  
        headers: {
            "Cache-Control": `public, max-age=${60 * 5}`,
        },
  */
};
```

- To not generate sitemap for a route

```ts
// in your routes/url-that-doesnt-need-sitemap
import { SEOHandle } from "@nasa-gcn/remix-seo";

export let loader: LoaderFunction = ({ request }) => {
  /**/
};

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
};
```

- To generate sitemap for dynamic routes

```ts
// routes/blog/$blogslug.tsx

export const handle: SEOHandle = {
  getSitemapEntries: async (request) => {
    const blogs = await db.blog.findMany();
    return blogs.map((blog) => {
      return { route: `/blog/${blog.slug}`, priority: 0.7 };
    });
  },
};
```

## Robots

You can add this part of the root routes as did above[check above](#usage). Or else you can create a new file in your `routes` folder with `robots[.txt].ts`

To generate `robots.txt`

```ts
generateRobotsTxt([
  { type: "sitemap", value: "https://balavishnuvj.com/sitemap.xml" },
  { type: "disallow", value: "/admin" },
]);
```

`generateRobotsTxt` takes two arguments.

First one is array of `policies`

```ts
export type RobotsPolicy = {
  type: "allow" | "disallow" | "sitemap" | "crawlDelay" | "userAgent";
  value: string;
};
```

and second parameter `RobotsConfig` is for additional configuration

```ts
export type RobotsConfig = {
  appendOnDefaultPolicies?: boolean; // If default policies should used
  /*
  Default policy
    const defaultPolicies: RobotsPolicy[] = [
    {
        type: "userAgent",
        value: "*",
    },
    {
        type: "allow",
        value: "/",
    },
    ];
  */
  headers?: HeadersInit; // Additional headers
  /*
    eg:  
        headers: {
            "Cache-Control": `public, max-age=${60 * 5}`,
        },
  */
};
```

If you are using single function to create both `sitemap` and `robots.txt`

```ts
import { EntryContext } from "remix";
import { generateRobotsTxt, generateSitemap } from "@nasa-gcn/remix-seo";

type Handler = (
  request: Request,
  remixContext: EntryContext
) => Promise<Response | null> | null;

export const otherRootRoutes: Record<string, Handler> = {
  "/sitemap.xml": async (request, remixContext) => {
    return generateSitemap(request, remixContext, {
      siteUrl: "https://balavishnuvj.com",
      headers: {
        "Cache-Control": `public, max-age=${60 * 5}`,
      },
    });
  },
  "/robots.txt": async () => {
    return generateRobotsTxt([
      { type: "sitemap", value: "https://balavishnuvj.com/sitemap.xml" },
      { type: "disallow", value: "/admin" },
    ]);
  },
};

export const otherRootRouteHandlers: Array<Handler> = [
  ...Object.entries(otherRootRoutes).map(([path, handler]) => {
    return (request: Request, remixContext: EntryContext) => {
      if (new URL(request.url).pathname !== path) return null;

      return handler(request, remixContext);
    };
  }),
];
```
