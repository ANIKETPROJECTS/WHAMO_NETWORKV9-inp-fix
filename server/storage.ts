import {
  projects,
  type InsertProject,
  type UpdateProjectRequest,
  type ProjectResponse
} from "@shared/schema";

export interface IStorage {
  getProjects(): Promise<ProjectResponse[]>;
  getProject(id: number): Promise<ProjectResponse | undefined>;
  createProject(project: InsertProject): Promise<ProjectResponse>;
  updateProject(id: number, updates: UpdateProjectRequest): Promise<ProjectResponse>;
  deleteProject(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, ProjectResponse>;
  private currentId: number;

  constructor() {
    this.projects = new Map();
    this.currentId = 1;
  }

  async getProjects(): Promise<ProjectResponse[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<ProjectResponse | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<ProjectResponse> {
    const id = this.currentId++;
    const project: ProjectResponse = {
      ...insertProject,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: UpdateProjectRequest): Promise<ProjectResponse> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error(`Project with id ${id} not found`);
    }
    const updated = { ...existing, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
  }
}

export const storage = new MemStorage();
