import { Metadata } from 'next';
import Link from 'next/link';
import { getQualifications, getServices, type Qualification, type Service } from '@/lib/pocketbase';

export const metadata: Metadata = {
  title: 'About - Chris Loidolt',
  description:
    'Designer and engineer with a passion for creating innovative solutions through 3D printing, woodworking, and software development.',
};

export default async function AboutPage() {
  // Fetch data at build/request time
  let qualifications: Qualification[] = [];
  let services: Service[] = [];

  try {
    [qualifications, services] = await Promise.all([
      getQualifications().catch(() => []),
      getServices().catch(() => []),
    ]);
  } catch (error) {
    console.error('Error loading about page data:', error);
  }

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>
          Chris Loidolt - Designer & Engineer
        </h1>
      </div>

      {/* About Section */}
      <div className="pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="text-sm mb-6" style={{ color: 'var(--accent-secondary)' }}>
          About
        </div>
        <div className="space-y-4 max-w-3xl text-base md:text-sm" style={{ color: 'var(--text-primary)' }}>
          <p>
            I'm a designer and engineer with a passion for creating innovative solutions through 3D
            printing, woodworking, and software development. My work combines technical precision
            with creative problem-solving to bring ideas to life.
          </p>
          <p>
            From designing custom 3D-printed parts to building full-stack web applications, I love
            tackling complex challenges and learning new technologies along the way.
          </p>
        </div>
      </div>

      {/* Services Section */}
      {services.length > 0 && (
        <div className="pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="text-sm mb-6" style={{ color: 'var(--accent-secondary)' }}>
            Services ({services.length})
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {services.map((service) => (
              <div key={service.id} className="space-y-2 p-4 md:p-0" style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
              }}>
                <h3 className="text-base md:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {service.icon && <span className="mr-2">{service.icon}</span>}
                  {service.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Qualifications Section */}
      {qualifications.length > 0 && (
        <div className="pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="text-sm mb-6" style={{ color: 'var(--accent-secondary)' }}>
            Qualifications ({qualifications.length})
          </div>

          <div className="space-y-6">
            {qualifications.map((qual) => (
              <div key={qual.id} className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                  <h3 className="text-base md:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {qual.title}
                  </h3>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    [{qual.year}]
                  </span>
                </div>
                <div className="text-sm" style={{ color: 'var(--link-color)' }}>
                  {qual.institution}
                </div>
                {qual.description && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {qual.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section */}
      <div className="pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="text-sm mb-6" style={{ color: 'var(--accent-secondary)' }}>
          Skills
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <div>
            <div className="mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              &quot;design&quot;: [
            </div>
            <ul className="space-y-2 text-sm ml-4" style={{ color: 'var(--text-primary)' }}>
              <li>→ 3D Modeling</li>
              <li>→ CAD Design</li>
              <li>→ UI/UX Design</li>
              <li>→ Woodworking</li>
            </ul>
            <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              ]
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              &quot;fabrication&quot;: [
            </div>
            <ul className="space-y-2 text-sm ml-4" style={{ color: 'var(--text-primary)' }}>
              <li>→ 3D Printing</li>
              <li>→ CNC Machining</li>
              <li>→ Laser Cutting</li>
              <li>→ Carpentry</li>
            </ul>
            <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              ]
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              &quot;software&quot;: [
            </div>
            <ul className="space-y-2 text-sm ml-4" style={{ color: 'var(--text-primary)' }}>
              <li>→ React/TypeScript</li>
              <li>→ Node.js</li>
              <li>→ Python</li>
              <li>→ Three.js</li>
            </ul>
            <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              ]
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="text-sm mb-4" style={{ color: 'var(--accent-secondary)' }}>
          Collaboration & Consulting
        </div>
        <p className="mb-6 text-base md:text-sm max-w-2xl" style={{ color: 'var(--text-primary)' }}>
          I'm available for collaboration and consulting. Interested in working together? Let's
          discuss your project.
        </p>
        <Link
          href="/contact"
          className="inline-block text-base md:text-sm py-2 hover:opacity-70 transition-opacity"
          style={{
            color: 'var(--link-color)',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          [Get in touch →]
        </Link>
      </div>
    </div>
  );
}
