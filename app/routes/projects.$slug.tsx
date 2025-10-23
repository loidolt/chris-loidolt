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

  const { project } = data;
  return [
    { title: `${project.title} - Chris Loidolt` },
    { name: "description", content: project.description },
    { property: "og:title", content: `${project.title} - Chris Loidolt` },
    { property: "og:description", content: project.description },
    { property: "og:type", content: "article" },
    ...(project.featuredImage ? [{ property: "og:image", content: project.featuredImage }] : []),
    { name: "twitter:title", content: `${project.title} - Chris Loidolt` },
    { name: "twitter:description", content: project.description },
    ...(project.featuredImage ? [{ name: "twitter:image", content: project.featuredImage }] : []),
  ];
}

export default function ProjectDetail() {
  const { project } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 text-sm mb-4">
            <Link to="/projects" className="text-terminal-cyan hover:text-terminal-text-bright transition-colors">
              [← back]
            </Link>
            <span className="text-terminal-gray">$ cat project/{project.slug}</span>
          </div>
          <h1 className="text-2xl text-terminal-text mb-2">{project.title}</h1>
          {project.category && (
            <div className="text-sm text-terminal-gray">
              [{project.category}]
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: 3D Model or Image */}
          <div className="space-y-6">
            {project.modelFile ? (
              <ModelViewer
                modelPath={`/models/${project.modelFile}`}
                className="sticky top-4"
              />
            ) : project.featuredImage ? (
              <div className="bg-terminal-black">
                <img
                  src={project.featuredImage}
                  alt={project.title}
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="bg-terminal-black p-12 flex items-center justify-center aspect-square">
                <div className="text-terminal-gray text-6xl opacity-30">📁</div>
              </div>
            )}

            {/* Gallery */}
            {project.images && project.images.length > 0 && (
              <div>
                <div className="text-terminal-cyan text-sm mb-4">$ ls images/</div>
                <div className="grid grid-cols-2 gap-3">
                  {project.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${project.title} - ${idx + 1}`}
                      className="w-full h-auto hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="space-y-8">
            {/* Description */}
            <div>
              <div className="text-terminal-cyan text-sm mb-4">$ cat description.txt</div>
              <p className="text-terminal-text text-sm whitespace-pre-wrap leading-relaxed">
                {project.longDescription || project.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="border-t border-terminal-border pt-8">
              <div className="text-terminal-cyan text-sm mb-4">$ ls -la metadata/</div>
              <div className="space-y-3 text-sm">
                {project.date && (
                  <div className="flex items-start gap-4">
                    <span className="text-terminal-gray min-w-[80px]">date</span>
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
                  <div className="flex items-start gap-4">
                    <span className="text-terminal-gray min-w-[80px]">category</span>
                    <span className="text-terminal-text">{project.category}</span>
                  </div>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-start gap-4">
                    <span className="text-terminal-gray min-w-[80px]">tags</span>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-terminal-gray">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.modelFile && (
                  <div className="flex items-start gap-4">
                    <span className="text-terminal-gray min-w-[80px]">3d_model</span>
                    <span className="text-terminal-text">{project.modelFile}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            {(project.github || project.website) && (
              <div className="border-t border-terminal-border pt-8">
                <div className="text-terminal-cyan text-sm mb-4">$ cat links.txt</div>
                <div className="space-y-3 text-sm">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terminal-cyan hover:text-terminal-text-bright transition-colors block"
                    >
                      [View on GitHub →]
                    </a>
                  )}
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terminal-cyan hover:text-terminal-text-bright transition-colors block"
                    >
                      [Visit Website →]
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
