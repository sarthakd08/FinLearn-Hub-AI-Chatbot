# FinLearn Hub Support Agent - Architecture Documentation

## Overview

A modular multi-agent support system built with LangGraph that routes user queries to specialized agents based on intent classification.

## Directory Structure

```
src/
├── agents/                      # Specialized agent implementations
│   ├── frontDeskAgent.ts            # Routes to appropriate team
│   ├── marketingAgent.ts            # Handles promotional queries
│   ├── learningAgent.ts             # Handles course/learning queries
│   └── refundProcessingAgent.ts     # Handles refunds with HITL
│
├── routing/                     # Graph routing logic
│   └── edgeFunctions.ts             # Conditional edge functions
│
├── utils/                       # Utility functions
│   └── humanApproval.ts             # Human-in-the-loop approval logic
│
├── core files
│   ├── graph.ts                 # Graph construction & compilation
│   ├── cli.ts                   # Interactive CLI interface
│   ├── index.ts                 # Main exports
│   ├── state.ts                 # Shared state definition
│   ├── model.ts                 # LLM configuration
│   ├── tools.ts                 # Tool definitions
│   └── dummyData.ts             # Mock data for development
│
└── utilities
    └── indexDocs.ts             # Document vectorization utility
```

## Component Responsibilities

### 1. Agents (`/agents`)

#### Front Desk Agent
- **Purpose**: First point of contact, routes users to specialists
- **Logic**: Uses LLM to classify intent (MARKETING, LEARNING, REFUND, or RESPOND)
- **Output**: Routes to appropriate team or responds directly

#### Marketing Agent
- **Purpose**: Handles promotional queries, offers, discounts
- **Tools**: `getCoursesTool` for promotional information
- **Flow**: Agent → Check for tool calls → Execute tools → Respond

#### Learning Agent
- **Purpose**: Assists with course content, syllabus, learning paths
- **Tools**: `knowledgeBaseRetrieverTool` (RAG-based retrieval)
- **Flow**: Agent → Check for tool calls → Query knowledge base → Respond

#### Refund Processing Agent
- **Purpose**: Handles refund requests and policy queries
- **Tools**: `getEmailsTool`, `refundProcessingTool` (sensitive)
- **Flow**: Agent → Check emails → Request refund → **⏸️ HITL Approval** → Execute → Confirm
- **Special**: Implements human-in-the-loop for sensitive refund operations

### 2. Routing (`/routing`)

Contains conditional edge functions that determine graph flow:

- `whoIsNextForFrontDeskSupport`: Routes based on intent classification (MARKETING/LEARNING/REFUND/RESPOND)
- `whoIsNextForMarketingSupport`: Checks if marketing tools are needed
- `whoIsNextForLearningSupport`: Checks if knowledge base query is needed
- `whoIsNextForRefundSupport`: Checks if refund tools are needed (triggers HITL)

### 3. Utils (`/utils`)

#### Human Approval Module (`humanApproval.ts`)
- `requiresApproval()`: Detects if tool execution requires human approval
- `getApproval()`: Displays tool details and collects user decision (approve/reject)
- `displayApprovalResult()`: Shows the approval decision outcome
- **Purpose**: Generic HITL implementation for any sensitive operation

### 4. Graph Construction (`graph.ts`)

**Nodes:**
- `frontDeskSupport`: Front desk agent
- `marketingSupport`: Marketing agent
- `learningSupport`: Learning agent  
- `refundProcessingSupport`: Refund processing agent
- `marketingTools`: Marketing tool executor
- `learningTools`: Learning tool executor
- `refundTools`: Refund tool executor (with HITL interrupt)

**Edges:**
```
START → frontDeskSupport
    ├→ marketingSupport ⟷ marketingTools
    ├→ learningSupport ⟷ learningTools
    ├→ refundProcessingSupport ⟷ refundTools (⏸️ HITL)
    └→ END
```

**Interrupt Configuration:**
```typescript
graph.compile({ 
    checkpointer: new MemorySaver(),
    interruptBefore: ["refundTools"]  // Pause before sensitive operations
});
```

### 5. State Management

**State Schema** (`state.ts`):
```typescript
{
  messages: BaseMessage[],
  nextRepresentative: string
}
```

- `messages`: Conversation history (user + AI messages)
- `nextRepresentative`: Routing decision (MARKETING, LEARNING, REFUND, RESPOND)

**Checkpointer**: `MemorySaver` enables conversation memory and HITL interrupts

### 6. Tools (`tools.ts`)

#### getCoursesTool
- Retrieves promotional course information (from `dummyData.ts`)
- Used by marketing agent

#### knowledgeBaseRetrieverTool  
- RAG-based retrieval from Pinecone vector store
- Used by learning agent
- Searches indexed course documentation

#### getEmailsTool
- Retrieves customer emails from inbox (mock data)
- Used by refund processing agent

#### refundProcessingTool ⚠️ 
- **Sensitive**: Processes refunds for specified emails
- **HITL**: Requires human approval before execution
- Used by refund processing agent

## Data Flow

```
1. User Input
   ↓
2. Front Desk Agent
   - Classifies intent
   - Routes or responds
   ↓
3a. Marketing Path          3b. Learning Path          3c. Refund Path (with HITL)
    Marketing Agent             Learning Agent             Refund Agent
    ↓                          ↓                          ↓
    Needs tools?                Needs tools?                Needs tools?
    ↓                          ↓                          ↓
    Marketing Tools             Learning Tools              ⏸️ INTERRUPT
    (Course promos)             (Knowledge base)            ↓
    ↓                          ↓                          Show tool details
    Marketing Agent             Learning Agent              ↓
    (Final response)            (Final response)            User Decision
    ↓                          ↓                          ├→ Approve
4. END                     4. END                         │  ↓
                                                           │  Execute Refund Tools
                                                           │  ↓
                                                           │  Refund Agent
                                                           │  (Confirm)
                                                           │  ↓
                                                           │  END
                                                           └→ Reject
                                                              ↓
                                                              END (Cancelled)
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

### Human-in-the-Loop (HITL)
- **Why**: Safety and control for sensitive operations (refunds, payments, data deletion)
- **Implementation**: LangGraph's native `interruptBefore` with checkpoint resume
- **Benefits**: 
  - No external middleware needed
  - Built-in state management
  - Resume from any point
  - Generic and reusable

### Data Separation
- **Why**: Mock data separated from business logic
- **Implementation**: `dummyData.ts` contains all test data (emails, coupons, etc.)

## Extension Points

### Adding a New Agent

1. **Create agent file** (`src/agents/newAgent.ts`)
```typescript
export async function newAgent(stateInput: typeof state.State) {
    const llmWithTools = llm.bindTools(newTools);
    
    const response = await llmWithTools.invoke([
        { role: "system", content: SYSTEM_PROMPT },
        ...stateInput.messages,
    ]);
    
    return { messages: [response] };
}
```

2. **Add routing function** (`src/routing/edgeFunctions.ts`)
```typescript
export function whoIsNextForNewAgent(stateInput: typeof state.State) {
    const lastMessage = stateInput.messages[...] as AIMessage;
    
    if (lastMessage.tool_calls?.length > 0) {
        return 'newTools';
    }
    return '__end__';
}
```

3. **Update front desk routing** (`src/routing/edgeFunctions.ts`)
```typescript
export function whoIsNextForFrontDeskSupport(stateInput: typeof state.State) {
    if (stateInput.nextRepresentative.includes("NEW_CATEGORY")) {
        return "newAgent";
    }
    // ... existing logic
}
```

4. **Update graph** (`src/graph.ts`)
```typescript
import { newAgent, newTools } from './agents/newAgent.js';
import { whoIsNextForNewAgent } from './routing/edgeFunctions.js';

const newToolNode = new ToolNode(newTools);

graph
    .addNode("newAgent", newAgent)
    .addNode("newTools", newToolNode)
    .addConditionalEdges("newAgent", whoIsNextForNewAgent, {
        newTools: "newTools",
        __end__: "__end__",
    })
    .addEdge("newTools", "newAgent");
```

### Adding a Sensitive Tool with HITL

1. **Define tool in `tools.ts`**
```typescript
export const sensitiveOperationTool = tool(
    async ({ data }) => {
        // Sensitive operation logic
        return `Operation completed for ${data}`;
    },
    {
        name: "sensitive_operation_tool",
        description: "Performs sensitive operation",
        schema: z.object({
            data: z.string().describe("Operation data"),
        }),
    }
);
```

2. **Update `humanApproval.ts`** (add to sensitive tools list)
```typescript
export function requiresApproval(stateData: typeof state.State): boolean {
    const sensitiveTools = [
        'refund_processing_tool',
        'sensitive_operation_tool'  // Add here
    ];
    // ... existing logic
}
```

3. **Update graph interrupt**
```typescript
graph.compile({ 
    checkpointer: new MemorySaver(),
    interruptBefore: ["refundTools", "sensitiveTools"]  // Add new tool node
});
```

### Adding a New Tool (Non-Sensitive)

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

