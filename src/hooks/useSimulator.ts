import { useState, useEffect } from 'react';
import { RuntimeEvent, SimulatorState, AgentSimulatorState, MessageCard, ActiveTool } from '../types';
import { scenarios } from '../data/scenarios';

function deriveState(history: RuntimeEvent[]): SimulatorState {
  let state: AgentSimulatorState = "idle";
  const contextStack: MessageCard[] = [];
  let activeTool: ActiveTool | null = null;
  let streamBuffer = "";
  let reasoningBuffer = "";
  let failureReason: string | null = null;
  let interruptedReason: string | null = null;
  const inputQueue: { message: string, id: string }[] = [];

  history.forEach((ev, i) => {
    const id = `ev-${i}`;
    switch (ev.type) {
      case "QUEUE_USER_MESSAGE":
        inputQueue.push({ message: ev.message, id });
        if (state === "idle" || state === "done" || state === "cancelled" || state === "failed" || state === "interrupted") {
          state = "input_queued";
        }
        break;
      case "START_PROCESSING":
        if (inputQueue.length > 0) inputQueue.shift();
        state = "processing_input";
        break;
      case "APPEND_CONTEXT":
        contextStack.push({ id, role: ev.role, content: ev.content, name: ev.name });
        state = "context_updated";
        break;
      case "CALL_LLM":
        if (streamBuffer.trim().length > 0 || reasoningBuffer.trim().length > 0) {
          contextStack.push({ 
            id: `${id}-partial`, 
            role: 'assistant', 
            content: streamBuffer,
            reasoning: reasoningBuffer.trim().length > 0 ? reasoningBuffer : undefined 
          });
        }
        state = "calling_llm";
        streamBuffer = "";
        reasoningBuffer = "";
        activeTool = null;
        break;
      case "LLM_TEXT_DELTA":
        streamBuffer += ev.content;
        state = "streaming_response";
        break;
      case "LLM_REASONING_DELTA":
        reasoningBuffer += ev.content;
        state = "reasoning";
        break;
      case "LLM_TOOL_CALL":
        if (streamBuffer.trim().length > 0 || reasoningBuffer.trim().length > 0) {
          contextStack.push({ 
            id: `${id}-tool-reasoning`, 
            role: 'assistant', 
            content: streamBuffer,
            reasoning: reasoningBuffer.trim().length > 0 ? reasoningBuffer : undefined 
          });
          streamBuffer = "";
          reasoningBuffer = "";
        }
        activeTool = { name: ev.toolName, args: ev.args, result: null };
        state = "tool_call_pending";
        break;
      case "CALL_TOOL":
        state = "executing_tool";
        break;
      case "TOOL_RESULT":
        if (activeTool) activeTool.result = ev.result;
        state = "tool_result_received";
        break;
      case "FAIL_STEP":
        failureReason = ev.reason;
        state = "failed";
        break;
      case "RETRY_TOOL":
        failureReason = null;
        state = "executing_tool";
        break;
      case "INTERRUPT_CURRENT_RUN":
        interruptedReason = ev.reason;
        state = "interrupted";
        break;
      case "CANCEL_RUN":
        inputQueue.length = 0;
        state = "cancelled";
        break;
      case "COMPLETE_RUN":
        if (streamBuffer.trim().length > 0 || reasoningBuffer.trim().length > 0) {
          contextStack.push({ 
            id: `${id}-stream`, 
            role: 'assistant', 
            content: streamBuffer,
            reasoning: reasoningBuffer.trim().length > 0 ? reasoningBuffer : undefined 
          });
          streamBuffer = "";
          reasoningBuffer = "";
        }
        state = inputQueue.length > 0 ? "input_queued" : "done";
        break;
      case "WAIT_FOR_USER":
        break;
    }
  });

  return { agentState: state, contextStack, activeTool, streamBuffer, reasoningBuffer, failureReason, interruptedReason, inputQueue };
}

export function useSimulator() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [pendingEvents, setPendingEvents] = useState<RuntimeEvent[]>(scenarios[0].events);
  const [history, setHistory] = useState<RuntimeEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);

  const simulatorState = deriveState(history);

  const selectScenario = (id: string) => {
    setScenarioId(id);
    const sc = scenarios.find(s => s.id === id);
    if (sc) {
      setHistory([]);
      setPendingEvents(sc.events);
      setIsPlaying(false);
    }
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);

  const step = () => {
    if (pendingEvents.length === 0) { setIsPlaying(false); return; }
    const next = pendingEvents[0];
    if (next.type === "WAIT_FOR_USER") {
      setIsPlaying(false);
      return;
    }
    setHistory(h => [...h, next]);
    setPendingEvents(p => p.slice(1));
  };

  const stepBack = () => {
    if (history.length === 0) return;
    setIsPlaying(false);
    const lastEvent = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setPendingEvents(p => [lastEvent, ...p]);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && pendingEvents.length > 0) {
      const next = pendingEvents[0];
      if (next.type === "WAIT_FOR_USER") {
        setIsPlaying(false);
      } else {
        timer = setTimeout(() => {
          setHistory(h => [...h, next]);
          setPendingEvents(p => p.slice(1));
        }, speed);
      }
    } else if (isPlaying && pendingEvents.length === 0) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, pendingEvents, speed]);

  const reset = () => {
    const sc = scenarios.find(s => s.id === scenarioId);
    if (sc) {
      setHistory([]);
      setPendingEvents(sc.events);
      setIsPlaying(false);
    }
  };

  return {
    simulatorState,
    scenarioId,
    selectScenario,
    pendingEvents,
    history,
    isPlaying,
    speed,
    setSpeed,
    play,
    pause,
    step,
    stepBack,
    stop: reset,
    reset,
    sendTask: (id: string) => {
      selectScenario(id); 
      setTimeout(() => setIsPlaying(true), 100); 
    },
    sendFollowUp: (msg: string) => {
      setHistory(h => [...h, { type: "QUEUE_USER_MESSAGE", message: msg }]);
      const newEvents: RuntimeEvent[] = [
        { type: "START_PROCESSING" },
        { type: "APPEND_CONTEXT", role: "user", content: msg },
        { type: "CALL_LLM" },
        { type: "LLM_TEXT_DELTA", content: "Acknowledged. " },
        { type: "LLM_TEXT_DELTA", content: "I will update accordingly." },
        { type: "COMPLETE_RUN" }
      ];
      setPendingEvents(p => [...p, ...newEvents]);
      
      if (simulatorState.agentState === "done" || simulatorState.agentState === "idle" || simulatorState.agentState === "cancelled") {
        setTimeout(() => setIsPlaying(true), 100);
      }
    },
    interrupt: () => {
      if (pendingEvents[0]?.type === "WAIT_FOR_USER" && pendingEvents[0].action === "INTERRUPT") {
        setPendingEvents(p => p.slice(1));
        setHistory(h => [...h, { type: "INTERRUPT_CURRENT_RUN" as const, reason: "User triggered interrupt" }]);
        setIsPlaying(false);
        return;
      }
      setIsPlaying(false);
      setPendingEvents([]);
      setHistory(h => [...h, { type: "INTERRUPT_CURRENT_RUN" as const, reason: "User triggered interrupt" }]);
    },
    cancel: () => {
      setIsPlaying(false);
      setPendingEvents([]);
      setHistory(h => [...h, { type: "CANCEL_RUN" as const, reason: "User cancelled task" }]);
    },
    retry: () => {
      if (pendingEvents[0]?.type === "WAIT_FOR_USER" && pendingEvents[0].action === "RETRY") {
        setPendingEvents(p => p.slice(1));
        setHistory(h => [...h, { type: "RETRY_TOOL" as const }]);
        setIsPlaying(true);
      }
    },
    approve: () => {
      if (pendingEvents[0]?.type === "WAIT_FOR_USER" && pendingEvents[0].action === "APPROVE") {
        setPendingEvents(p => p.slice(1));
        setIsPlaying(true);
      }
    },
    correction: (msg: string) => {
      setIsPlaying(false);
      setPendingEvents([]);
      setHistory(h => [
        ...h,
        { type: "INTERRUPT_CURRENT_RUN" as const, reason: "Correction applied" },
        { type: "APPEND_CONTEXT" as const, role: "user", content: `Correction: ${msg}` },
        { type: "CALL_LLM" as const }
      ]);
      setPendingEvents([
        { type: "LLM_TEXT_DELTA", content: "Understood, correcting course." },
        { type: "COMPLETE_RUN" }
      ]);
      setTimeout(() => setIsPlaying(true), 500);
    }
  };
}
