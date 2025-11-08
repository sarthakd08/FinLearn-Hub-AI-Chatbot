import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
dotenv.config();

/**
 * Using OpenAI llm model via Groq Client
 */
export const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
  });

