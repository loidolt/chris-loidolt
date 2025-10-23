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
        keys: ['title', 'description', 'tags', 'category'],
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
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    return filtered;
  }, [projects, searchQuery, selectedCategory, fuse]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [projects]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="text-terminal-cyan text-sm mb-2">$ ls /projects</div>
        <div className="text-terminal-gray text-sm">
          Found {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-terminal-cyan text-sm mb-3">$ search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search projects..."
            className="w-full bg-terminal-darker border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div>
          <div className="text-terminal-cyan text-sm mb-3">$ filter</div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 text-sm transition-colors ${
                selectedCategory === null
                  ? 'text-terminal-cyan'
                  : 'text-terminal-gray hover:text-terminal-text'
              }`}
            >
              [all]
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'text-terminal-cyan'
                    : 'text-terminal-gray hover:text-terminal-text'
                }`}
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
          <div className="text-terminal-gray text-sm mb-2">No results found</div>
          <p className="text-terminal-gray text-sm">
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
        <div className="mb-3 aspect-video bg-terminal-black overflow-hidden">
          <img
            src={project.featuredImage}
            alt={project.title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
          />
        </div>
      ) : (
        <div className="mb-3 aspect-video bg-terminal-black flex items-center justify-center">
          <div className="text-terminal-gray text-6xl opacity-30">
            {project.modelFile ? '🔲' : '📁'}
          </div>
        </div>
      )}

      {/* Project Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-terminal-text group-hover:text-terminal-cyan transition-colors text-sm">
            {project.title}
          </h3>
          {project.category && (
            <div className="text-xs text-terminal-gray whitespace-nowrap">[{project.category}]</div>
          )}
        </div>

        <p className="text-sm text-terminal-gray line-clamp-2">
          {project.description}
        </p>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-terminal-gray">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {project.modelFile && (
          <div className="text-terminal-cyan text-xs">
            3D model available
          </div>
        )}
      </div>
    </a>
  );
}
