import { ChatGroq } from "@langchain/groq";

/**
 * Initialise the llm model
 */
export const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  // other params...
  });

