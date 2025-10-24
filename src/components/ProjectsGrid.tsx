import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Project } from '@lib/airtable';

interface ProjectsGridProps {
  projects: Project[];
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Initialize Fuse.js for fuzzy searching
  const fuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: ['title', 'description', 'tags', 'categories', 'category'],
        threshold: 0.3,
      }),
    [projects]
  );

  // Filter projects based on search and category
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (searchQuery) {
      filtered = fuse.search(searchQuery).map((result) => result.item);
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => {
        // Check both categories array and single category for backward compatibility
        if (p.categories && p.categories.includes(selectedCategory)) {
          return true;
        }
        return p.category === selectedCategory;
      });
    }

    return filtered;
  }, [projects, searchQuery, selectedCategory, fuse]);

  // Get unique categories from all projects
  const categories = useMemo(() => {
    const cats = new Set<string>();
    projects.forEach((p) => {
      // Add categories from categories array
      if (p.categories && p.categories.length > 0) {
        p.categories.forEach((cat) => cats.add(cat));
      }
      // Also add single category for backward compatibility
      if (p.category) {
        cats.add(p.category);
      }
    });
    return Array.from(cats).sort();
  }, [projects]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="text-sm mb-2" style={{ color: 'var(--accent-secondary)' }}>Projects</div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm mb-3" style={{ color: 'var(--accent-secondary)' }}>Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search projects..."
            className="w-full p-3 focus:outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Category Filter */}
        <div>
          <div className="text-sm mb-3" style={{ color: 'var(--accent-secondary)' }}>Filter by category</div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-3 py-1 text-sm transition-opacity hover:opacity-70"
              style={{ color: selectedCategory === null ? 'var(--link-color)' : 'var(--text-muted)' }}
            >
              [all]
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-3 py-1 text-sm transition-opacity hover:opacity-70"
                style={{ color: selectedCategory === cat ? 'var(--link-color)' : 'var(--text-muted)' }}
              >
                [{cat}]
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>No results found</div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Try adjusting your search query or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={`/projects/${project.slug}`}
      className="block group"
    >
      {/* Project Image or Placeholder */}
      {project.featuredImage ? (
        <div className="mb-3 aspect-video overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <img
            src={project.featuredImage}
            alt={project.title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
          />
        </div>
      ) : (
        <div className="mb-3 aspect-video flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="text-6xl opacity-30" style={{ color: 'var(--text-muted)' }}>
            {project.modelFile ? '🔲' : '📁'}
          </div>
        </div>
      )}

      {/* Project Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm transition-opacity group-hover:opacity-70" style={{ color: 'var(--text-primary)' }}>
            {project.title}
          </h3>
          {project.categories && project.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              {project.categories.slice(0, 2).map((cat) => (
                <span key={cat}>[{cat}]</span>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {project.description}
        </p>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} style={{ color: 'var(--text-muted)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {project.modelFile && (
          <div className="text-xs" style={{ color: 'var(--accent-primary)' }}>
            3D model available
          </div>
        )}
      </div>
    </a>
  );
}
