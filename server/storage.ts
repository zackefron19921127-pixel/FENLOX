import { type User, type InsertUser, type PhotoRestoration, type InsertPhotoRestoration, type ContactSubmission, type InsertContactSubmission } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPhotoRestoration(restoration: InsertPhotoRestoration): Promise<PhotoRestoration>;
  getPhotoRestoration(id: string): Promise<PhotoRestoration | undefined>;
  updatePhotoRestoration(id: string, updates: Partial<PhotoRestoration>): Promise<PhotoRestoration | undefined>;
  
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private photoRestorations: Map<string, PhotoRestoration>;
  private contactSubmissions: Map<string, ContactSubmission>;

  constructor() {
    this.users = new Map();
    this.photoRestorations = new Map();
    this.contactSubmissions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPhotoRestoration(insertRestoration: InsertPhotoRestoration): Promise<PhotoRestoration> {
    const id = randomUUID();
    const restoration: PhotoRestoration = {
      ...insertRestoration,
      id,
      status: "processing",
      createdAt: new Date(),
      restoredImageUrl: null,
      completedAt: null,
      errorMessage: null,
      options: insertRestoration.options as any || null,
    };
    this.photoRestorations.set(id, restoration);
    return restoration;
  }

  async getPhotoRestoration(id: string): Promise<PhotoRestoration | undefined> {
    return this.photoRestorations.get(id);
  }

  async updatePhotoRestoration(id: string, updates: Partial<PhotoRestoration>): Promise<PhotoRestoration | undefined> {
    const existing = this.photoRestorations.get(id);
    if (!existing) return undefined;
    
    const updated: PhotoRestoration = { ...existing, ...updates };
    this.photoRestorations.set(id, updated);
    return updated;
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const submission: ContactSubmission = {
      ...insertSubmission,
      id,
      createdAt: new Date(),
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }
}

export const storage = new MemStorage();
