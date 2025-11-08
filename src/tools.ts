import { tool } from "@langchain/core/tools";
import { createRetrieverTool } from "@langchain/classic/tools/retriever";
import { vectorStore } from "./indexDocs.js";
import { gmailEmails, courseCoupons } from "./dummyData.js";
import { z } from "zod";


const getCoursesTool = tool(
    async () => {
        /* TODO: Get the offers and discounts from the database via api call */
        return JSON.stringify(courseCoupons);
    }, 
    {   
        name: "offers_query_tool",
        description: "Use this tool to query the offers and discounts available for the user",
    }
);

const retriever = vectorStore.asRetriever();

const knowledgeBaseRetrieverTool = createRetrieverTool(
    retriever,
    {
        name: "retrieve_learning_knowledge_base",
        description: "Search and return information about the courses, certifications, FAQs, career doubts and other learning resources available at FinLearn Hub",
    }
)

const getEmailsTool = tool(
    async () => {
        // TODO: Get the emails from the inbox via api call
        console.log("Getting emails from the inbox");
        
        return JSON.stringify(gmailEmails);
    },
    {
        name: "get_emails_tool",
        description: "Use this tool to get the emails from the inbox",
    }
)

const refundProcessingTool = tool(
    async ({emails}) => {
        // TODO: Process the refund for the given emails via api call to Backend
        console.log("Processing refunds for the given emails: ", emails);
        
        return "All Refunds have been processed successfully";
    },

    {
        name: "refund_processing_tool",
        description: "Process the refund for the given emails",
        schema: z.object({
            emails: z.array(z.string()).describe("List of emails which needs to be processed"),
        }),
    }
)


export {
    getCoursesTool,
    knowledgeBaseRetrieverTool,
    getEmailsTool,
    refundProcessingTool,
}