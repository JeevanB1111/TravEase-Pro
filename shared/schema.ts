import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  role: text("role").notNull(), // 'traveler' or 'agency'
  createdAt: text("created_at").notNull(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true
});


export const travelCombos = pgTable("travel_combos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  basePrice: text("base_price").notNull(),
  inclusions: text("inclusions").notNull(),
  images: text("images").array(), // Array of Base64 strings
});

export const insertTravelComboSchema = createInsertSchema(travelCombos).omit({
  id: true
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

export type TravelCombo = typeof travelCombos.$inferSelect;
export type InsertTravelCombo = z.infer<typeof insertTravelComboSchema>;
