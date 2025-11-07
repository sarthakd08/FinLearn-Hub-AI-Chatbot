import readline from 'node:readline/promises';
import { app } from './graph.js';

/**
 * Interactive CLI for the support agent system
 */
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("FinLearn Hub Support Agent");
    console.log("Type 'bye' to exit\n");

    while (true) {
        const userQuery = await rl.question("You: ");

        if (userQuery.toLowerCase() === 'bye') {
            console.log("Thank you for contacting FinLearn Hub. Goodbye!");
            break;
        }

        if (!userQuery.trim()) {
            continue;
        }

        try {
            const state = await app.invoke({
                messages: [
                    {
                        role: "user",
                        content: userQuery,
                    },
                ],
            }, { configurable: { thread_id: "1" } });

            console.log('Assistant: ', state.messages[state.messages.length - 1].content);
            console.log();
        } catch (error) {
            console.error("Error processing request:", error);
        }
    }

    rl.close();
}

main();

