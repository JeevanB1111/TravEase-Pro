import { storage } from "./storage";
import { GoogleGenerativeAI, Part, SchemaType } from "@google/generative-ai";

// Lazy Init Variables
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

function getGeminiModel() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "dummy-key") {
            console.error("CRITICAL: GEMINI_API_KEY is missing or invalid at time of init:", apiKey);
        } else {
            console.log("Gemini Client Initialized. Key ends in:", apiKey.slice(-4));
        }
        genAI = new GoogleGenerativeAI(apiKey || "dummy-key");
    }

    if (!model) {
        // Use gemini-1.5-flash for stability
        model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            tools: [{
                functionDeclarations: [
                    {
                        name: "create_combo",
                        description: "Create a new travel package/combo",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                title: { type: SchemaType.STRING, description: "Title of the trip, e.g. 'Bali Blast'" },
                                price: { type: SchemaType.STRING, description: "Price including currency, e.g. '$500'" },
                                category: { type: SchemaType.STRING, description: "Category/Tag, e.g. 'Beach', 'Adventure'" },
                                description: { type: SchemaType.STRING, description: "Short description of the trip" },
                                inclusions: { type: SchemaType.STRING, description: "Optional list of inclusions, e.g. 'Hotel, Flights'" }
                            },
                            required: ["title", "price", "category"]
                        }
                    },
                    {
                        name: "delete_combo",
                        description: "Delete a travel combo by ID",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                id: { type: SchemaType.NUMBER, description: "The numeric ID of the combo to delete" }
                            },
                            required: ["id"]
                        }
                    },
                    {
                        name: "update_combo",
                        description: "Update an existing travel combo/package by ID. If any of the optional fields (title, price, category, description, inclusions) are not provided or if the user request is vague, you should ask the user for them.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                id: { type: SchemaType.NUMBER, description: "The numeric ID of the combo to update" },
                                title: { type: SchemaType.STRING, description: "New title for the package (optional)" },
                                price: { type: SchemaType.STRING, description: "New price including currency, e.g. '$1,200' (optional)" },
                                category: { type: SchemaType.STRING, description: "New category/tag, e.g. 'Beach' (optional)" },
                                description: { type: SchemaType.STRING, description: "New short description of the trip (optional)" },
                                inclusions: { type: SchemaType.STRING, description: "New inclusions, e.g. 'Hotel, Flight' (optional)" }
                            },
                            required: ["id"]
                        }
                    },
                    {
                        name: "get_audit_logs",
                        description: "Retrieve recent audit logs",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {}
                        }
                    }
                ]
            }]
        });
    }
    return model;
}

interface AgentResponse {
    message: string;
    thoughts: string[];
    action?: {
        type: 'SHOW_COMBO' | 'UPDATE_DESTINATION' | 'TRIGGER_BOOKING' | 'NONE';
        data?: any;
    };
}

interface AgencyCommandResponse {
    message: string;
    actionPerformed?: string;
    data?: any;
    mode: 'LLM' | 'FALLBACK';
}

// Conversation States
type ConnectionState = 'IDLE' | 'PLANNING_TRIP' | 'BOOKING_FLOW' | 'SUPPORT';

interface UserContext {
    userId: string;
    state: ConnectionState;
    memory: {
        destination?: string;
        budget?: string;
        travelers?: number;
        lastComboId?: number;
        userName?: string;
    };
}

interface AgencyContext {
    sessionId: string;
    // Gemini History Format matches: { role: 'user' | 'model', parts: Part[] }
    history: { role: "user" | "model", parts: Part[] }[];
    state?: 'IDLE' | 'AWAITING_UPDATE_FIELDS';
    pendingUpdateId?: number;
}

export class AgentService {
    private static userSessions = new Map<string, UserContext>();
    private static agencySessions = new Map<string, AgencyContext>();

    // Agency Operations Handling
    static async processAgencyCommand(sessionId: string, command: string): Promise<AgencyCommandResponse> {
        // 1. Try Gemini if API Key exists
        if (process.env.GEMINI_API_KEY) {
            try {
                return await this.processWithLLM(sessionId, command);
            } catch (error) {
                console.error("Gemini Error, falling back to heuristic:", error);
                // Fallthrough to fallback
            }
        }

        // 2. Fallback Heuristic
        return await this.processWithHeuristic(sessionId, command);
    }

    private static getAgencyContext(sessionId: string): AgencyContext {
        if (!this.agencySessions.has(sessionId)) {
            this.agencySessions.set(sessionId, {
                sessionId,
                history: [
                    {
                        role: "user",
                        parts: [{
                            text: `You are an intelligent Agency Operations Manager AI for TravEase. 
Your goal is to assist agency staff in managing travel packages (combos), analyzing data, and performing operational tasks.

Capabilities:
1. **Manage Combos**: Create, delete, or update travel packages.
2. **Update Combos**: If the user wants to update/edit/change a travel combo, you must ask them for the updates of these specific things: Title, Description, Category, Base Price, and Inclusions.
3. **Analyze**: Provide insights from audit logs or booking data (if available).
4. **Reasoning**: You should think step-by-step. If a user request is vague (e.g., "Create a trip" or "Update combo"), ask for specific details before calling tools.
5. **Style**: Be professional, concise, and helpful. You are a partner, not just a command line.

If the user's request is a greeting or general question, answer naturally without calling tools.` }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. I am ready to assist you with agency operations, combo management, and data analysis." }]
                    }
                ]
            });
        }
        return this.agencySessions.get(sessionId)!;
    }

    private static async processWithLLM(sessionId: string, command: string): Promise<AgencyCommandResponse> {
        const ctx = this.getAgencyContext(sessionId);
        const model = getGeminiModel();

        // Start Chat with existing history
        const chat = model.startChat({
            history: ctx.history
        });

        // Send Message
        const result = await chat.sendMessage(command);
        const response = result.response;
        // Text might be missing if it's purely a function call, so be careful
        const text = response.text ? response.text() : "";
        const functionCalls = response.functionCalls();

        // Manual Logic to sync history for next request:
        ctx.history.push({ role: "user", parts: [{ text: command }] });

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0]; // Handle primary function call
            const name = call.name;
            const args = call.args as any;

            let toolResult: any; // The actual object/response from the tool
            let actionType = "NONE";
            let actionData = null;
            let outputText = "";

            if (name === "create_combo") {
                const title = args.title;
                const category = args.category;
                const description = args.description || AgentService.generateRealisticDescription(title, category);
                const inclusions = args.inclusions || AgentService.getRealisticInclusions(category);

                const newCombo = await storage.createTravelCombo({
                    title,
                    basePrice: args.price,
                    category,
                    description,
                    inclusions
                });
                outputText = `Successfully created combo ID ${newCombo.id}: ${newCombo.title} ($${newCombo.basePrice})`;
                toolResult = { result: outputText }; // Gemini expects object
                actionType = 'CREATE_COMBO';
                actionData = newCombo;
            } else if (name === "delete_combo") {
                const id = Number(args.id);
                await storage.deleteTravelCombo(id);
                outputText = `Successfully deleted combo with ID ${id}`;
                toolResult = { result: outputText };
                actionType = 'DELETE_COMBO';
            } else if (name === "update_combo") {
                const id = Number(args.id);
                const updates: any = {};
                if (args.title) updates.title = args.title;
                if (args.price) updates.basePrice = args.price;
                if (args.category) updates.category = args.category;
                if (args.description) updates.description = args.description;
                if (args.inclusions) updates.inclusions = args.inclusions;

                const updatedCombo = await storage.updateTravelCombo(id, updates);
                outputText = `Successfully updated combo ID ${id}: ${updatedCombo.title}`;
                toolResult = { result: outputText };
                actionType = 'UPDATE_COMBO';
                actionData = updatedCombo;
            } else if (name === "get_audit_logs") {
                const logs = await storage.getAuditLogs();
                const logText = logs.slice(0, 3).map(l => `- ${l.action}: ${l.details}`).join("\n");
                outputText = `Recent Logs:\n${logText}`;
                toolResult = { logs: logText };
                actionType = 'GET_LOGS';
            }

            // Send Function Response back to model to get final text
            const result2 = await chat.sendMessage([
                {
                    functionResponse: {
                        name: name,
                        response: toolResult
                    }
                }
            ]);

            const finalResponseText = result2.response.text();

            // Update History (Model Call + Function Response + Model Final Response)
            ctx.history.push({ role: "model", parts: response.candidates![0].content.parts });
            ctx.history.push({
                role: "user",
                parts: [{
                    functionResponse: {
                        name: name,
                        response: toolResult
                    }
                }]
            });
            ctx.history.push({ role: "model", parts: [{ text: finalResponseText }] });

            return {
                message: finalResponseText,
                actionPerformed: actionType,
                data: actionData,
                mode: 'LLM'
            };
        }

        // No tool called, just text
        ctx.history.push({ role: "model", parts: [{ text: text }] });
        return {
            message: text,
            mode: 'LLM'
        };
    }

    private static async processWithHeuristic(sessionId: string, command: string): Promise<AgencyCommandResponse> {
        console.log(`[Agent Heuristic] Processing: "${command}"`);
        const ctx = this.getAgencyContext(sessionId);
        const lowerCmd = command.toLowerCase();

        // Check if we are currently awaiting update fields for a combo
        if (ctx.state === 'AWAITING_UPDATE_FIELDS' && ctx.pendingUpdateId) {
            const id = ctx.pendingUpdateId;
            if (lowerCmd === 'cancel' || lowerCmd === 'abort' || lowerCmd === 'stop') {
                ctx.state = 'IDLE';
                ctx.pendingUpdateId = undefined;
                return {
                    message: "Update cancelled. Let me know if you need anything else! 🗑️",
                    mode: 'FALLBACK'
                };
            }

            try {
                // Parse the fields from user response
                const updates: any = {};

                // Structured formats: "Title: New Title", "Price: $1000", etc.
                const titleMatch = command.match(/(?:title|name)\s*:\s*([^\n\r]+)/i) || command.match(/(?:title|name)\s+(?:to|is)\s+["']?([^"'\r\n,]+)["']?/i);
                const descMatch = command.match(/(?:description|desc)\s*:\s*([^\n\r]+)/i) || command.match(/(?:description|desc)\s+(?:to|is)\s+["']?([^"'\r\n]+)["']?/i);
                const catMatch = command.match(/(?:category|type)\s*:\s*([^\n\r]+)/i) || command.match(/(?:category|type)\s+(?:to|is)\s+(\w+)/i);
                const priceMatch = command.match(/(?:base price|price|cost)\s*:\s*([^\n\r]+)/i) || command.match(/(?:base price|price|cost)\s+(?:to|is)\s+(\$?[0-9,]+)/i);
                const incMatch = command.match(/(?:inclusions|includes)\s*:\s*([^\n\r]+)/i) || command.match(/(?:inclusions|includes|inclusion)\s+(?:to|is)\s+["']?([^"'\r\n]+)["']?/i);

                if (titleMatch) updates.title = titleMatch[1].trim();
                if (descMatch) updates.description = descMatch[1].trim();
                if (catMatch) updates.category = catMatch[1].trim();
                if (priceMatch) updates.basePrice = priceMatch[1].trim();
                if (incMatch) updates.inclusions = incMatch[1].trim();

                // If nothing was parsed in key-value structure, try matching loose updates or ask for formatting
                if (Object.keys(updates).length === 0) {
                    return {
                        message: `I couldn't detect any fields to update. Please provide updates in a format like:\n- Title: New Title\n- Description: New Description\n- Category: New Category\n- Base Price: $1200\n- Inclusions: Hotel, Flight\n\nOr type 'cancel' to abort.`,
                        mode: 'FALLBACK'
                    };
                }

                const updatedCombo = await storage.updateTravelCombo(id, updates);

                // Reset state
                ctx.state = 'IDLE';
                ctx.pendingUpdateId = undefined;

                return {
                    message: `Successfully updated **Combo #${id}** (${updatedCombo.title})! Details have been saved. ✨`,
                    actionPerformed: 'UPDATE_COMBO',
                    data: updatedCombo,
                    mode: 'FALLBACK'
                };
            } catch (err: any) {
                ctx.state = 'IDLE';
                ctx.pendingUpdateId = undefined;
                return {
                    message: `Error updating combo: ${err.message || 'Unknown error'}.`,
                    mode: 'FALLBACK'
                };
            }
        }

        // --- Intent Detection ---
        const isCreate = lowerCmd.includes("create") || lowerCmd.includes("add") || lowerCmd.includes("new") || lowerCmd.includes("make");
        const isDelete = lowerCmd.includes("delete") || lowerCmd.includes("remove") || lowerCmd.includes("cancel") || lowerCmd.includes("trash");
        const isLog = lowerCmd.includes("log") || lowerCmd.includes("history") || lowerCmd.includes("audit") || lowerCmd.includes("recent");
        const isUpdate = lowerCmd.includes("update") || lowerCmd.includes("edit") || lowerCmd.includes("change") || lowerCmd.includes("modify");

        // --- CHAT / IDLE Fallback ---
        if (lowerCmd.match(/^(hi|hello|hey|greetings|who are you|help|what can you do)/)) {
            return {
                message: "Hello! I'm your Agency AI Partner (Gemini Powered). I can help you manage packages. Try saying 'Create a new summer trip to Italy for $1500', 'Update package 1', or 'Show me the logs'.",
                mode: 'FALLBACK'
            };
        }

        // --- CREATE Logic ---
        if (isCreate) {
            console.log("[Agent Heuristic] Intent identified: CREATE");
            const priceMatch = command.match(/(\$|€|£|¥)?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s?(?:dollars|usd|eur|gbp)?/i);
            const price = priceMatch ? (priceMatch[1] || "$") + priceMatch[2] : "$999";

            let category = "General";
            const knownCategories = ["beach", "adventure", "city", "luxury", "budget", "family", "romantic", "safari"];
            const catExplicit = lowerCmd.match(/(?:category|type|style|theme)\s+["']?(\w+)["']?/);
            if (catExplicit) {
                category = catExplicit[1];
                category = category.charAt(0).toUpperCase() + category.slice(1);
            } else {
                const foundCat = knownCategories.find(c => lowerCmd.includes(c));
                if (foundCat) category = foundCat.charAt(0).toUpperCase() + foundCat.slice(1);
            }

            let title = `Custom ${category} Package`;
            const quoteMatch = command.match(/["']([^"']+)["']/);
            if (quoteMatch) {
                title = quoteMatch[1];
            } else {
                const tripTo = command.match(/(?:trip|travel|journey|vacation|combo|package)\s+(?:to|for|in)\s+([a-zA-Z\s]+?)(?:\s+(?:for|at|cost|with|category|$))/i);
                if (tripTo) {
                    title = tripTo[1].trim();
                    if (!title.toLowerCase().includes("trip") && !title.toLowerCase().includes("package")) title += " Trip";
                } else {
                    const looseMatch = command.match(/(?:create|add|new)\s+([a-zA-Z0-9\s]+?)\s+(?:for|at|cost|with|$)/i);
                    if (looseMatch && looseMatch[1].trim().length > 3) title = looseMatch[1].trim().replace(/^(a|an|the)\s+/i, '');
                }
            }
            title = title.replace(/\b\w/g, c => c.toUpperCase());

            const newCombo = await storage.createTravelCombo({
                title,
                basePrice: price,
                category,
                description: AgentService.generateRealisticDescription(title, category),
                inclusions: AgentService.getRealisticInclusions(category)
            });

            return {
                message: `I've created the **${title}** package for **${price}** (${category}). Ready to book! ✈️`,
                actionPerformed: 'CREATE_COMBO',
                data: newCombo,
                mode: 'FALLBACK'
            };
        }

        // --- UPDATE Intent ---
        if (isUpdate) {
            const idMatch = command.match(/(\d+)/);
            if (idMatch) {
                const id = parseInt(idMatch[1]);
                try {
                    const allCombos = await storage.getTravelCombos();
                    const combo = allCombos.find(c => c.id === id);
                    if (!combo) {
                        return {
                            message: `I couldn't find a travel combo with ID #${id}. Please check the ID and try again.`,
                            mode: 'FALLBACK'
                        };
                    }

                    // Set state to await updates
                    ctx.state = 'AWAITING_UPDATE_FIELDS';
                    ctx.pendingUpdateId = id;

                    return {
                        message: `Sure, I can help you update **Combo #${id}** (${combo.title}). Please provide the updates for these fields:\n- **Title**\n- **Description**\n- **Category**\n- **Base Price**\n- **Inclusions**\n\nYou can specify them like:\n- Title: New Title\n- Base Price: $1,200\n\n(Type 'cancel' to abort)`,
                        mode: 'FALLBACK'
                    };
                } catch (err) {
                    return {
                        message: `I ran into an error looking up combo #${id}.`,
                        mode: 'FALLBACK'
                    };
                }
            } else {
                return {
                    message: "I can update a package for you, but I need to know the package ID. Try saying 'Update package 1' or 'Edit combo 3'.",
                    mode: 'FALLBACK'
                };
            }
        }

        // --- DELETE Logic ---
        if (isDelete) {
            const idMatch = command.match(/(\d+)/);
            if (idMatch) {
                const id = parseInt(idMatch[1]);
                await storage.deleteTravelCombo(id);
                return {
                    message: `Done! Travel Combo #${id} has been removed from the catalog. 🗑️`,
                    actionPerformed: 'DELETE_COMBO',
                    mode: 'FALLBACK'
                };
            } else {
                return {
                    message: "I can delete a combo for you, but I need to know which one. Try 'Delete #1' or 'Remove combo 5'.",
                    mode: 'FALLBACK'
                };
            }
        }

        // --- GET LOGS Logic ---
        if (isLog) {
            const logs = await storage.getAuditLogs();
            const text = logs.slice(0, 3).map(l => `- ${l.action}: ${l.details}`).join("\n");
            return {
                message: `Here are the latest operational updates:\n${text}`,
                actionPerformed: 'GET_LOGS',
                mode: 'FALLBACK'
            };
        }

        console.log("[Agent Heuristic] No intent identified.");
        return {
            message: "I'm your intelligent assistant. I can help you **create packages**, **update packages**, **remove items**, or **check logs**. Try saying: 'Create a luxury trip to Paris for $2000' or 'Update package 1'.",
            mode: 'FALLBACK'
        };
    }


    // --- Traveler Agent Logic (Gemini Powered) ---

    private static getTravelerContext(userId: string): AgencyContext {
        const travelerSessionId = `traveler-${userId}`;
        if (!this.agencySessions.has(travelerSessionId)) {
            this.agencySessions.set(travelerSessionId, {
                sessionId: travelerSessionId,
                history: [
                    {
                        role: "user",
                        parts: [{
                            text: `You are a world-class Travel Agent for TravEase. 
Your goal is to help travelers find their dream vacation from our available packages.

**Your Data**:
You have access to a database of 'Travel Combos' (Packages) which include flights, hotels, and tours.

**Capabilities**:
1. **Search**: When a user asks for a trip (e.g., "beach trip", "Paris"), use 'search_combos' to find options.
2. **Details**: If they ask about a specific one, tell them about it.
3. **Booking**: If they want to book, encourage them to "Click the Book Now button" (or use 'trigger_booking' if you want to pop up the wizard).

**Personality**:
- Enthusiastic, warm, and emoji-friendly! 🌍✈️
- Keep responses short (under 3 sentences) unless describing a trip.
- If you find no results, suggest vaguely similar popular places (Bali, Paris, Tokyo).` }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Bonjour! 🌍 I am ready to help you plan the adventure of a lifetime! Where are we going today?" }]
                    }
                ]
            });
        }
        return this.agencySessions.get(travelerSessionId)!;
    }

    static async processMessage(userId: string, message: string): Promise<AgentResponse> {
        // Init context
        const ctx = this.getTravelerContext(userId);

        const travelerTools = [{
            functionDeclarations: [
                {
                    name: "search_combos",
                    description: "Search for travel packages/combos based on keywords or destination",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            query: { type: SchemaType.STRING, description: "Destination, category, or keyword (e.g., 'Paris', 'Beach')" }
                        },
                        required: ["query"]
                    }
                }
            ]
        }];

        try {
            // Lazy init genAI if needed
            if (!genAI) {
                getGeminiModel();
            }
            if (!genAI) throw new Error("Failed to initialize Gemini Client");

            // Get Model with Tools
            // We create a fresh model instance for traveler to support specific tools
            const travelerModel = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                tools: travelerTools as any
            });

            const chat = travelerModel.startChat({ history: ctx.history });

            const result = await chat.sendMessage(message);
            const response = result.response;
            const text = response.text ? response.text() : "";
            const functionCalls = response.functionCalls();

            ctx.history.push({ role: "user", parts: [{ text: message }] });

            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                const name = call.name;
                const args = call.args as any;

                console.log(`[Traveler Agent] Calling tool: ${name}`);

                let toolResult: any;
                let actionType: any = "NONE";
                let actionData = null;

                if (name === "search_combos") {
                    const query = (args.query as string).toLowerCase();
                    const allCombos = await storage.getTravelCombos();

                    // Fuzzy match
                    const matches = allCombos.filter(c =>
                        c.title.toLowerCase().includes(query) ||
                        c.category.toLowerCase().includes(query) ||
                        c.description.toLowerCase().includes(query)
                    );

                    if (matches.length > 0) {
                        const match = matches[0]; // Just take the best one for now
                        const summary = matches.map(m => `- ${m.title} (${m.basePrice})`).join("\n");

                        toolResult = {
                            found: true,
                            count: matches.length,
                            top_match: match,
                            summary: summary
                        };

                        // We can trigger the UI to show this combo
                        actionType = 'SHOW_COMBO';
                        actionData = match;
                    } else {
                        toolResult = { found: false, message: "No exact matches found." };
                    }
                }

                // Send Result back
                const result2 = await chat.sendMessage([
                    {
                        functionResponse: {
                            name: name,
                            response: toolResult
                        }
                    }
                ]);
                const finalResponseText = result2.response.text();

                // Sync History
                ctx.history.push({ role: "model", parts: response.candidates![0].content.parts });
                ctx.history.push({
                    role: "user",
                    parts: [{ functionResponse: { name: name, response: toolResult } }]
                });
                ctx.history.push({ role: "model", parts: [{ text: finalResponseText }] });

                return {
                    message: finalResponseText,
                    thoughts: ["Agent used tool: " + name],
                    action: {
                        type: actionType,
                        data: actionData
                    }
                };
            }

            // Normal text response
            ctx.history.push({ role: "model", parts: [{ text: text }] });
            return {
                message: text,
                thoughts: ["Agent replied directly"],
                action: { type: 'NONE' }
            };

        } catch (error: any) {
            console.error("Gemini Traveler Error Full:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

            // --- Fallback Heuristic for Traveler ---
            const lowerMsg = message.toLowerCase();

            // 1. Check for Greeting
            if (lowerMsg.match(/\b(hi|hello|hey|yo|greetings)\b/)) {
                return {
                    message: "Hello! 🌍 I'm your Travel Agent. I'm operating in 'Offline Mode' right now (API connection issue), but I can still help you find trips! Try saying 'Search for Bali' or 'Find beach trips'.",
                    thoughts: ["Fallback: Greeting"],
                    action: { type: 'NONE' }
                };
            }

            // 2. Search Fallback
            if (lowerMsg.includes("search") || lowerMsg.includes("find") || lowerMsg.includes("trip") || lowerMsg.includes("combo") || lowerMsg.includes("go to")) {
                const allCombos = await storage.getTravelCombos();
                // Extract potential keywords (anything that is not a stop word)
                const keywords = lowerMsg.split(' ').filter(w => w.length > 3 && !['find', 'search', 'want', 'trip', 'combos', 'package', 'about', 'going'].includes(w));

                let bestMatch: any = null;
                if (keywords.length > 0) {
                    bestMatch = allCombos.find(c =>
                        keywords.some(k => c.title.toLowerCase().includes(k) || c.category.toLowerCase().includes(k))
                    );
                }

                if (!bestMatch && lowerMsg.includes("trip")) {
                    // Pick random if just generic request
                    bestMatch = allCombos[0];
                }

                if (bestMatch) {
                    return {
                        message: `I found a great trip for you: ${bestMatch.title} for ${bestMatch.basePrice}! ✈️`,
                        thoughts: [`Fallback: Found ${bestMatch.title}`],
                        action: { type: 'SHOW_COMBO', data: bestMatch }
                    };
                }

                return {
                    message: "I couldn't find a specific trip matching that in my offline database. Try a specific place like 'Paris' or 'Bali'.",
                    thoughts: ["Fallback: No match"],
                    action: { type: 'NONE' }
                };
            }

            return {
                message: "I'm having a bit of connectivity trouble (Google API Error). Please check your API Key permissions. Try 'Search for [Destination]' to use my offline search.",
                thoughts: ["Error logic: " + (error.message || "Unknown error")],
                action: { type: 'NONE' }
            };
        }
    }

    static generateRealisticDescription(title: string, category: string): string {
        const cat = category.toLowerCase();
        const titleClean = title.replace(/\b(trip|package|vacation|tour|getaway)\b/gi, '').trim();

        if (cat.includes("beach")) {
            return `Escape to the sun-soaked shores of ${titleClean}. Enjoy private beach access, pristine ocean waters, and ultimate relaxation.`;
        } else if (cat.includes("adventure") || cat.includes("safari")) {
            return `Embark on a thrilling journey through ${titleClean}. Discover breathtaking landscapes, local wildlife, and unforgettable guided tours.`;
        } else if (cat.includes("luxury")) {
            return `Indulge in a premium 5-star experience in ${titleClean}. Features world-class accommodation, gourmet dining, and private transport.`;
        } else if (cat.includes("city")) {
            return `Explore the vibrant streets and rich cultural heritage of ${titleClean}. Includes historic guided tours, local dining, and central stays.`;
        } else if (cat.includes("romantic")) {
            return `A perfectly curated romantic escape to ${titleClean} designed for couples, featuring candlelit dining and scenic sightseeing.`;
        } else if (cat.includes("budget")) {
            return `Explore the best of ${titleClean} without breaking the bank. Includes comfortable stays, must-see sights, and local travel tips.`;
        }

        return `Experience the wonderful sights of ${titleClean}. This hand-crafted ${category} package offers the perfect balance of leisure and sightseeing.`;
    }

    static getRealisticInclusions(category: string): string {
        const cat = category.toLowerCase();
        if (cat.includes("beach")) return "Luxury Resort, Breakfast, Airport Transfers, Beach Access";
        if (cat.includes("adventure") || cat.includes("safari")) return "Eco-Lodge, Guided Tours, Daily Excursions, Gear Rental";
        if (cat.includes("luxury")) return "5-Star Hotel, Flights (Business), Private Guide, Spa Credits";
        if (cat.includes("city")) return "Boutique Hotel, Metro Pass, Historic City Tours, Museum Tickets";
        if (cat.includes("romantic")) return "Honeymoon Suite, Candlelit Dinner, Champagne, Private Transfers";
        return "Hotel, Flights, Guided Sightseeing";
    }
}
