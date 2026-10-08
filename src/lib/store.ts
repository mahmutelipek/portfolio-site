import type { Project, Logo } from './types';

export const globalStore = {
  homeVisited: false,
  homeProjects: [] as Project[],
  logos: [] as Logo[],
  projectsList: [] as { title: string; slug: string; sort_order: number }[],
  projectDetails: {} as Record<string, Project>,
};
