import { useLoaderData } from "react-router";
import type { Route } from "./+types/about";
import { Layout } from "../components/Layout";
import { getQualifications, getServices } from "../services/airtable.server";

export async function loader({}: Route.LoaderArgs) {
  try {
    const [qualifications, services] = await Promise.all([
      getQualifications().catch(() => []),
      getServices().catch(() => []),
    ]);

    return { qualifications, services };
  } catch (error) {
    console.error("Error loading about page data:", error);
    return { qualifications: [], services: [] };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - Chris Loidolt" },
    { name: "description", content: "Designer and engineer with a passion for creating innovative solutions through 3D printing, woodworking, and software development." },
    { property: "og:title", content: "About - Chris Loidolt" },
    { property: "og:description", content: "Designer and engineer with a passion for creating innovative solutions through 3D printing, woodworking, and software development." },
    { name: "twitter:title", content: "About - Chris Loidolt" },
    { name: "twitter:description", content: "Designer and engineer with a passion for creating innovative solutions through 3D printing, woodworking, and software development." },
  ];
}

export default function About() {
  const { qualifications, services } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="space-y-12">
        {/* Page Header */}
        <div>
          <div className="text-terminal-cyan text-sm mb-4">$ whoami</div>
          <h1 className="text-2xl text-terminal-text mb-6">Chris Loidolt - Designer & Engineer</h1>
        </div>

        {/* About Section */}
        <div className="border-t border-terminal-border pt-8">
          <div className="text-terminal-cyan text-sm mb-6">$ cat bio.txt</div>
          <div className="space-y-4 text-terminal-text max-w-3xl">
            <p>
              I'm a designer and engineer with a passion for creating innovative solutions
              through 3D printing, woodworking, and software development. My work combines
              technical precision with creative problem-solving to bring ideas to life.
            </p>
            <p>
              From designing custom 3D-printed parts to building full-stack web applications,
              I love tackling complex challenges and learning new technologies along the way.
            </p>
          </div>
        </div>

        {/* Services Section */}
        {services.length > 0 && (
          <div className="border-t border-terminal-border pt-8">
            <div className="text-terminal-cyan text-sm mb-6">
              $ ls services/ ({services.length} items)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service) => (
                <div key={service.id} className="space-y-2">
                  <h3 className="text-terminal-text text-sm">
                    {service.icon && <span className="mr-2">{service.icon}</span>}
                    {service.title}
                  </h3>
                  <p className="text-terminal-gray text-sm">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Qualifications Section */}
        {qualifications.length > 0 && (
          <div className="border-t border-terminal-border pt-8">
            <div className="text-terminal-cyan text-sm mb-6">
              $ cat qualifications.log ({qualifications.length} entries)
            </div>

            <div className="space-y-6">
              {qualifications.map((qual) => (
                <div key={qual.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-terminal-text text-sm">
                      {qual.title}
                    </h3>
                    <span className="text-terminal-gray text-sm whitespace-nowrap">
                      [{qual.year}]
                    </span>
                  </div>
                  <div className="text-terminal-cyan text-sm">
                    {qual.institution}
                  </div>
                  {qual.description && (
                    <p className="text-terminal-gray text-sm">
                      {qual.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        <div className="border-t border-terminal-border pt-8">
          <div className="text-terminal-cyan text-sm mb-6">$ cat skills.json</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-terminal-gray mb-3 text-sm">
                "design": [
              </div>
              <ul className="space-y-2 text-terminal-text text-sm ml-4">
                <li>→ 3D Modeling</li>
                <li>→ CAD Design</li>
                <li>→ UI/UX Design</li>
                <li>→ Woodworking</li>
              </ul>
              <div className="text-terminal-gray text-sm mt-2">]</div>
            </div>

            <div>
              <div className="text-terminal-gray mb-3 text-sm">
                "fabrication": [
              </div>
              <ul className="space-y-2 text-terminal-text text-sm ml-4">
                <li>→ 3D Printing</li>
                <li>→ CNC Machining</li>
                <li>→ Laser Cutting</li>
                <li>→ Carpentry</li>
              </ul>
              <div className="text-terminal-gray text-sm mt-2">]</div>
            </div>

            <div>
              <div className="text-terminal-gray mb-3 text-sm">
                "software": [
              </div>
              <ul className="space-y-2 text-terminal-text text-sm ml-4">
                <li>→ React/TypeScript</li>
                <li>→ Node.js</li>
                <li>→ Python</li>
                <li>→ Three.js</li>
              </ul>
              <div className="text-terminal-gray text-sm mt-2">]</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t border-terminal-border pt-8">
          <div className="text-terminal-cyan text-sm mb-4">
            $ Available for collaboration and consulting
          </div>
          <p className="text-terminal-text mb-6 text-sm max-w-2xl">
            Interested in working together? Let's discuss your project.
          </p>
          <a
            href="/contact"
            className="inline-block text-terminal-cyan hover:text-terminal-text-bright transition-colors text-sm"
          >
            [Get in touch →]
          </a>
        </div>
      </div>
    </Layout>
  );
}
