import { getQualificationsByPerson, getServicesByPerson, getSkillsByPerson, type Qualification, type Service, type Skill } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const personSlug = locals.personSlug;

  let qualifications: Qualification[] = [];
  let services: Service[] = [];
  let skills: Skill[] = [];

  try {
    [qualifications, services, skills] = await Promise.all([
      getQualificationsByPerson(personSlug).catch(() => []),
      getServicesByPerson(personSlug).catch(() => []),
      getSkillsByPerson(personSlug).catch(() => []),
    ]);
  } catch (error) {
    console.error('Error loading about page data:', error);
  }

  return {
    qualifications,
    services,
    skills,
    personSlug,
  };
};
