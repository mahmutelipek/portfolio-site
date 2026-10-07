import type { Project } from './types';

export const globalStore = {
  homeVisited: false,
  homeProjects: [] as Project[],
  projectsList: [] as { title: string; slug: string; sort_order: number }[],
  projectDetails: {} as Record<string, Project>,
};
