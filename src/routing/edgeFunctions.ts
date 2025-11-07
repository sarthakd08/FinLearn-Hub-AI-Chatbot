import { AIMessage } from "@langchain/core/messages";
import type state from "../state.js";

export function whoIsNextForFrontDeskSupport(stateInput: typeof state.State) {
    if (stateInput.nextRepresentative.includes("MARKETING")) {
        return "marketingSupport";
    } else if (stateInput.nextRepresentative.includes("LEARNING")) {
        return "learningSupport";
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

