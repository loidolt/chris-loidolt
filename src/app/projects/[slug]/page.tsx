import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ImageGallery } from '@/components/ImageGallery';
import { ProjectDetailsSection } from '@/components/ProjectDetailsSection';
import { getAllProjects } from '@/lib/airtable';

// Generate static paths at build time
export async function generateStaticParams() {
  const projects = await getAllProjects();

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// Generate metadata for each project
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const projects = await getAllProjects();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} - Chris Loidolt`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getAllProjects();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/projects"
          className="hover:opacity-70 transition-opacity"
          style={{ color: 'var(--link-color)' }}
        >
          [← back to projects]
        </Link>
      </div>

      {/* Page Header with Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Title and Categories */}
        <div>
          <h1 className="text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
            {project.title}
          </h1>
          {project.categories && project.categories.length > 0 && (
            <div
              className="flex flex-wrap gap-2 text-sm mb-4"
              style={{ color: 'var(--text-muted)' }}
            >
              {project.categories.map((cat: string) => (
                <span key={cat}>[{cat}]</span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details and Links */}
        <div className="space-y-6 lg:text-right">
          {/* Date */}
          {project.date && (
            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {new Date(project.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          )}

          {/* Links */}
          {(project.repository || project.website || project.attribution) && (
            <div className="space-y-2 text-sm lg:flex lg:flex-col lg:items-end">
              {project.repository && (
                <a
                  href={project.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity flex items-center gap-2 lg:justify-end"
                  style={{ color: 'var(--link-color)' }}
                >
                  [GitHub →]
                </a>
              )}
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity block"
                  style={{ color: 'var(--link-color)' }}
                >
                  [Visit Website →]
                </a>
              )}
              {project.attribution && (
                <a
                  href={project.attribution}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  [Attribution/Credit →]
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Featured Image */}
        <div className="space-y-6">
          {project.featuredImage && (
            <div className="border" style={{ borderColor: 'var(--border-color)' }}>
              <img
                src={project.featuredImage}
                alt={project.title}
                className="w-full h-auto"
                loading="eager"
              />
            </div>
          )}

          {!project.featuredImage &&
            !(project.images && project.images.length > 0) &&
            !(project.modelPath || project.modelFile) && (
              <div
                className="p-12 flex items-center justify-center aspect-square"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <div className="text-6xl opacity-30" style={{ color: 'var(--text-muted)' }}>
                  📁
                </div>
              </div>
            )}
        </div>

        {/* Right Column: Description */}
        <div>
          <div className="text-sm mb-4" style={{ color: 'var(--accent-secondary)' }}>
            Description
          </div>
          <div
            className="text-sm whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none"
            style={{ color: 'var(--text-primary)' }}
          >
            {project.markdown ? (
              <div dangerouslySetInnerHTML={{ __html: project.markdown }} />
            ) : (
              <p>{project.longDescription || project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      <ProjectDetailsSection project={project} />
    </div>
  );
}
