import { AIMessage } from "@langchain/core/messages";
import type state from "../state.js";
import readline from 'node:readline/promises';

/**
 * Check if the current state requires human approval for tool execution
 */
export function requiresApproval(stateData: typeof state.State): boolean {
    const lastMessage = stateData.messages[stateData.messages.length - 1] as AIMessage;
    
    if (lastMessage?.type === 'ai' && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        // Check if any tool call is for the refund processing tool (sensitive)
        const sensitiveTools = ['refund_processing_tool'];
        return lastMessage.tool_calls.some(tc => sensitiveTools.includes(tc.name));
    }
    
    return false;
}

/**
 * Display tool call details and get user approval
 */
export async function getApproval(
    stateData: typeof state.State, 
    rl: readline.Interface
): Promise<'approve' | 'reject'> {
    const lastMessage = stateData.messages[stateData.messages.length - 1] as AIMessage;
    
    if (!lastMessage.tool_calls || lastMessage.tool_calls.length === 0) {
        return 'approve';
    }

    console.log("\n" + "=".repeat(60));
    console.log("⚠️  SENSITIVE OPERATION - APPROVAL REQUIRED");
    console.log("=".repeat(60));
    
    for (const toolCall of lastMessage.tool_calls) {
        console.log(`\n🔧 Tool: ${toolCall.name}`);
        console.log(`📋 Arguments:`);
        
        // Display tool arguments dynamically
        if (toolCall.args) {
            Object.entries(toolCall.args).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    console.log(`   ${key}:`);
                    value.forEach((item, idx) => {
                        console.log(`      ${idx + 1}. ${item}`);
                    });
                } else {
                    console.log(`   ${key}: ${value}`);
                }
            });
        }
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("Options:");
    console.log("  1. Approve - Continue with operation");
    console.log("  2. Reject  - Cancel operation");
    
    let response: string;
    while (true) {
        response = await rl.question("\n👤 Your choice (1 or 2): ");
        response = response.trim();
        
        if (response === '1' || response.toLowerCase() === 'approve') {
            return 'approve';
        } else if (response === '2' || response.toLowerCase() === 'reject') {
            return 'reject';
        }
        
        console.log("❌ Invalid input. Please enter 1 (approve) or 2 (reject)");
    }
}

/**
 * Display approval result
 */
export function displayApprovalResult(decision: 'approve' | 'reject') {
    console.log("\n" + "=".repeat(60));
    if (decision === 'approve') {
        console.log("✅ APPROVED - Processing refunds...");
    } else {
        console.log("❌ REJECTED - Refund processing cancelled");
    }
    console.log("=".repeat(60) + "\n");
}

