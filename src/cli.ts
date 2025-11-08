import readline from 'node:readline/promises';
import { app } from './graph.js';
import { requiresApproval, getApproval, displayApprovalResult } from './utils/humanApproval.js';

/**
 * Interactive CLI for the support agent system with Human-in-the-Loop support
 */
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("FinLearn Hub Support Agent");
    console.log("Type 'bye' to exit\n");

    const threadId = "cli-session-1";

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
            // Initial invocation
            let state = await app.invoke({
                messages: [
                    {
                        role: "user",
                        content: userQuery,
                    },
                ],
            }, { configurable: { thread_id: threadId } });

            // Display the initial assistant response
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage?.content) {
                console.log('\nAssistant:', lastMessage.content);
            }

            // Check if we need human approval (interrupted state)
            if (requiresApproval(state)) {
                const decision = await getApproval(state, rl);
                displayApprovalResult(decision);

                if (decision === 'approve') {
                    // Continue execution - invoke with null to resume from checkpoint
                    state = await app.invoke(null, { 
                        configurable: { thread_id: threadId } 
                    });
                    
                    // Display final response
                    const finalMessage = state.messages[state.messages.length - 1];
                    if (finalMessage?.content) {
                        console.log('\nAssistant:', finalMessage.content);
                    }
                }
            }

            console.log();
        } catch (error) {
            console.error("\n❌ Error processing request:", error);
        }
    }

    rl.close();
}

main();

