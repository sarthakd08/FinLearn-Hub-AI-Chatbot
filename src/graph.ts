import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import state from "./state.js";

// agents
import { frontDeskSupportAgent } from "./agents/frontDeskAgent.js";
import { marketingSupportAgent, marketingTools } from "./agents/marketingAgent.js";
import { learningSupportAgent, learningTools } from "./agents/learningAgent.js";

// routing functions
import {
    whoIsNextForFrontDeskSupport,
    whoIsNextForMarketingSupport,
    whoIsNextForLearningSupport
} from "./routing/edgeFunctions.js";

// tool nodes
const marketingToolNode = new ToolNode(marketingTools);
const learningToolNode = new ToolNode(learningTools);

function buildGraph() {
    const graph = new StateGraph(state)
        // all nodes
        .addNode("frontDeskSupport", frontDeskSupportAgent)
        .addNode("marketingSupport", marketingSupportAgent)
        .addNode("learningSupport", learningSupportAgent)
        .addNode("marketingTools", marketingToolNode)
        .addNode("learningTools", learningToolNode)
        // edges
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
        .addEdge("learningTools", "learningSupport");

    return graph.compile({ checkpointer: new MemorySaver() });
}

export const app = buildGraph();
