'use client';

import { useState } from 'react';
import { ModelViewer } from './ModelViewer';
import { ImageGallery } from './ImageGallery';
import { ProjectTabs } from './ProjectTabs';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface ProjectTabContentProps {
  project: any;
  tabs: Tab[];
}

export function ProjectTabContent({ project, tabs }: ProjectTabContentProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'overview');

  // Determine what content is available
  const hasGallery = project.featuredImage || (project.images && project.images.length > 0);
  const hasModel = project.modelPath || project.modelFile;

  return (
    <div className="space-y-0">
      {/* Terminal-style tab navigation */}
      <div className="border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-1 px-4 py-2" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <span className="text-sm mr-2" style={{ color: 'var(--link-color)' }}>
            $ view --mode=
          </span>
          <div className="flex gap-1">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 text-sm transition-all"
                style={{
                  color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                  backgroundColor: activeTab === tab.id ? 'var(--bg-dark)' : 'transparent',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                }}
              >
                {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
                {tab.label}
                {index < tabs.length - 1 && (
                  <span className="ml-2" style={{ color: 'var(--text-muted)' }}>
                    |
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6" style={{ backgroundColor: 'var(--bg-dark)' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Description */}
            <div>
              <div className="text-sm mb-4" style={{ color: 'var(--link-color)' }}>
                $ cat description.txt
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

            {/* Quick metadata */}
            <div className="pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div className="text-sm mb-4" style={{ color: 'var(--link-color)' }}>
                $ ls -la info/
              </div>
              <div className="space-y-3 text-sm">
                {project.date && (
                  <div className="flex items-start gap-4">
                    <span className="min-w-[80px]" style={{ color: 'var(--text-muted)' }}>
                      date
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {new Date(project.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {project.categories && project.categories.length > 0 && (
                  <div className="flex items-start gap-4">
                    <span className="min-w-[80px]" style={{ color: 'var(--text-muted)' }}>
                      categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {project.categories.map((cat: string) => (
                        <span key={cat} style={{ color: 'var(--text-primary)' }}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-start gap-4">
                    <span className="min-w-[80px]" style={{ color: 'var(--text-muted)' }}>
                      tags
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 5).map((tag: string) => (
                        <span key={tag} style={{ color: 'var(--text-muted)' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && hasGallery && (
          <div>
            <div className="text-sm mb-4" style={{ color: 'var(--link-color)' }}>
              $ ls gallery/
            </div>
            <ImageGallery
              images={project.images || []}
              featuredImage={project.featuredImage}
              projectTitle={project.title}
            />
          </div>
        )}

        {/* Model Tab */}
        {activeTab === 'model' && hasModel && (
          <div>
            <div className="text-sm mb-4" style={{ color: 'var(--link-color)' }}>
              $ open {project.modelPath || project.modelFile}
            </div>
            <div className="max-w-3xl mx-auto">
              <ModelViewer modelPath={project.modelPath || `/models/${project.modelFile}`} />
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-8">
            {/* Full Metadata */}
            <div>
              <div className="text-sm mb-4" style={{ color: 'var(--link-color)' }}>
                $ cat metadata.json
              </div>
              <div className="space-y-3 text-sm">
                {project.date && (
                  <div className="flex items-start gap-4">
                    <span className="min-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                      date
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {new Date(project.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {project.categories && project.categories.length > 0 && (
                  <div className="flex items-start gap-4">
                    <span className="min-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                      categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {project.categories.map((cat: string) => (
                        <span key={cat} style={{ color: 'var(--text-primary)' }}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-start gap-4">
                    <span className="min-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                      tags
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag: string) => (
                        <span key={tag} style={{ color: 'var(--text-muted)' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(project.modelFile || project.modelPath) && (
                  <div className="flex items-start gap-4">
                    <span className="min-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                      3d_model
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {project.modelPath || project.modelFile}
                    </span>
                  </div>
                )}

                {project.cleanRepo && (
                  <div className="flex items-start gap-4">
                    <span className="min-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                      clean_repo
                    </span>
                    <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                  </div>
                )}

                {project.lastModified && (
                  <div className="flex items-start gap-4">
                    <span className="min-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                      last_modified
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {new Date(project.lastModified).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            {(project.repository || project.website || project.modelUrl || project.attribution) && (
              <div className="pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="text-sm mb-4" style={{ color: 'var(--link-color)' }}>
                  $ cat links.txt
                </div>
                <div className="space-y-3 text-sm">
                  {project.repository && (
                    <a
                      href={project.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity block"
                      style={{ color: 'var(--link-color)' }}
                    >
                      [View on GitHub →]
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
                  {project.modelUrl && (
                    <a
                      href={project.modelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity block"
                      style={{ color: 'var(--link-color)' }}
                    >
                      [View 3D Model Source →]
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
