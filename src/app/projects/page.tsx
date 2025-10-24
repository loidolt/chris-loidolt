import { Metadata } from 'next';
import ProjectsGrid from '@/components/ProjectsGrid';
import { getAllProjects } from '@/lib/airtable';

export const metadata: Metadata = {
  title: 'Projects - Chris Loidolt',
  description: 'Browse design and engineering projects in 3D printing, woodworking, and software development.',
};

export default async function ProjectsPage() {
  // Fetch projects at build/request time
  let projects: any[] = [];
  try {
    projects = await getAllProjects();
  } catch (error) {
    console.error('Error loading projects:', error);
  }

  return <ProjectsGrid projects={projects} />;
}
