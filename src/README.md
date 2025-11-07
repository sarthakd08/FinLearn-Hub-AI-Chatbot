# FinLearn Hub Support Agent - Modular Architecture

## Project Structure

```
src/
├── agents/              # Agent implementations
│   ├── frontDeskAgent.ts    # First-line routing agent
│   ├── marketingAgent.ts    # Marketing support with promo tools
│   └── learningAgent.ts     # Learning support with knowledge base
├── routing/             # Conditional edge functions
│   └── edgeFunctions.ts     # Route logic for the graph
├── graph.ts            # Graph construction and compilation
├── cli.ts              # Interactive CLI interface
├── index.ts            # Main exports
├── state.ts            # State definition
├── model.ts            # LLM configuration
├── tools.ts            # Tool definitions
└── indexDocs.ts        # Document indexing utility

```

## Architecture Overview

### Agents (`/agents`)
Each agent is responsible for a specific domain:

- **Front Desk Agent**: Routes users to the appropriate specialized team
- **Marketing Agent**: Handles promotional queries, discounts, offers
- **Learning Agent**: Assists with course information and learning paths

### Routing (`/routing`)
Contains conditional edge functions that determine the next node in the graph based on:
- User intent classification
- Tool call detection
- Conversation state

### Graph (`graph.ts`)
Central orchestration file that:
- Imports all agents and routing functions
- Constructs the state graph
- Defines node connections and edges
- Compiles the graph with memory

### CLI (`cli.ts`)
Interactive command-line interface for testing and using the agent system.

## How to Run

```bash
# Run the interactive CLI
npm run dev

# Index documents into vector store
npm run index-docs

# Build TypeScript
npm run build
```

## Flow Diagram

```
User Input
    ↓
Front Desk Agent
    ↓
    ├─→ Marketing Support → Marketing Tools ↺
    ├─→ Learning Support → Learning Tools ↺
    └─→ End (conversational response)
```

## Adding New Agents

1. Create a new file in `/agents` directory
2. Export the agent function
3. Import and add to graph in `graph.ts`
4. Create routing logic in `edgeFunctions.ts`
5. Wire up edges in the graph

## Tools

Tools are defined in `tools.ts`:
- `getCoursesTool`: Retrieves promotional course information
- `knowledgeBaseRetrieverTool`: Searches the knowledge base using RAG

