import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ImageGallery } from '@/components/ImageGallery';
import { ProjectDetailsSection } from '@/components/ProjectDetailsSection';
import { getProjectBySlug, getAllProjects, Project } from '@/lib/pocketbase';
import ProjectDetailClient from '@/components/ProjectDetailClient';

// Generate metadata for each project
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

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
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Fetch all projects for navigation (could be optimized with pagination/related projects later)
  const allProjects = await getAllProjects();

  return <ProjectDetailClient project={project} allProjects={allProjects} />;
}
