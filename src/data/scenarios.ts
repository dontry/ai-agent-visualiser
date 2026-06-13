import { RuntimeEvent } from '../types';

export const scenarios: { id: string; name: string; description: string; events: RuntimeEvent[] }[] = [
  {
    id: "scenario-1",
    name: "Simple Text Response",
    description: "A normal task message processed by the LLM without tools.",
    events: [
      { type: "QUEUE_USER_MESSAGE", message: "Read package.json and explain." },
      { type: "START_PROCESSING" },
      { type: "APPEND_CONTEXT", role: "user", content: "Read package.json and explain.", name: undefined },
      { type: "CALL_LLM" },
      { type: "LLM_TEXT_DELTA", content: "The " },
      { type: "LLM_TEXT_DELTA", content: "package.json " },
      { type: "LLM_TEXT_DELTA", content: "contains scripts and dependencies." },
      { type: "COMPLETE_RUN" }
    ]
  },
  {
    id: "scenario-2",
    name: "Single Tool Call",
    description: "A task that requires calling a tool before the final answer.",
    events: [
      { type: "QUEUE_USER_MESSAGE", message: "Read package.json" },
      { type: "START_PROCESSING" },
      { type: "APPEND_CONTEXT", role: "user", content: "Read package.json", name: undefined },
      { type: "CALL_LLM" },
      { type: "LLM_TOOL_CALL", toolName: "File Tool", args: '{"path": "package.json"}' },
      { type: "CALL_TOOL", toolName: "File Tool", args: '{"path": "package.json"}' },
      { type: "TOOL_RESULT", toolName: "File Tool", result: '{\n  "name": "ai-studio-app",\n  "dependencies": {\n    "react": "^18"\n  }\n}' },
      { type: "APPEND_CONTEXT", role: "tool", content: '{\n  "name": "ai-studio-app",\n  "dependencies": {\n    "react": "^18"\n  }\n}', name: "File Tool" },
      { type: "CALL_LLM" },
      { type: "LLM_TEXT_DELTA", content: "The file specifies " },
      { type: "LLM_TEXT_DELTA", content: "react ^18 as a dependency." },
      { type: "COMPLETE_RUN" }
    ]
  },
  {
    id: "scenario-3",
    name: "Tool Failure and Retry",
    description: "A tool call fails, forcing the runtime into a failed state until the user retries.",
    events: [
      { type: "QUEUE_USER_MESSAGE", message: "Read badfile.txt" },
      { type: "START_PROCESSING" },
      { type: "APPEND_CONTEXT", role: "user", content: "Read badfile.txt" },
      { type: "CALL_LLM" },
      { type: "LLM_TOOL_CALL", toolName: "File Tool", args: '{"path": "badfile.txt"}' },
      { type: "CALL_TOOL", toolName: "File Tool", args: '{"path": "badfile.txt"}' },
      { type: "FAIL_STEP", reason: "Error: ENOENT no such file or directory 'badfile.txt'" },
      { type: "WAIT_FOR_USER", action: "RETRY" },
      { type: "CALL_TOOL", toolName: "File Tool", args: '{"path": "badfile.txt"}' },
      { type: "TOOL_RESULT", toolName: "File Tool", result: "Empty content." },
      { type: "APPEND_CONTEXT", role: "tool", content: "Empty content.", name: "File Tool" },
      { type: "CALL_LLM" },
      { type: "LLM_TEXT_DELTA", content: "The file is empty." },
      { type: "COMPLETE_RUN" }
    ]
  },
  {
    id: "scenario-4",
    name: "User Interrupt During Streaming",
    description: "The user interrupts the AI while it is generating a response.",
    events: [
      { type: "QUEUE_USER_MESSAGE", message: "Write a long story about space." },
      { type: "START_PROCESSING" },
      { type: "APPEND_CONTEXT", role: "user", content: "Write a long story about space." },
      { type: "CALL_LLM" },
      { type: "LLM_TEXT_DELTA", content: "In the vast expanse " },
      { type: "LLM_TEXT_DELTA", content: "of the Andromeda galaxy, " },
      { type: "WAIT_FOR_USER", action: "INTERRUPT" },
      { type: "LLM_TEXT_DELTA", content: "there lived a brave explorer." },
      { type: "COMPLETE_RUN" }
    ]
  },
  {
    id: "scenario-5",
    name: "Multiple Sequential Tool Calls",
    description: "A complex task that involves executing multiple sequential tool calls to complete the workflow.",
    events: [
      { type: "QUEUE_USER_MESSAGE", message: "Find the entry point, analyze it, and search for the framework documentation." },
      { type: "START_PROCESSING" },
      { type: "APPEND_CONTEXT", role: "user", content: "Find the entry point, analyze it, and search for the framework documentation." },
      { type: "CALL_LLM" },
      { type: "LLM_TOOL_CALL", toolName: "Shell Tool", args: '{"command": "ls -l src/"}' },
      { type: "CALL_TOOL", toolName: "Shell Tool", args: '{"command": "ls -l src/"}' },
      { type: "TOOL_RESULT", toolName: "Shell Tool", result: "total 8\n-rw-r--r-- 1 user user 150 index.ts" },
      { type: "APPEND_CONTEXT", role: "tool", content: "total 8\n-rw-r--r-- 1 user user 150 index.ts", name: "Shell Tool" },
      { type: "CALL_LLM" },
      { type: "LLM_TOOL_CALL", toolName: "File Tool", args: '{"path": "src/index.ts"}' },
      { type: "CALL_TOOL", toolName: "File Tool", args: '{"path": "src/index.ts"}' },
      { type: "TOOL_RESULT", toolName: "File Tool", result: "import express from 'express';\nconst app = express();" },
      { type: "APPEND_CONTEXT", role: "tool", content: "import express from 'express';\nconst app = express();", name: "File Tool" },
      { type: "CALL_LLM" },
      { type: "LLM_TOOL_CALL", toolName: "Search Tool", args: '{"query": "express.js documentation"}' },
      { type: "CALL_TOOL", toolName: "Search Tool", args: '{"query": "express.js documentation"}' },
      { type: "TOOL_RESULT", toolName: "Search Tool", result: "Express is a minimal and flexible Node.js web application framework..." },
      { type: "APPEND_CONTEXT", role: "tool", content: "Express is a minimal and flexible Node.js web application framework...", name: "Search Tool" },
      { type: "CALL_LLM" },
      { type: "LLM_TEXT_DELTA", content: "I found the entry point `src/index.ts`. " },
      { type: "LLM_TEXT_DELTA", content: "It uses Express. " },
      { type: "LLM_TEXT_DELTA", content: "I've also retrieved the relevant Express documentation." },
      { type: "COMPLETE_RUN" }
    ]
  },
  {
    id: "scenario-6",
    name: "Human-in-the-Loop (Approval)",
    description: "The agent pauses execution and waits for human approval before performing a sensitive action.",
    events: [
      { type: "QUEUE_USER_MESSAGE", message: "Drop the production database." },
      { type: "START_PROCESSING" },
      { type: "APPEND_CONTEXT", role: "user", content: "Drop the production database." },
      { type: "CALL_LLM" },
      { type: "LLM_TOOL_CALL", toolName: "Execute SQL", args: '{"query": "DROP DATABASE production;"}' },
      { type: "WAIT_FOR_USER", action: "APPROVE" },
      { type: "CALL_TOOL", toolName: "Execute SQL", args: '{"query": "DROP DATABASE production;"}' },
      { type: "TOOL_RESULT", toolName: "Execute SQL", result: "Database 'production' dropped successfully." },
      { type: "APPEND_CONTEXT", role: "tool", content: "Database 'production' dropped successfully.", name: "Execute SQL" },
      { type: "CALL_LLM" },
      { type: "LLM_TEXT_DELTA", content: "The production database has been dropped." },
      { type: "COMPLETE_RUN" }
    ]
  },
  {
    id: "scenario-7",
    name: "Internal Reasoning (CoT)",
    description: "The agent generates an internal chain of thought before emitting tool calls or text.",
    events: [
      { type: "QUEUE_USER_MESSAGE", message: "What's the weather in Seattle?" },
      { type: "START_PROCESSING" },
      { type: "APPEND_CONTEXT", role: "user", content: "What's the weather in Seattle?" },
      { type: "CALL_LLM" },
      { type: "LLM_REASONING_DELTA", content: "The user is asking for the current weather in Seattle.\n" },
      { type: "LLM_REASONING_DELTA", content: "I should use the search or weather tool to find the current conditions.\n" },
      { type: "LLM_REASONING_DELTA", content: "Action: SearchTool(query='weather in Seattle')" },
      { type: "LLM_TOOL_CALL", toolName: "Weather Tool", args: '{"location": "Seattle, WA"}' },
      { type: "CALL_TOOL", toolName: "Weather Tool", args: '{"location": "Seattle, WA"}' },
      { type: "TOOL_RESULT", toolName: "Weather Tool", result: "Current conditions: 65°F, partly cloudy." },
      { type: "APPEND_CONTEXT", role: "tool", content: "Current conditions: 65°F, partly cloudy.", name: "Weather Tool" },
      { type: "CALL_LLM" },
      { type: "LLM_REASONING_DELTA", content: "Got the tool result: 65 degrees and partly cloudy.\n" },
      { type: "LLM_REASONING_DELTA", content: "I will summarize this to the user." },
      { type: "LLM_TEXT_DELTA", content: "It's currently 65°F and partly cloudy in Seattle." },
      { type: "COMPLETE_RUN" }
    ]
  },
  {
    id: "scenario-8",
    name: "Multi-Agent Handoff",
    description: "The Planning Agent breaks down a complex task and routes sub-tasks to the Coding Agent and Testing Agent.",
    events: [
      { type: "QUEUE_USER_MESSAGE", message: "Build and test a multi-agent application." },
      { type: "START_PROCESSING" },
      { type: "APPEND_CONTEXT", role: "user", content: "Build and test a multi-agent application." },
      { type: "CALL_LLM" },
      { type: "LLM_REASONING_DELTA", content: "I am the Planning Agent.\n" },
      { type: "LLM_REASONING_DELTA", content: "I need to break down the user's task.\n" },
      { type: "LLM_REASONING_DELTA", content: "1. Hand off to Coding Agent to build.\n" },
      { type: "LLM_REASONING_DELTA", content: "2. Hand off to Testing Agent to test." },
      { type: "LLM_TEXT_DELTA", content: "I've planned the architecture. " },
      { type: "LLM_TEXT_DELTA", content: "Handing off implementation to the Coding Agent." },
      { type: "HANDOFF_AGENT", agentName: "Coding Agent" },
      { type: "CALL_LLM" },
      { type: "LLM_REASONING_DELTA", content: "I am the Coding Agent.\n" },
      { type: "LLM_REASONING_DELTA", content: "I will write the application code.\n" },
      { type: "LLM_TOOL_CALL", toolName: "File System", args: '{"path": "src/App.tsx", "action": "write"}' },
      { type: "CALL_TOOL", toolName: "File System", args: '{"path": "src/App.tsx", "action": "write"}' },
      { type: "TOOL_RESULT", toolName: "File System", result: "File written successfully." },
      { type: "APPEND_CONTEXT", role: "tool", content: "File written successfully.", name: "File System" },
      { type: "CALL_LLM" },
      { type: "LLM_TEXT_DELTA", content: "Code is written. Handing off to Testing Agent." },
      { type: "HANDOFF_AGENT", agentName: "Testing Agent" },
      { type: "CALL_LLM" },
      { type: "LLM_REASONING_DELTA", content: "I am the Testing Agent.\n" },
      { type: "LLM_REASONING_DELTA", content: "Running tests on the new code." },
      { type: "LLM_TOOL_CALL", toolName: "Test Runner", args: '{"command": "npm test"}' },
      { type: "CALL_TOOL", toolName: "Test Runner", args: '{"command": "npm test"}' },
      { type: "TOOL_RESULT", toolName: "Test Runner", result: "Tests passed: 4/4" },
      { type: "APPEND_CONTEXT", role: "tool", content: "Tests passed: 4/4", name: "Test Runner" },
      { type: "CALL_LLM" },
      { type: "LLM_TEXT_DELTA", content: "All tests have passed beautifully." },
      { type: "HANDOFF_AGENT", agentName: "Main Agent" },
      { type: "CALL_LLM" },
      { type: "LLM_TEXT_DELTA", content: "The multi-agent task is complete." },
      { type: "COMPLETE_RUN" }
    ]
  }
];
