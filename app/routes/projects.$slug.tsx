import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/projects.$slug";
import { Layout } from "../components/Layout";
import { ModelViewer } from "../components/ModelViewer";
import { getProjectBySlug } from "../services/airtable.server";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const project = await getProjectBySlug(params.slug);

    if (!project) {
      throw new Response("Project not found", { status: 404 });
    }

    return { project };
  } catch (error) {
    console.error("Error loading project:", error);
    throw new Response("Project not found", { status: 404 });
  }
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.project) {
    return [{ title: "Project Not Found" }];
  }

  return [
    { title: `${data.project.title} - Chris Loidolt` },
    { name: "description", content: data.project.description },
  ];
}

export default function ProjectDetail() {
  const { project } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Terminal Header */}
        <div className="border border-terminal-green p-4 bg-terminal-black">
          <div className="flex items-center gap-2 text-terminal-green mb-2">
            <Link to="/projects" className="text-terminal-cyan hover:text-terminal-text-bright">
              [← back]
            </Link>
            <span className="text-terminal-border">|</span>
            <span>$ cat project/{project.slug}</span>
          </div>
          <h1 className="text-2xl text-terminal-text-bright">{project.title}</h1>
          {project.category && (
            <div className="text-sm text-terminal-amber mt-2">
              [{project.category}]
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: 3D Model or Image */}
          <div className="space-y-4">
            {project.modelFile ? (
              <ModelViewer
                modelPath={`/models/${project.modelFile}`}
                className="sticky top-4"
              />
            ) : project.featuredImage ? (
              <div className="border border-terminal-border bg-terminal-black">
                <div className="border-b border-terminal-border p-2 bg-terminal-dark">
                  <span className="text-terminal-text text-xs">Featured Image</span>
                </div>
                <img
                  src={project.featuredImage}
                  alt={project.title}
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="border border-terminal-border bg-terminal-black p-12 flex items-center justify-center aspect-square">
                <div className="text-terminal-gray text-6xl">📁</div>
              </div>
            )}

            {/* Gallery */}
            {project.images && project.images.length > 0 && (
              <div className="border border-terminal-border bg-terminal-dark p-4">
                <div className="text-terminal-amber mb-3">$ ls images/</div>
                <div className="grid grid-cols-2 gap-2">
                  {project.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${project.title} - ${idx + 1}`}
                      className="w-full h-auto border border-terminal-border hover:border-terminal-cyan transition-colors cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="space-y-4">
            {/* Description */}
            <div className="border border-terminal-border bg-terminal-dark p-6">
              <div className="text-terminal-amber mb-4">$ cat description.txt</div>
              <p className="text-terminal-text whitespace-pre-wrap">
                {project.longDescription || project.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="border border-terminal-border bg-terminal-dark p-6">
              <div className="text-terminal-amber mb-4">$ ls -la metadata/</div>
              <div className="space-y-3 text-sm">
                {project.date && (
                  <div className="flex items-start gap-3">
                    <span className="text-terminal-cyan min-w-[80px]">date:</span>
                    <span className="text-terminal-text">
                      {new Date(project.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {project.category && (
                  <div className="flex items-start gap-3">
                    <span className="text-terminal-cyan min-w-[80px]">category:</span>
                    <span className="text-terminal-text">{project.category}</span>
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-terminal-cyan min-w-[80px]">tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-terminal-green">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.modelFile && (
                  <div className="flex items-start gap-3">
                    <span className="text-terminal-cyan min-w-[80px]">3d_model:</span>
                    <span className="text-terminal-text">{project.modelFile}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            {(project.github || project.website) && (
              <div className="border border-terminal-border bg-terminal-dark p-6">
                <div className="text-terminal-amber mb-4">$ cat links.txt</div>
                <div className="space-y-2">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-terminal-cyan hover:text-terminal-text-bright transition-colors"
                    >
                      <span>→</span>
                      <span>[View on GitHub]</span>
                    </a>
                  )}
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-terminal-cyan hover:text-terminal-text-bright transition-colors"
                    >
                      <span>→</span>
                      <span>[Visit Website]</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
