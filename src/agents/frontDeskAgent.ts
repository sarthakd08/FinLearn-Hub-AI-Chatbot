import { llm } from "../model.js";
import type state from "../state.js";

export async function frontDeskSupportAgent(stateInput: typeof state.State) {
    const SYSTEM_PROMPT = `You are frontline support staff for FinLearn Hub, an ed-tech company that helps financial professionals excel in their careers through practical courses. Also certifications for the courses are available.
            Be concise in your responses.
            You can chat with students and help them with basic questions, but if the student is having a marketing, learning support, or refund query,
            do not try to answer the question directly or gather information.
            Instead, immediately transfer them to the appropriate team:
            - Marketing team: promo codes, discounts, offers, and special campaigns
            - Learning support team: courses, syllabus coverage, learning paths, and study strategies
            - Refund processing team: refund requests, refund status, and refund policies
            Otherwise, just respond conversationally.`

    const supportResponse = await llm.invoke([
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...stateInput.messages,
    ]);

    const CATEGORIZATION_SYSTEM_PROMPT = `You are an expert customer support routing system.
            Your job is to detect whether a customer support representative is routing a user to a marketing team, learning support team, refund processing team, or if they are just responding conversationally.
            `
    const CATEGORIZATION_HUMAN_PROMPT = `The previous conversation is an interaction between a customer support representative and a user.
            Extract whether the representative is routing the user to a team or responding conversationally.
            Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:
            If they want to route the user to the marketing team, respond with "MARKETING".
            If they want to route the user to the learning support team, respond with "LEARNING".
            If they want to route the user to the refund processing team, respond with "REFUND".
            Otherwise, respond only with the word "RESPOND".
            `

    const categorizationResponse = await llm.invoke([
            {
                role: 'system',
                content : CATEGORIZATION_SYSTEM_PROMPT
            },
            ...stateInput.messages,
            supportResponse,
            {
                role: 'user',
                content : CATEGORIZATION_HUMAN_PROMPT
            },
        ], 
        {
            response_format: { type: 'json_object' }
        }
    );

    const categorisationResponse = JSON.parse(categorizationResponse.content as string);

    /* Returning the final updated state with the messages and the next representative */
    return {
        messages: [supportResponse],
        nextRepresentative: categorisationResponse.nextRepresentative,
    };
}

