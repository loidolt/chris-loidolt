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
    { name: "description", content: "Learn more about Chris Loidolt" },
  ];
}

export default function About() {
  const { qualifications, services } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Terminal Header */}
        <div className="border border-terminal-green p-4 bg-terminal-black">
          <pre className="text-terminal-green">
{`$ whoami
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chris Loidolt - Designer & Engineer`}
          </pre>
        </div>

        {/* About Section */}
        <div className="border border-terminal-border bg-terminal-dark p-6">
          <div className="text-terminal-amber mb-4">$ cat bio.txt</div>
          <div className="space-y-4 text-terminal-text">
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
          <div className="space-y-4">
            <div className="border border-terminal-cyan p-3 bg-terminal-black">
              <div className="text-terminal-cyan">
                $ ls services/ <span className="text-terminal-text">({services.length} items)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border border-terminal-border bg-terminal-dark p-6 hover:border-terminal-cyan transition-colors"
                >
                  <h3 className="text-terminal-green mb-3 font-medium">
                    {service.icon && <span className="mr-2">{service.icon}</span>}
                    {service.title}
                  </h3>
                  <p className="text-terminal-text text-sm">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Qualifications Section */}
        {qualifications.length > 0 && (
          <div className="space-y-4">
            <div className="border border-terminal-cyan p-3 bg-terminal-black">
              <div className="text-terminal-cyan">
                $ cat qualifications.log <span className="text-terminal-text">({qualifications.length} entries)</span>
              </div>
            </div>

            <div className="space-y-3">
              {qualifications.map((qual) => (
                <div
                  key={qual.id}
                  className="border border-terminal-border bg-terminal-dark p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-terminal-text-bright font-medium">
                      {qual.title}
                    </h3>
                    <span className="text-terminal-amber text-sm">
                      [{qual.year}]
                    </span>
                  </div>
                  <div className="text-terminal-cyan text-sm mb-2">
                    {qual.institution}
                  </div>
                  {qual.description && (
                    <p className="text-terminal-text text-sm">
                      {qual.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        <div className="border border-terminal-border bg-terminal-dark p-6">
          <div className="text-terminal-amber mb-4">$ cat skills.json</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-terminal-cyan mb-3 text-sm">
                "design": [
              </div>
              <ul className="space-y-1 text-terminal-text text-sm ml-4">
                <li>→ 3D Modeling</li>
                <li>→ CAD Design</li>
                <li>→ UI/UX Design</li>
                <li>→ Woodworking</li>
              </ul>
              <div className="text-terminal-cyan text-sm mt-2">]</div>
            </div>

            <div>
              <div className="text-terminal-cyan mb-3 text-sm">
                "fabrication": [
              </div>
              <ul className="space-y-1 text-terminal-text text-sm ml-4">
                <li>→ 3D Printing</li>
                <li>→ CNC Machining</li>
                <li>→ Laser Cutting</li>
                <li>→ Carpentry</li>
              </ul>
              <div className="text-terminal-cyan text-sm mt-2">]</div>
            </div>

            <div>
              <div className="text-terminal-cyan mb-3 text-sm">
                "software": [
              </div>
              <ul className="space-y-1 text-terminal-text text-sm ml-4">
                <li>→ React/TypeScript</li>
                <li>→ Node.js</li>
                <li>→ Python</li>
                <li>→ Three.js</li>
              </ul>
              <div className="text-terminal-cyan text-sm mt-2">]</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border border-terminal-green bg-terminal-black p-6">
          <div className="text-terminal-green mb-4">
            $ Available for collaboration and consulting
          </div>
          <p className="text-terminal-text mb-4">
            Interested in working together? Let's discuss your project.
          </p>
          <a
            href="/contact"
            className="inline-block border border-terminal-cyan px-6 py-3 text-terminal-cyan hover:bg-terminal-dark hover:text-terminal-text-bright transition-colors"
          >
            [Get in touch →]
          </a>
        </div>
      </div>
    </Layout>
  );
}
