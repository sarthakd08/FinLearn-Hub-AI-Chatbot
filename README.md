# FinLearn Hub Support Agent

A modular multi-agent support system built with LangGraph that intelligently routes user queries to specialized support agents.

## 🌟 Features

- **Intelligent Routing**: Front desk agent classifies user intent and routes to appropriate team
- **Marketing Support**: Handles promotional queries, offers, and discounts
- **Learning Support**: Assists with course information using RAG-based knowledge retrieval
- **Tool Integration**: Agents can use tools to fetch real-time information
- **Conversation Memory**: Maintains context across multiple turns
- **Modular Architecture**: Clean separation of concerns for easy maintenance and extension

## 🏗️ Architecture

```
src/
├── agents/              # Specialized agent implementations
│   ├── frontDeskAgent.ts    # Routes to appropriate team
│   ├── marketingAgent.ts    # Marketing support with promo tools
│   └── learningAgent.ts     # Learning support with knowledge base
├── routing/             # Conditional edge functions
│   └── edgeFunctions.ts     # Route logic for the graph
├── graph.ts            # Graph construction and compilation
├── cli.ts              # Interactive CLI interface
├── state.ts            # State definition
├── model.ts            # LLM configuration
├── tools.ts            # Tool definitions
└── indexDocs.ts        # Document indexing utility
```

## 📊 Flow Diagram

```
User Input
    ↓
Front Desk Agent
    ↓
    ├─→ Marketing Support → Marketing Tools ↺
    ├─→ Learning Support → Learning Tools ↺
    └─→ End (conversational response)
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v20.16.0+ recommended)
- npm
- API Keys:
  - Groq API Key (for LLM)
  - OpenAI API Key (for embeddings)
  - Pinecone API Key (for vector store)

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
# Create a .env file with:
# GROQ_API_KEY=your_groq_key
# OPENAI_API_KEY=your_openai_key
# PINECONE_API_KEY=your_pinecone_key
# PINECONE_INDEX_NAME=your_index_name
```

### Usage

```bash
# Index documents into vector store (run once)
npm run index-docs

# Run the interactive support agent
npm run dev

# Build TypeScript
npm run build
```

## 🎯 Agent Capabilities

### Front Desk Agent
- Classifies user intent (Marketing, Learning, or General)
- Routes to specialized teams
- Handles basic conversational queries

### Marketing Agent
- Answers questions about promotions, offers, and discounts
- Uses `getCoursesTool` for promotional information
- Provides concise, friendly responses

### Learning Agent
- Assists with course information and learning paths
- Uses RAG-based retrieval from knowledge base
- Searches indexed documentation for accurate answers

## 🔧 Tech Stack

- **Framework**: [LangGraph](https://github.com/langchain-ai/langgraph) (LangChain)
- **LLM Provider**: Groq
- **Vector Database**: Pinecone
- **Embeddings**: OpenAI text-embedding-3-small (512 dimensions)
- **Runtime**: Node.js with TypeScript

## 📝 Example Interaction

```
You: Hi, do you have any offers going on?
Assistant: [Routes to Marketing Agent]
Marketing Support Agent Called
Assistant: Let me check our current offers for you...

You: What courses do you offer?
Assistant: [Routes to Learning Agent]
Learning Support Agent Called
Assistant: We offer 5 main courses...
```

## 🔌 Adding New Agents

1. Create agent file in `src/agents/`:
```typescript
export async function newAgent(stateInput: typeof state.State) {
    // Agent logic
    return { messages: [...] };
}
```

2. Add routing function in `src/routing/edgeFunctions.ts`

3. Wire up in `src/graph.ts`:
```typescript
import { newAgent } from './agents/newAgent.js';
// Add node and edges
```

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Detailed architecture documentation
- **[src/README.md](./src/README.md)**: Source code structure overview

## 🛠️ Development

```bash
# Build only
npm run build

# Watch mode (if you add nodemon)
npm run dev

# Index new documents
npm run index-docs
```

## 📦 Project Structure

```
.
├── src/                    # Source code
│   ├── agents/            # Agent implementations
│   ├── routing/           # Routing logic
│   └── ...                # Core files
├── dist/                  # Compiled JavaScript
├── node_modules/          # Dependencies
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── README.md             # This file
└── ARCHITECTURE.md       # Architecture documentation
```

## 🤝 Contributing

This is a modular system designed for easy extension:
- Add new agents for specialized domains
- Create new tools for enhanced capabilities
- Extend routing logic for complex workflows

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ using LangGraph and TypeScript

---

**Note**: Make sure to configure your `.env` file with the required API keys before running the application.
