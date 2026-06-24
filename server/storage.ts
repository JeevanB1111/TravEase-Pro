import { inquiries, type Inquiry, type InsertInquiry, type TravelCombo, type InsertTravelCombo, type AuditLog, type InsertAuditLog } from "@shared/schema";

export interface IStorage {
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  // Travel Combos
  getTravelCombos(): Promise<TravelCombo[]>;
  createTravelCombo(combo: InsertTravelCombo): Promise<TravelCombo>;
  deleteTravelCombo(id: number): Promise<void>;
  updateTravelCombo(id: number, combo: Partial<InsertTravelCombo>): Promise<TravelCombo>;
  // Audit Logs
  logAction(action: string, details: string): Promise<void>;
  getAuditLogs(): Promise<AuditLog[]>;
}

export class MemStorage implements IStorage {
  private inquiries: Map<number, Inquiry>;
  private currentId: number;
  private travelCombos: Map<number, TravelCombo>;
  private currentComboId: number;
  private auditLogs: Map<number, AuditLog>;
  private currentAuditId: number;

  constructor() {
    this.inquiries = new Map();
    this.currentId = 1;
    this.travelCombos = new Map();
    this.currentComboId = 1;
    this.auditLogs = new Map();
    this.currentAuditId = 1;

    // Seed initial data
    this.createTravelCombo({
      title: "Paris Getaway",
      description: "A romantic 3-day trip to Paris including Eiffel Tower tour and river cruise.",
      category: "Luxury",
      basePrice: "$1,200",
      inclusions: "Hotel, Breakfast, Tours",
      images: []
    });
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.currentId++;
    const inquiry: Inquiry = { ...insertInquiry, id, createdAt: new Date().toISOString() };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  // Travel Combos
  async getTravelCombos(): Promise<TravelCombo[]> {
    return Array.from(this.travelCombos.values());
  }

  async createTravelCombo(combo: InsertTravelCombo): Promise<TravelCombo> {
    const id = this.currentComboId++;
    const newCombo: TravelCombo = { ...combo, id, images: combo.images || [] };
    this.travelCombos.set(id, newCombo);
    await this.logAction("CREATE_COMBO", `Created combo: ${combo.title} (${combo.basePrice})`);
    return newCombo;
  }

  async updateTravelCombo(id: number, combo: Partial<InsertTravelCombo>): Promise<TravelCombo> {
    const existing = this.travelCombos.get(id);
    if (!existing) {
      throw new Error(`Combo with id ${id} not found`);
    }
    const updated = { ...existing, ...combo };
    this.travelCombos.set(id, updated);
    await this.logAction("UPDATE_COMBO", `Updated combo: ${existing.title}`);
    return updated;
  }

  async deleteTravelCombo(id: number): Promise<void> {
    const combo = this.travelCombos.get(id);
    this.travelCombos.delete(id);
    if (combo) {
      await this.logAction("DELETE_COMBO", `Deleted combo: ${combo.title}`);
    }
  }

  // Audit Logs
  async logAction(action: string, details: string): Promise<void> {
    const id = this.currentAuditId++;
    const log: AuditLog = {
      id,
      action,
      details,
      timestamp: new Date().toLocaleString()
    };
    this.auditLogs.set(id, log);
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).sort((a, b) => b.id - a.id);
  }
}

export const storage = new MemStorage();
