import readline from 'node:readline/promises'
import { MemorySaver, StateGraph } from "@langchain/langgraph";
import state from "./state.js";
import { llm } from "./model.js";
import { getCoursesTool, knowledgeBaseRetrieverTool } from "./tools.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "@langchain/core/messages";

const marketingTools = [getCoursesTool];
const marketingToolNode = new ToolNode(marketingTools);

const learningTools = [knowledgeBaseRetrieverTool];
const learningToolNode = new ToolNode(learningTools);


/* Langgraph Nodes (Functions)*/
async function frontDeskSupportAgent(stateInput: typeof state.State) {
    const SYSTEM_PROMPT = `You are frontline support staff for FinLearn Hub, an ed-tech company that helps financial professionals excel in their careers through practical courses. Also certifications for the courses are available.
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

async function learningSupportAgent(stateInput: typeof state.State) {
    console.log("Learning Support Agent Called");

    const llmWithTools = llm.bindTools(learningTools);

    const SYSTEM_PROMPT = `You are part of the Learning Support Team at FinLearn Hub, an ed-tech company that helps financial professionals excel in their careers through practical courses. Also certifications for the courses are available. 
        You assist students with questions about available courses, syllabus coverage, learning paths, and study strategies. 
        Keep your answers concise, clear, and supportive. Strictly use information from retrieved context for answering 
        queries. If the query is about learning issues, politely redirect the student to the respective team. 
        Important: Call retrieve_learning_knowledge_base max 3 times if the tool result is not relevant to original query.`

    let trimmedHistory = stateInput.messages as any[];
    if(trimmedHistory.at(-1).type == 'ai') {
        trimmedHistory = trimmedHistory.slice(0, -1)
    }

    const learningResponse = await llmWithTools.invoke([
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...trimmedHistory,
    ])
    return {
        messages: [learningResponse]
    };
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

function whoIsNextForLearningSupport(stateInput: typeof state.State) {
    const lastMessage = stateInput.messages[stateInput.messages.length - 1] as AIMessage;

    if (lastMessage.type == 'ai' && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'learningTools';
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
        .addNode("learningTools", learningToolNode)
        .addEdge("__start__", "frontDeskSupport")
        .addConditionalEdges("frontDeskSupport", whoIsNextForFrontDeskSupport, {
            marketingSupport: "marketingSupport",
            learningSupport: "learningSupport",
            __end__: "__end__",
        })
        .addConditionalEdges("marketingSupport", whoIsNextForMarketingSupport, {
            marketingTools: "marketingTools",
            __end__: "__end__",
        })
        .addEdge("marketingTools", "marketingSupport")
        .addConditionalEdges("learningSupport", whoIsNextForLearningSupport, {
            learningTools: "learningTools",
            __end__: "__end__",
        })
        .addEdge("learningTools", "learningSupport")
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

const app = graph.compile({checkpointer: new MemorySaver()});


const main = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    while (true) {

        const userQuery = await rl.question("You: ");

        if (userQuery.toLowerCase() === 'bye') {
            break;
        }

        const state = await app.invoke({
            messages: [
                {
                    role: "user",
                    content: userQuery,
                    // content: "Hi,I need to know about the courses which i can take to improve my skills as 7 years experienced developer?", // Should route to learning support agent
                    // content: "Hi, do you have any offers going on?" // Should route to marketing support agent
                    // content : "Hi, Can you share me the contact support email of your firm?"
                },
            ],
        }, {configurable: {thread_id: "1"}});
    

        console.log('Assistant Response:: ', state.messages[state.messages.length - 1].content);
        
    }


    rl.close();
}


main();