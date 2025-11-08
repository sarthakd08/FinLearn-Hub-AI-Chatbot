import { AIMessage } from "@langchain/core/messages";
import type state from "../state.js";

export function whoIsNextForFrontDeskSupport(stateInput: typeof state.State) {
    if (stateInput.nextRepresentative.includes("MARKETING")) {
        return "marketingSupport";
    } else if (stateInput.nextRepresentative.includes("LEARNING")) {
        return "learningSupport";
    } else if (stateInput.nextRepresentative.includes("REFUND")) {
        return "refundProcessingSupport";
    } else if (stateInput.nextRepresentative.includes("RESPOND")) {
        return "__end__";
    } else {
        return "__end__";
    }
}

export function whoIsNextForMarketingSupport(stateInput: typeof state.State) {
    const lastMessage = stateInput.messages[stateInput.messages.length - 1] as AIMessage;

    if (lastMessage.type == 'ai' && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'marketingTools';
    } else {
        return '__end__';
    }
}

export function whoIsNextForLearningSupport(stateInput: typeof state.State) {
    const lastMessage = stateInput.messages[stateInput.messages.length - 1] as AIMessage;

    if (lastMessage.type == 'ai' && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'learningTools';
    } else {
        return '__end__';
    }
}

export function whoIsNextForRefundSupport(stateInput: typeof state.State) {
    const lastMessage = stateInput.messages[stateInput.messages.length - 1] as AIMessage;

    // Check if this is an AI message with tool calls (need to execute tools)
    if (lastMessage.type == 'ai' && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'refundTools';
    }
    
    // Otherwise, we're done
    return '__end__';
}

