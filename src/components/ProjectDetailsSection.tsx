'use client';

import { useState } from 'react';
import { ModelViewer } from './ModelViewer';
import { ImageGallery } from './ImageGallery';

interface ProjectDetailsSectionProps {
  project: any;
}

type SectionType = 'gallery' | 'model' | 'metadata' | null;

export function ProjectDetailsSection({ project }: ProjectDetailsSectionProps) {
  const [expandedSection, setExpandedSection] = useState<SectionType>(null);

  const hasGallery = project.images && project.images.length > 0;
  const hasModel = project.modelPath || project.modelFile;
  const hasAdditionalMetadata = project.cleanRepo || project.lastModified || (project.modelFile || project.modelPath);

  // If nothing to show, don't render the section
  if (!hasGallery && !hasModel && !hasAdditionalMetadata) {
    return null;
  }

  const toggleSection = (section: SectionType) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="border-t pt-8" style={{ borderColor: 'var(--border-color)' }}>
      <div className="text-sm mb-4" style={{ color: 'var(--accent-secondary)' }}>
        Additional Details
      </div>

      <div className="space-y-2">
        {/* Gallery Section */}
        {hasGallery && (
          <div className="border" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => toggleSection('gallery')}
              className="w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:opacity-70 transition-opacity"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--text-muted)' }}>
                  {expandedSection === 'gallery' ? '▼' : '▶'}
                </span>
                <span style={{ color: 'var(--accent-primary)' }}>gallery/</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  ({project.images.length} {project.images.length === 1 ? 'image' : 'images'})
                </span>
              </div>
            </button>
            {expandedSection === 'gallery' && (
              <div className="p-6" style={{ backgroundColor: 'var(--bg-dark)' }}>
                <ImageGallery
                  images={project.images}
                  featuredImage={project.featuredImage}
                  projectTitle={project.title}
                />
              </div>
            )}
          </div>
        )}

        {/* 3D Model Section */}
        {hasModel && (
          <div className="border" style={{ borderColor: 'var(--border-color)' }}>
            <div
              className="w-full px-4 py-3 text-sm flex items-center justify-between"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <button
                onClick={() => toggleSection('model')}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity text-left flex-1"
              >
                <span style={{ color: 'var(--text-muted)' }}>
                  {expandedSection === 'model' ? '▼' : '▶'}
                </span>
                <span style={{ color: 'var(--accent-primary)' }}>
                  {project.modelPath || project.modelFile}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>(3D model)</span>
              </button>
              {project.modelUrl && (
                <a
                  href={project.modelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity ml-4"
                  style={{ color: 'var(--link-color)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  [View Source →]
                </a>
              )}
            </div>
            {expandedSection === 'model' && (
              <div className="p-6" style={{ backgroundColor: 'var(--bg-dark)' }}>
                <div className="max-w-3xl mx-auto">
                  <ModelViewer modelPath={project.modelPath || `/models/${project.modelFile}`} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional Metadata Section */}
        {hasAdditionalMetadata && (
          <div className="border" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => toggleSection('metadata')}
              className="w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:opacity-70 transition-opacity"
              style={{ backgroundColor: 'var(--bg-surface)' }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--text-muted)' }}>
                  {expandedSection === 'metadata' ? '▼' : '▶'}
                </span>
                <span style={{ color: 'var(--accent-primary)' }}>metadata.json</span>
                <span style={{ color: 'var(--text-muted)' }}>(additional info)</span>
              </div>
            </button>
            {expandedSection === 'metadata' && (
              <div className="p-6" style={{ backgroundColor: 'var(--bg-dark)' }}>
                <div className="space-y-3 text-sm">
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
