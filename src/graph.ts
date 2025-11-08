import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import state from "./state.js";

// agents
import { frontDeskSupportAgent } from "./agents/frontDeskAgent.js";
import { marketingSupportAgent, marketingTools } from "./agents/marketingAgent.js";
import { learningSupportAgent, learningTools } from "./agents/learningAgent.js";
import { refundProcessingAgent, refundTools } from "./agents/refundProcessingAgent.js";

// routing functions
import {
    whoIsNextForFrontDeskSupport,
    whoIsNextForMarketingSupport,
    whoIsNextForLearningSupport,
    whoIsNextForRefundSupport
} from "./routing/edgeFunctions.js";

// tool nodes
const marketingToolNode = new ToolNode(marketingTools);
const learningToolNode = new ToolNode(learningTools);
const refundToolNode = new ToolNode(refundTools);

function buildGraph() {
    const graph = new StateGraph(state)
        // all nodes
        .addNode("frontDeskSupport", frontDeskSupportAgent)
        .addNode("marketingSupport", marketingSupportAgent)
        .addNode("learningSupport", learningSupportAgent)
        .addNode("refundProcessingSupport", refundProcessingAgent)
        .addNode("marketingTools", marketingToolNode)
        .addNode("learningTools", learningToolNode)
        .addNode("refundTools", refundToolNode)
        // edges
        .addEdge("__start__", "frontDeskSupport")
        .addConditionalEdges("frontDeskSupport", whoIsNextForFrontDeskSupport, {
            marketingSupport: "marketingSupport",
            learningSupport: "learningSupport",
            refundProcessingSupport: "refundProcessingSupport",
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
        .addConditionalEdges("refundProcessingSupport", whoIsNextForRefundSupport, {
            refundTools: "refundTools",
            __end__: "__end__",
        })
        .addEdge("refundTools", "refundProcessingSupport");

    return graph.compile({ 
        checkpointer: new MemorySaver(),
        // Interrupt before executing refund tools (since its a sensitive operation)
        interruptBefore: ["refundTools"]
    });
}

export const app = buildGraph();
