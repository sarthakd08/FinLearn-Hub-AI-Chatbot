import { llm } from "../model.js";
import { getEmailsTool, refundProcessingTool } from "../tools.js";
import type state from "../state.js";

const refundTools = [getEmailsTool, refundProcessingTool];

export async function refundProcessingAgent(stateInput: typeof state.State) {
    console.log("Refund Processing Agent Called");

    // Check if the last message is a tool message (tool results)
    const lastMessage = stateInput.messages[stateInput.messages.length - 1];
    const hasToolResults = lastMessage && 'tool_call_id' in lastMessage;

    const llmWithTools = llm.bindTools(refundTools);

    const SYSTEM_PROMPT = `You are part of the Refund Processing Team at FinLearn Hub. 
        You handle refund requests and queries about refund policies. 
        You can check emails for refund requests and process refunds when appropriate.
        Be professional, empathetic, and follow company refund policies.
        Use the available tools to retrieve customer emails and process refunds.
        
        IMPORTANT: 
        - First, use get_emails_tool to retrieve the emails from inbox
        - Then, analyze which emails contain refund requests
        - Use refund_processing_tool to process refunds for those specific emails
        - After successfully processing refunds, provide a clear confirmation message
        - Do NOT call tools again after receiving tool results, just provide the final response`;

    // If we have tool results, include all messages for context
    // Otherwise, trim the last AI message to avoid duplication
    let trimmedHistory = stateInput.messages as any[];
    if (!hasToolResults && trimmedHistory.at(-1)?.type == 'ai') {
        trimmedHistory = trimmedHistory.slice(0, -1);
    }

    const refundResponse = await llmWithTools.invoke([
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...trimmedHistory,
    ]);

    return {
        messages: [refundResponse]
    };
}

export { refundTools };
