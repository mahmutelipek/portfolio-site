import type { Project, Contributions } from './types';

export const globalStore = {
  homeVisited: false,
  homeProjects: [] as Project[],
  avatarUrl: null as string | null,
  githubContributions: null as Contributions | null,
  projectsList: [] as { title: string; slug: string; sort_order: number }[],
  projectDetails: {} as Record<string, Project>,
};
