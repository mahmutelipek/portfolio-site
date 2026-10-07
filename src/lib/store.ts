import type { Project } from './types';

export const globalStore = {
  homeVisited: false,
  homeProjects: [] as Project[],
  avatarUrl: null as string | null,
  projectsList: [] as { title: string; slug: string; sort_order: number }[],
  projectDetails: {} as Record<string, Project>,
};
