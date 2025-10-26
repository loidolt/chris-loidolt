'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Project } from '@/lib/airtable';
import OverlayPanel, { PanelTab } from './OverlayPanel';
import { ProjectDetailsSection } from './ProjectDetailsSection';

interface ProjectDetailClientProps {
  project: Project;
  allProjects: Project[];
}

// Helper function to find related projects
function getRelatedProjects(currentProject: Project, allProjects: Project[], limit: number = 6): Project[] {
  const related = allProjects
    .filter((p) => p.id !== currentProject.id) // Exclude current project
    .map((p) => {
      let score = 0;

      // Score based on shared categories
      const sharedCategories = (currentProject.categories || []).filter(
        (cat) => (p.categories || []).includes(cat)
      );
      score += sharedCategories.length * 3;

      // Score based on shared tags
      const sharedTags = (currentProject.tags || []).filter(
        (tag) => (p.tags || []).includes(tag)
      );
      score += sharedTags.length * 2;

      return { project: p, score };
    })
    .filter((item) => item.score > 0) // Only include projects with some relevance
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, limit) // Limit results
    .map((item) => item.project);

  return related;
}

export default function ProjectDetailClient({ project, allProjects }: ProjectDetailClientProps) {
  // Get related projects
  const relatedProjects = useMemo(
    () => getRelatedProjects(project, allProjects),
    [project, allProjects]
  );

  // Create panel tabs
  const tabs: PanelTab[] = [
    {
      id: 'info',
      label: 'Info',
      content: (
        <div className="p-4 space-y-6 text-sm">
          {/* Categories */}
          {project.categories && project.categories.length > 0 && (
            <div>
              <div className="mb-2" style={{ color: 'var(--accent-secondary)' }}>
                Categories
              </div>
              <div className="flex flex-wrap gap-2" style={{ color: 'var(--text-muted)' }}>
                {project.categories.map((cat: string) => (
                  <span key={cat}>[{cat}]</span>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          {project.date && (
            <div>
              <div className="mb-2" style={{ color: 'var(--accent-secondary)' }}>
                Date
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                {new Date(project.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <div className="mb-2" style={{ color: 'var(--accent-secondary)' }}>
                Tags
              </div>
              <div className="flex flex-wrap gap-2" style={{ color: 'var(--text-muted)' }}>
                {project.tags.map((tag: string) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(project.repository || project.website || project.attribution) && (
            <div>
              <div className="mb-2" style={{ color: 'var(--accent-secondary)' }}>
                Links
              </div>
              <div className="space-y-2">
                {project.repository && (
                  <a
                    href={project.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-70 transition-opacity py-1"
                    style={{
                      color: 'var(--link-color)',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    [GitHub →]
                  </a>
                )}
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-70 transition-opacity py-1"
                    style={{
                      color: 'var(--link-color)',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    [Visit Website →]
                  </a>
                )}
                {project.attribution && (
                  <a
                    href={project.attribution}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-70 transition-opacity py-1"
                    style={{
                      color: 'var(--text-muted)',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    [Attribution →]
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'related',
      label: 'Related',
      content: (
        <div className="p-4 space-y-4 text-sm">
          {relatedProjects.length > 0 ? (
            <>
              <div className="mb-2" style={{ color: 'var(--accent-secondary)' }}>
                Related Projects
              </div>
              <div className="space-y-4">
                {relatedProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.slug}`}
                    className="block hover:opacity-70 transition-opacity"
                    style={{
                      borderLeft: '2px solid var(--border-color)',
                      paddingLeft: '12px',
                    }}
                  >
                    <div style={{ color: 'var(--link-color)' }} className="mb-1">
                      {p.title}
                    </div>
                    {p.categories && p.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {p.categories.map((cat) => (
                          <span key={cat}>[{cat}]</span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>
              No related projects found
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Overlay Panel */}
      <OverlayPanel
        tabs={tabs}
        defaultTab="info"
        position="left"
        storageKey="project-detail"
      />

      {/* Main Content */}
      <div className="py-6 md:py-8 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="space-y-8">
          {/* Back Button */}
          <div className="flex items-center gap-3 text-base md:text-sm">
            <Link
              href="/projects"
              className="hover:opacity-70 transition-opacity py-2"
              style={{
                color: 'var(--link-color)',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              [← back to projects]
            </Link>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-xl md:text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
              {project.title}
            </h1>
          </div>

          {/* Featured Image */}
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

          {/* Description */}
          <div>
            <div className="text-sm mb-4" style={{ color: 'var(--accent-secondary)' }}>
              Description
            </div>
            <div
              className="text-base md:text-sm whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none"
              style={{ color: 'var(--text-primary)' }}
            >
              {project.markdown ? (
                <div dangerouslySetInnerHTML={{ __html: project.markdown }} />
              ) : (
                <p>{project.longDescription || project.description}</p>
              )}
            </div>
          </div>

          {/* Expandable Details Section */}
          <ProjectDetailsSection project={project} />
        </div>
      </div>
    </>
  );
}
