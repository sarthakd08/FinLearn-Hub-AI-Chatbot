import { llm } from "../model.js";
import { getCoursesTool } from "../tools.js";
import type state from "../state.js";

const marketingTools = [getCoursesTool];

export async function marketingSupportAgent(stateInput: typeof state.State) {
    console.log("Marketing Support Agent Called");

    const llmWithTools = llm.bindTools(marketingTools);

    const SYSTEM_PROMPT = `You are part of the Marketing Team at FinLearn Hub, an ed-tech company that helps financial professionals excel in their careers through practical courses. Also certifications for the courses are available. You specialize in handling questions about promo codes, discounts, offers, and special campaigns. Answer clearly, concisely, and in a friendly manner. For queries outside promotions (course content, learning), politely redirect the student to the correct team.
            Important: Answer only using given context, else say I don't have enough information about it.
            Note that marketing tools are available to you, so you can use them to get the information you need.
            `

    let trimmedHistory = stateInput.messages as any[];
    if(trimmedHistory.at(-1).type == 'ai') {
        trimmedHistory = trimmedHistory.slice(0, -1)
    }
    const marketingResponse = await llmWithTools.invoke([
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...trimmedHistory,
    ])

    return {
        messages: [marketingResponse]
    };
}

export { marketingTools };

