
// Logic extracted from AgentService for testing purposes
async function processWithHeuristic(command: string) {
    const lowerCmd = command.toLowerCase();

    const result: any = { message: "", type: "UNKNOWN" };

    // Create
    if (lowerCmd.includes("create") || lowerCmd.includes("add") || lowerCmd.includes("new")) {
        // Try to find Price (starts with $)
        const priceMatch = command.match(/\$\d+(,\d{3})*(\.\d{2})?/); // $500 or $1,200
        const price = priceMatch ? priceMatch[0] : "$999";

        // Try to find Category (after keyword 'category' or 'type')
        const catMatch = command.match(/(?:category|type|style)\s+["']?(\w+)["']?/i);
        const category = catMatch ? catMatch[1] : "General";

        // Title logic
        let title = "New Package";
        const titleMatch = command.match(/(?:create|add|new)\s+(?:combo|package|trip)?\s*["']?([^"'$]+?)["']?\s+(?:for|at|cost|price|category)/i);
        if (titleMatch) {
            title = titleMatch[1].trim();
        } else {
            const simpleMatch = command.match(/(?:create|add|new)\s+["']?([^"']+)["']?/i);
            if (simpleMatch) title = simpleMatch[1].trim();
        }

        result.type = "CREATE";
        result.data = { title, price, category };
        return result;
    }

    // Delete
    if (lowerCmd.includes("delete") || lowerCmd.includes("remove")) {
        const idMatch = command.match(/\d+/);
        if (idMatch) {
            result.type = "DELETE";
            result.data = { id: parseInt(idMatch[0]) };
            return result;
        }
    }

    return result;
}

// Test Runner
async function run() {
    console.log("Running Regex Tests...");

    const tests = [
        { cmd: "Create 'Bali Blast' for $800 category Beach", expected: "CREATE", title: "Bali Blast", price: "$800" },
        { cmd: "Add a new trip to Tokyo for $1,200", expected: "CREATE", title: "trip to Tokyo", price: "$1,200" },
        { cmd: "Create package 'Jungle Trek' category Adventure", expected: "CREATE", title: "Jungle Trek", price: "$999" }, // Default price
        { cmd: "Remove combo 5", expected: "DELETE", id: 5 },
        { cmd: "Delete #12", expected: "DELETE", id: 12 }
    ];

    for (const t of tests) {
        const res = await processWithHeuristic(t.cmd);
        const success = res.type === t.expected
            && (!t.title || res.data.title.includes(t.title) || res.data.title === t.title)
            && (!t.id || res.data.id === t.id);

        console.log(`[${success ? 'PASS' : 'FAIL'}] "${t.cmd}" -> ${res.type} ${JSON.stringify(res.data)}`);
    }
}

run();
