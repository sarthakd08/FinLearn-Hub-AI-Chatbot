# FinLearn Hub Support Agent - Architecture Documentation

## Overview

A modular multi-agent support system built with LangGraph that routes user queries to specialized agents based on intent classification.

## Directory Structure

```
src/
├── agents/                 # Specialized agent implementations
│   ├── frontDeskAgent.ts   # Routes to appropriate team
│   ├── marketingAgent.ts   # Handles promotional queries
│   └── learningAgent.ts    # Handles course/learning queries
│
├── routing/                # Graph routing logic
│   └── edgeFunctions.ts    # Conditional edge functions
│
├── core files
│   ├── graph.ts            # Graph construction & compilation
│   ├── cli.ts              # Interactive CLI interface
│   ├── index.ts            # Main exports
│   ├── state.ts            # Shared state definition
│   ├── model.ts            # LLM configuration
│   └── tools.ts            # Tool definitions
│
└── utilities
    └── indexDocs.ts        # Document vectorization utility
```

## Component Responsibilities

### 1. Agents (`/agents`)

#### Front Desk Agent
- **Purpose**: First point of contact, routes users to specialists
- **Logic**: Uses LLM to classify intent (MARKETING, LEARNING, or RESPOND)
- **Output**: Routes to appropriate team or responds directly

#### Marketing Agent
- **Purpose**: Handles promotional queries, offers, discounts
- **Tools**: `getCoursesTool` for promotional information
- **Flow**: Agent → Check for tool calls → Execute tools → Respond

#### Learning Agent
- **Purpose**: Assists with course content, syllabus, learning paths
- **Tools**: `knowledgeBaseRetrieverTool` (RAG-based retrieval)
- **Flow**: Agent → Check for tool calls → Query knowledge base → Respond

### 2. Routing (`/routing`)

Contains conditional edge functions that determine graph flow:

- `whoIsNextForFrontDeskSupport`: Routes based on intent classification
- `whoIsNextForMarketingSupport`: Checks if marketing tools are needed
- `whoIsNextForLearningSupport`: Checks if knowledge base query is needed

### 3. Graph Construction (`graph.ts`)

**Nodes:**
- `frontDeskSupport`: Front desk agent
- `marketingSupport`: Marketing agent
- `learningSupport`: Learning agent  
- `marketingTools`: Marketing tool executor
- `learningTools`: Learning tool executor

**Edges:**
```
START → frontDeskSupport
    ├→ marketingSupport ⟷ marketingTools
    ├→ learningSupport ⟷ learningTools
    └→ END
```

### 4. State Management

**State Schema** (`state.ts`):
```typescript
{
  messages: BaseMessage[],
  nextRepresentative: string
}
```

- `messages`: Conversation history (user + AI messages)
- `nextRepresentative`: Routing decision (MARKETING, LEARNING, RESPOND)

**Checkpointer**: `MemorySaver` enables conversation memory across turns

### 5. Tools (`tools.ts`)

#### getCoursesTool
- Retrieves promotional course information
- Used by marketing agent

#### knowledgeBaseRetrieverTool  
- RAG-based retrieval from Pinecone vector store
- Used by learning agent
- Searches indexed course documentation

## Data Flow

```
1. User Input
   ↓
2. Front Desk Agent
   - Classifies intent
   - Routes or responds
   ↓
3a. Marketing Path              3b. Learning Path
    Marketing Agent                 Learning Agent
    ↓                              ↓
    Needs tools?                    Needs tools?
    ↓                              ↓
    Marketing Tools                 Learning Tools
    (Course promos)                 (Knowledge base)
    ↓                              ↓
    Marketing Agent                 Learning Agent
    (Final response)                (Final response)
    ↓                              ↓
4. END
```

## Key Design Decisions

### Modularity
- **Why**: Separation of concerns, easier testing, maintainability
- **Implementation**: Each agent in separate file with clear interface

### Tool-Agent Loops
- **Why**: Agents can iteratively call tools until satisfied
- **Implementation**: Conditional edges check for tool_calls in last message

### Intent Classification
- **Why**: Intelligent routing without manual rules
- **Implementation**: LLM-based classification with structured JSON output

### Memory Persistence
- **Why**: Multi-turn conversations with context
- **Implementation**: MemorySaver checkpointer with thread_id

## Extension Points

### Adding a New Agent

1. **Create agent file** (`src/agents/newAgent.ts`)
```typescript
export async function newAgent(stateInput: typeof state.State) {
    // Agent logic here
    return { messages: [...] };
}
```

2. **Add routing function** (`src/routing/edgeFunctions.ts`)
```typescript
export function whoIsNextForNewAgent(stateInput: typeof state.State) {
    // Routing logic
    return 'nextNode' | '__end__';
}
```

3. **Update graph** (`src/graph.ts`)
```typescript
import { newAgent } from './agents/newAgent.js';
// ... add node and edges
```

### Adding a New Tool

1. Define tool in `tools.ts`
2. Add to appropriate agent's tool array
3. Update agent system prompt to mention new capability

## Running the System

```bash
# Interactive mode
npm run dev

# Index documents
npm run index-docs

# Build only
npm run build
```

## Tech Stack

- **Framework**: LangGraph (LangChain)
- **LLM**: Groq (configurable in model.ts)
- **Vector DB**: Pinecone
- **Embeddings**: OpenAI text-embedding-3-small (512d)
- **Runtime**: Node.js with TypeScript

