import { llm } from "../model.js";
import { knowledgeBaseRetrieverTool } from "../tools.js";
import type state from "../state.js";

const learningTools = [knowledgeBaseRetrieverTool];

export async function learningSupportAgent(stateInput: typeof state.State) {
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

export { learningTools };

