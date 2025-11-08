import { llm } from "../model.js";
import { getEmailsTool, refundProcessingTool } from "../tools.js";
import type state from "../state.js";

const refundTools = [getEmailsTool, refundProcessingTool];

export async function refundProcessingAgent(stateInput: typeof state.State) {
    console.log("Refund Processing Agent Called");

    const llmWithTools = llm.bindTools(refundTools);

    const SYSTEM_PROMPT = `You are part of the Refund Processing Team at FinLearn Hub. 
        You handle refund requests and queries about refund policies. 
        You can check emails for refund requests and process refunds when appropriate.
        Be professional, empathetic, and follow company refund policies.
        Use the available tools to retrieve customer emails and process refunds.`;

    let trimmedHistory = stateInput.messages as any[];
    if(trimmedHistory.at(-1)?.type == 'ai') {
        trimmedHistory = trimmedHistory.slice(0, -1)
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
