import dotenv from "dotenv";
dotenv.config(); // 👈 must be at the very top

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";


const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  dimensions: 512,  // Match Pinecone index dimension
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME as string);

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});

export async function indexTheDocument(filePath: string) {
  console.log("Indexing the document...", filePath);

  const loader = new PDFLoader(filePath, { splitPages: false });
  const doc = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const chunks = await textSplitter.splitText(doc[0].pageContent);

  const modifiedChunks = chunks.map((chunk) => {
    return {
        pageContent: chunk,
        metadata: doc[0].metadata
    }
  })

  console.log("Total Chunks:", modifiedChunks, modifiedChunks.length);

  await vectorStore.addDocuments(modifiedChunks);
  console.log('Saved to Vectorstore !!');
  
}


indexTheDocument('./src/Docs/FinLearnHub_Dummy_Data.pdf');