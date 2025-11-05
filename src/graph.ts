import { StateGraph } from "@langchain/langgraph";
import state from "./state.js";
import { llm } from "./model.js";
import { getCoursesTool } from "./tools.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "@langchain/core/messages";

const marketingTools = [getCoursesTool];
const marketingToolNode = new ToolNode(marketingTools);
const learningTools = [getCoursesTool];
const learningToolNode = new ToolNode(learningTools);


/* Langgraph Nodes (Functions)*/
async function frontDeskSupportAgent(stateInput: typeof state.State) {
    const SYSTEM_PROMPT = `You are frontline support staff for LearnerHub, an ed-tech company that helps software developers excel in their careers through practical web development and Generative AI courses.
            Be concise in your responses.
            You can chat with students and help them with basic questions, but if the student is having a marketing or learning support query,
            do not try to answer the question directly or gather information.
            Instead, immediately transfer them to the marketing team (promo codes, discounts, offers, and special campaigns) or learning support team (courses, syllabus coverage, learning paths, and study strategies) by asking the user to hold for a moment.
            Otherwise, just respond conversationally.`

    const supportResponse = await llm.invoke([
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...stateInput.messages,
    ]);

    const CATEGORIZATION_SYSTEM_PROMPT = `You are an expert customer support routing system.
            Your job is to detect whether a customer support representative is routing a user to a marketing team or learning support team, or if they are just responding conversationally.
            `
    const CATEGORIZATION_HUMAN_PROMPT = `The previous conversation is an interaction between a customer support representative and a user.
            Extract whether the representative is routing the user to a marketing team or learning support team, or whether they are just responding conversationally.
            Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:
            If they want to route the user to the marketing team, respond with "MARKETING".
            If they want to route the user to the learning support team, respond with "LEARNING".
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

    /* Return the final updated state with the messages and the next representative */
    return {
        messages: [supportResponse],
        nextRepresentative: categorisationResponse.nextRepresentative,
    };

}

async function marketingSupportAgent(stateInput: typeof state.State) {
    console.log("Marketing Support Agent Called");
    const llmWithTools = llm.bindTools(marketingTools);

    const SYSTEM_PROMPT = `You are part of the Marketing Team at LearnerHub, an ed-tech company that helps software developers excel in their careers through practical web development and Generative AI courses. You specialize in handling questions about promo codes, discounts, offers, and special campaigns. Answer clearly, concisely, and in a friendly manner. For queries outside promotions (course content, learning), politely redirect the student to the correct team.
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

function learningSupportAgent(stateInput: typeof state.State) {
    console.log("Learning Support Agent Called");
    return stateInput;
}



/* conditional edges for front desk support agent */
function whoIsNextForFrontDeskSupport(stateInput: typeof state.State) {
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


function whoIsNextForMarketingSupport(stateInput: typeof state.State) {
    const lastMessage = stateInput.messages[stateInput.messages.length - 1] as AIMessage;

    if (lastMessage.type == 'ai' && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'marketingTools';
    } else {
        return '__end__';
    }
}


/**
 * The Graph
 */

const graph = new StateGraph(state);

graph.addNode("frontDeskSupport", frontDeskSupportAgent)
        .addNode("marketingSupport", marketingSupportAgent)
        .addNode("learningSupport", learningSupportAgent)
        .addNode("marketingTools", marketingToolNode)
        // .addNode("learningTools", learningToolNode)
        .addEdge("__start__", "frontDeskSupport")
        .addConditionalEdges("frontDeskSupport", whoIsNextForFrontDeskSupport, {
            marketingSupport: "marketingSupport",
            learningSupport: "learningSupport",
            __end__: "__end__",
        })
        // todo : remove this once after testing
        // .addEdge("marketingSupport", "__end__")
        .addEdge("learningSupport", "__end__")
        .addConditionalEdges("marketingSupport", whoIsNextForMarketingSupport, {
            marketingTools: "marketingTools",
            __end__: "__end__",
        })
        .addEdge("marketingTools", "marketingSupport")
        // .addConditionalEdges()
        // .addConditionalEdges("marketingTools", whoIsNext, {
        //     marketingSupport: "marketingSupport",
        //     learningSupport: "learningSupport",
        //     __end__: "__end__",
        // })
        // .addConditionalEdges("learningTools", whoIsNext, {
        //     marketingSupport: "marketingSupport",
        //     learningSupport: "learningSupport",
        //     __end__: "__end__",
        // })

const app = graph.compile();


const main = async () => {
    const stream = await app.stream({
        messages: [
            {
                role: "user",
                // content: "Hi,I need to know about the courses which i can take to improve my skills as 7 years experienced developer?", // Should route to learning support agent
                content: "Hi, do you have any offers going on?" // Should route to marketing support agent
            },
        ],
    });

    for await (const chunk of stream) {
        console.log("--------STEP-----------------");
        console.log('I am a stream chunk:: ', chunk);
        console.log("--------STEP-----------------");
    }

}


main();