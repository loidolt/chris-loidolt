import { useState, useMemo } from "react";
import { useLoaderData, Link } from "react-router";
import Fuse from "fuse.js";
import type { Route } from "./+types/projects";
import { Layout } from "../components/Layout";
import { getAllProjects, type Project } from "../services/airtable.server";

export async function loader({}: Route.LoaderArgs) {
  const projects = await getAllProjects();
  return { projects };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Projects - Chris Loidolt" },
    { name: "description", content: "Browse my design and engineering projects" },
  ];
}

export default function Projects() {
  const { projects } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Initialize Fuse.js for fuzzy searching
  const fuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: ["title", "description", "tags", "category"],
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
    <Layout>
      <div className="space-y-6">
        {/* Terminal Header */}
        <div className="border border-terminal-green p-4 bg-terminal-black">
          <pre className="text-terminal-green">
{`$ ls /projects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Found ${filteredProjects.length} project${filteredProjects.length === 1 ? '' : 's'}`}
          </pre>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          {/* Search */}
          <div className="border border-terminal-border p-4 bg-terminal-dark">
            <label className="block text-terminal-amber mb-2">$ search:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search projects..."
              className="w-full bg-terminal-black border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="border border-terminal-border p-4 bg-terminal-dark">
            <div className="text-terminal-amber mb-3">$ filter by category:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 border transition-colors ${
                  selectedCategory === null
                    ? "border-terminal-cyan text-terminal-cyan bg-terminal-black"
                    : "border-terminal-border text-terminal-text hover:border-terminal-cyan"
                }`}
              >
                [all]
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 border transition-colors ${
                    selectedCategory === cat
                      ? "border-terminal-cyan text-terminal-cyan bg-terminal-black"
                      : "border-terminal-border text-terminal-text hover:border-terminal-cyan"
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
          <div className="border border-terminal-border p-8 text-center bg-terminal-dark">
            <div className="text-terminal-amber mb-2">$ error: no results found</div>
            <p className="text-terminal-text">
              Try adjusting your search query or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="border border-terminal-border hover:border-terminal-cyan transition-colors bg-terminal-dark p-4 block group"
    >
      {/* Project Image or Placeholder */}
      {project.featuredImage ? (
        <div className="mb-4 aspect-video bg-terminal-black border border-terminal-border overflow-hidden">
          <img
            src={project.featuredImage}
            alt={project.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </div>
      ) : (
        <div className="mb-4 aspect-video bg-terminal-black border border-terminal-border flex items-center justify-center">
          <div className="text-terminal-gray text-6xl">
            {project.modelFile ? "🔲" : "📁"}
          </div>
        </div>
      )}

      {/* Project Info */}
      <div className="space-y-2">
        <h3 className="text-terminal-green group-hover:text-terminal-cyan transition-colors font-medium">
          {project.title}
        </h3>

        {project.category && (
          <div className="text-xs text-terminal-amber">[{project.category}]</div>
        )}

        <p className="text-sm text-terminal-text line-clamp-2">
          {project.description}
        </p>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-terminal-cyan">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {project.modelFile && (
          <div className="text-terminal-blue text-xs flex items-center gap-1">
            <span>🔲</span>
            <span>3D Model Available</span>
          </div>
        )}
      </div>
    </Link>
  );
}
