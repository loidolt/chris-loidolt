import type { Route } from "./+types/sitemap[.]xml";
import { getAllProjects } from "../services/airtable.server";

export async function loader({}: Route.LoaderArgs) {
  const projects = await getAllProjects().catch(() => []);

  const baseUrl = "https://chrisloidolt.com"; // Update with your actual domain
  const currentDate = new Date().toISOString();

  const staticPages = [
    { url: "", priority: "1.0", changefreq: "weekly" },
    { url: "/projects", priority: "0.9", changefreq: "weekly" },
    { url: "/about", priority: "0.8", changefreq: "monthly" },
    { url: "/contact", priority: "0.8", changefreq: "monthly" },
  ];

  const projectPages = projects.map((project) => ({
    url: `/projects/${project.slug}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: project.date || currentDate,
  }));

  const pages = [...staticPages, ...projectPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
