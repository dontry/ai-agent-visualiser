export type MessageRole = "user" | "assistant" | "tool" | "system";

export type RuntimeEvent =
  | { type: "QUEUE_USER_MESSAGE"; message: string }
  | { type: "START_PROCESSING" }
  | { type: "APPEND_CONTEXT"; role: MessageRole; content: string; name?: string }
  | { type: "CALL_LLM" }
  | { type: "LLM_TEXT_DELTA"; content: string }
  | { type: "LLM_REASONING_DELTA"; content: string }
  | { type: "LLM_TOOL_CALL"; toolName: string; args: string }
  | { type: "CALL_TOOL"; toolName: string; args: string }
  | { type: "TOOL_RESULT"; toolName: string; result: string }
  | { type: "INTERRUPT_CURRENT_RUN"; reason: string }
  | { type: "FAIL_STEP"; reason: string }
  | { type: "COMPLETE_RUN" }
  | { type: "WAIT_FOR_USER"; action: "RETRY" | "INTERRUPT" | "CANCEL" | "APPROVE" }
  | { type: "CANCEL_RUN"; reason: string }
  | { type: "RETRY_TOOL" }
  | { type: "HANDOFF_AGENT"; agentName: string };

export type AgentSimulatorState =
  | "idle"
  | "input_queued"
  | "processing_input"
  | "context_updated"
  | "calling_llm"
  | "reasoning"
  | "streaming_response"
  | "tool_call_pending"
  | "executing_tool"
  | "tool_result_received"
  | "interrupted"
  | "failed"
  | "cancelled"
  | "routing_to_agent"
  | "done";

export type MessageCard = {
  id: string;
  role: MessageRole;
  content: string;
  name?: string;
  reasoning?: string;
};

export type ActiveTool = {
  name: string;
  args: string;
  result?: string | null;
};

export type SimulatorState = {
  currentAgent: string;
  agentState: AgentSimulatorState;
  contextStack: MessageCard[];
  activeTool: ActiveTool | null;
  streamBuffer: string;
  reasoningBuffer: string;
  failureReason: string | null;
  interruptedReason: string | null;
  inputQueue: { message: string; id: string }[];
};
