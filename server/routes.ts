import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { AgentService } from "./agent";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Basic API route for inquiries (even if UI doesn't fully use it yet)
  app.post(api.inquiries.create.path, async (req, res) => {
    try {
      const input = api.inquiries.create.input.parse(req.body);
      const inquiry = await storage.createInquiry(input);
      res.status(201).json(inquiry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Travel Combos API
  app.get("/api/combos", async (_req, res) => {
    const combos = await storage.getTravelCombos();
    res.json(combos);
  });

  app.post("/api/combos", async (req, res) => {
    try {
      // Basic validation (can improve with Zod schema from shared)
      const combo = await storage.createTravelCombo(req.body);
      res.status(201).json(combo);
    } catch (err) {
      res.status(400).json({ message: "Invalid combo data" });
    }
  });

  app.patch("/api/combos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    try {
      const updated = await storage.updateTravelCombo(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(404).json({ message: "Combo not found or update failed" });
    }
  });

  app.delete("/api/combos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    await storage.deleteTravelCombo(id);
    res.sendStatus(204);
  });

  // Audit Logs API
  app.get("/api/audit-logs", async (_req, res) => {
    const logs = await storage.getAuditLogs();
    res.json(logs);
  });

  // AI Agent Command API
  app.post("/api/agent/command", async (req, res) => {
    try {
      const { command, sessionId } = req.body;
      if (!command) return res.status(400).json({ message: "Command is required" });

      // Use provided sessionId or default to 'agency-admin' for now
      const session = sessionId || 'agency-admin';

      const response = await AgentService.processAgencyCommand(session, command);
      res.json(response);
    } catch (err) {
      console.error("Agent Error:", err);
      res.status(500).json({ message: "Internal Agent Error" });
    }
  });

  // Simulated OCR / Form Upload
  app.post("/api/agent/upload-form", async (req, res) => {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a mock "scanned" combo
      const newCombo = await storage.createTravelCombo({
        title: "Handwritten Safari Special",
        description: "An adventurous 5-day Safari package featuring wild game drives, local guides, and comfortable rustic lodge stays.",
        category: "Adventure",
        basePrice: "$1,850",
        inclusions: "Jeep, Guide, Meals"
      });

      res.json({
        success: true,
        message: `📄 Scan Complete! I've recognized the handwriting and created the combo: "${newCombo.title}".`
      });

    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to process form." });
    }
  });

  // Chatbot / Agent API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, userId } = req.body;
      if (!message) return res.status(400).json({ message: "Message is required" });

      // Simulate network latency for realism (optional)
      // await new Promise(r => setTimeout(r, 800));

      const response = await AgentService.processMessage(userId || 'guest', message);
      res.json(response);
    } catch (err) {
      console.error("Chat Agent Error:", err);
      res.status(500).json({ message: "I'm having trouble processing that thought right now." });
    }
  });

  return httpServer;
}
