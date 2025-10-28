import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Initialise the llm model
 */
export const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
  // other params...
  });

