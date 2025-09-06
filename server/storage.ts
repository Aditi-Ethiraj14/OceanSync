import { type User, type InsertUser, type HazardReport, type InsertHazardReport } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createHazardReport(report: InsertHazardReport & { userId: string }): Promise<HazardReport>;
  getHazardReports(): Promise<HazardReport[]>;
  getHazardReportsByUser(userId: string): Promise<HazardReport[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private hazardReports: Map<string, HazardReport>;

  constructor() {
    this.users = new Map();
    this.hazardReports = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createHazardReport(report: InsertHazardReport & { userId: string }): Promise<HazardReport> {
    const id = randomUUID();
    const hazardReport: HazardReport = {
      ...report,
      id,
      createdAt: new Date()
    };
    this.hazardReports.set(id, hazardReport);
    return hazardReport;
  }

  async getHazardReports(): Promise<HazardReport[]> {
    return Array.from(this.hazardReports.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getHazardReportsByUser(userId: string): Promise<HazardReport[]> {
    return Array.from(this.hazardReports.values())
      .filter(report => report.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
}

export const storage = new MemStorage();
