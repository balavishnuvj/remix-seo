# Remix SEO

Collection of SEO utilities like sitemap, robots.txt, etc. for a [Remix](https://remix.run/)

# Features

- Generate Sitemap
- Generate Robots.txt

# Installation

To use it, install it from npm (or yarn):

```sh
npm install @balavishnuvj/remix-seo
```

# Usage

Add a sitemap and a robots.txt file to your site by adding [resource routes](https://remix.run/docs/en/main/guides/resource-routes) for them, as explained below.

## Sitemap

Add to your project a route moodule called `app/routes/sitemap[.]xml.ts` with the following contents.

```ts
import { routes } from "@remix-run/dev/server-build";
import type { LoaderArgs } from "@remix-run/node";
import { generateSitemap } from "@balavishnuvj/remix-seo";

export function loader({ request }: LoaderArgs) {
  return generateSitemap(request, routes, {
    siteUrl: "https://balavishnuvj.com",
  });
}
```

`generateSitemap` takes three params `request`, `routes`, and `SEOOptions`.

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
import { SEOHandle } from "@balavishnuvj/remix-seo";

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

Add a new route module with the filename `app/routes/robots[.txt].ts` and the
following contents:

To generate `robots.txt`

```ts
import { generateRobotsTxt } from '@balavishnuvj/remix-seo'

export function loader() {
  return generateRobotsTxt([
    { type: "sitemap", value: "https://balavishnuvj.com/sitemap.xml" },
    { type: "disallow", value: "/admin" },
  ]);
}
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
