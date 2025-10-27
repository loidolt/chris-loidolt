import Link from 'next/link';
import TerminalWelcome from '@/components/TerminalWelcome';
import ProjectNodeGraph from '@/components/ProjectNodeGraph';
import { getAllProjects } from '@/lib/pocketbase';

const quickLinks = [
  { label: 'View all projects', link: '/projects' },
  { label: 'Learn more about me', link: '/about' },
  { label: 'Get in touch', link: '/contact' },
];

export default async function HomePage() {
  // Fetch projects for the node graph
  const allProjects = await getAllProjects();
  const stats = [
    { label: 'Projects', value: `${allProjects.length}`, href: '/projects' },
    { label: 'Categories', value: '8', href: '/projects' },
    { label: '3D Models', value: '30+', href: '/projects' },
  ];

  // Prepare simplified project data for the graph (only what we need)
  const projectsForGraph = allProjects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    categories: p.categories || [],
    tags: p.tags || [],
  }));

  return (
    <>
      {/* Background Graph - full viewport, positioned fixed */}
      <div className="fixed inset-0 opacity-45 pointer-events-none" style={{ zIndex: 0 }}>
        <ProjectNodeGraph projects={projectsForGraph} />
      </div>

      {/* Foreground Content - relative positioning with proper spacing */}
      <div className="relative px-4 md:px-0" style={{ zIndex: 1 }}>
        {/* Terminal Welcome with typing animation */}
        <TerminalWelcome />

        {/* Quick Links Section */}
        <div className="py-8" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="mb-6 text-sm" style={{ color: 'var(--accent-secondary)' }}>
            Quick Links
          </div>
          <div className="space-y-4">
            {quickLinks.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                className="block text-base md:text-sm py-2 transition-opacity hover:opacity-70"
                style={{
                  color: 'var(--link-color)',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                [{item.label} →]
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="py-8" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="group py-2"
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div
                  className="text-xs mb-2 transition-opacity"
                  style={{ color: 'var(--link-color)' }}
                >
                  [{stat.label.toLowerCase()}]
                </div>
                <div
                  className="text-4xl md:text-3xl lg:text-4xl font-medium transition-opacity group-hover:opacity-70"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {stat.value}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
