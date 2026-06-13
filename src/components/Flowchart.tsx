import { AgentSimulatorState, RuntimeEvent } from '../types';

export function Flowchart({ currentState, pendingEvents }: { currentState: AgentSimulatorState, pendingEvents?: RuntimeEvent[] }) {
  const isActive = (state: string) => state === currentState;

  let nextState: AgentSimulatorState | null = null;
  if (pendingEvents && pendingEvents.length > 0) {
     const n = pendingEvents[0];
     if (n.type === 'QUEUE_USER_MESSAGE') nextState = 'input_queued';
     else if (n.type === 'START_PROCESSING') nextState = 'processing_input';
     else if (n.type === 'APPEND_CONTEXT') nextState = 'context_updated';
     else if (n.type === 'CALL_LLM') nextState = 'calling_llm';
     else if (n.type === 'LLM_REASONING_DELTA') nextState = 'reasoning';
     else if (n.type === 'LLM_TEXT_DELTA') nextState = 'streaming_response';
     else if (n.type === 'LLM_TOOL_CALL') nextState = 'tool_call_pending';
     else if (n.type === 'CALL_TOOL') nextState = 'executing_tool';
     else if (n.type === 'TOOL_RESULT') nextState = 'tool_result_received';
     else if (n.type === 'FAIL_STEP') nextState = 'failed';
     else if (n.type === 'INTERRUPT_CURRENT_RUN') nextState = 'interrupted';
     else if (n.type === 'CANCEL_RUN') nextState = 'cancelled';
     else if (n.type === 'COMPLETE_RUN') nextState = 'done';
     else if (n.type === 'RETRY_TOOL') nextState = 'executing_tool';
  }

  const NODES: Record<AgentSimulatorState, { x: number, y: number }> = {
    idle: { x: 110, y: 40 },
    input_queued: { x: 110, y: 130 },
    processing_input: { x: 110, y: 220 },
    context_updated: { x: 110, y: 310 },
    calling_llm: { x: 110, y: 400 },
    reasoning: { x: 110, y: 490 },
    streaming_response: { x: 110, y: 580 },
    done: { x: 110, y: 670 },
    
    tool_call_pending: { x: 310, y: 490 },
    executing_tool: { x: 310, y: 580 },
    tool_result_received: { x: 310, y: 670 },
    failed: { x: 310, y: 760 },
    interrupted: { x: 110, y: 760 },
    cancelled: { x: 110, y: 850 },
  };

  const BOX_W = 72; // half width
  const BOX_H = 32; // half height

  const EDGES: Array<{from: AgentSimulatorState, to: AgentSimulatorState}> = [
    { from: 'idle', to: 'input_queued' },
    { from: 'input_queued', to: 'processing_input' },
    { from: 'processing_input', to: 'context_updated' },
    { from: 'context_updated', to: 'calling_llm' },
    { from: 'calling_llm', to: 'reasoning' },
    { from: 'calling_llm', to: 'streaming_response' },
    { from: 'reasoning', to: 'streaming_response' },
    { from: 'calling_llm', to: 'tool_call_pending' },
    { from: 'reasoning', to: 'tool_call_pending' },
    { from: 'streaming_response', to: 'done' },
    { from: 'tool_call_pending', to: 'executing_tool' },
    { from: 'executing_tool', to: 'tool_result_received' },
    { from: 'tool_result_received', to: 'context_updated' },
    { from: 'executing_tool', to: 'failed' },
    { from: 'failed', to: 'executing_tool' },
  ];

  if (nextState && nextState !== currentState && !EDGES.some(e => e.from === currentState && e.to === nextState)) {
      EDGES.push({ from: currentState, to: nextState });
  }

  function getPath(from: AgentSimulatorState, to: AgentSimulatorState) {
    const p1 = NODES[from];
    const p2 = NODES[to];
    if (!p1 || !p2) return '';

    if (from === 'tool_result_received' && to === 'context_updated') {
      return `M ${p1.x + BOX_W} ${p1.y} L 400 ${p1.y} L 400 ${p2.y} L ${p2.x + BOX_W + 8} ${p2.y}`;
    }
    if (from === 'failed' && to === 'executing_tool') {
      return `M ${p1.x + BOX_W} ${p1.y} L 400 ${p1.y} L 400 ${p2.y} L ${p2.x + BOX_W + 8} ${p2.y}`;
    }

    if (p1.x === p2.x) {
      if (Math.abs(p2.y - p1.y) > 100) {
        if (p1.x < 200) {
            return `M ${p1.x - BOX_W} ${p1.y} L 20 ${p1.y} L 20 ${p2.y} L ${p2.x - BOX_W - 8} ${p2.y}`;
        } else {
            return `M ${p1.x + BOX_W} ${p1.y} L 400 ${p1.y} L 400 ${p2.y} L ${p2.x + BOX_W + 8} ${p2.y}`;
        }
      } else {
        if (p1.y < p2.y) {
          return `M ${p1.x} ${p1.y + BOX_H} L ${p2.x} ${p2.y - BOX_H - 8}`;
        } else {
          return `M ${p1.x} ${p1.y - BOX_H} L ${p2.x} ${p2.y + BOX_H + 8}`;
        }
      }
    } else {
      // cross columns
      if (p1.x < p2.x) {
        return `M ${p1.x + BOX_W} ${p1.y} L 210 ${p1.y} L 210 ${p2.y} L ${p2.x - BOX_W - 8} ${p2.y}`;
      } else {
        return `M ${p1.x - BOX_W} ${p1.y} L 210 ${p1.y} L 210 ${p2.y} L ${p2.x + BOX_W + 8} ${p2.y}`;
      }
    }
  }

  const StateBox = ({ id, label, step, highlight }: { id: AgentSimulatorState, label: string, step?: string, highlight?: string }) => {
    const active = isActive(id);
    const coords = NODES[id];
    
    let containerClass = "bg-zinc-900 border-zinc-800 opacity-60";
    let textClass = "text-zinc-500";
    let stepClass = "bg-zinc-800 text-zinc-400 border-zinc-700";
    
    if (active) {
        if (highlight === 'indigo') {
          containerClass = 'bg-indigo-500/10 border-indigo-500 border-2 shadow-[0_0_30px_rgba(99,102,241,0.2)] z-10 scale-105';
          textClass = 'text-indigo-400 font-bold';
          stepClass = 'bg-indigo-500 text-white font-bold tracking-widest';
        } else if (highlight === 'amber') {
          containerClass = 'bg-amber-500/10 border-amber-500 border-2 shadow-[0_0_30px_rgba(245,158,11,0.2)] z-10 scale-105';
          textClass = 'text-amber-400 font-bold';
          stepClass = 'bg-amber-500 text-amber-950 font-bold tracking-widest';
        } else {
          containerClass = 'bg-zinc-800 border-zinc-600 shadow-md z-10 scale-105 opacity-100';
          textClass = 'text-zinc-200 font-bold';
        }
    }

    return (
      <div 
        className={`absolute w-36 h-16 -ml-[72px] -mt-[32px] rounded flex flex-col items-center justify-center border transition-all duration-300 ${containerClass}`}
        style={{ left: coords.x, top: coords.y }}
      >
        {step && (
          <div className={`absolute -top-2.5 px-2 py-0.5 rounded text-[8px] uppercase ${stepClass} whitespace-nowrap`}>
            {active ? 'ACTIVE' : step}
          </div>
        )}
        <div className={`text-[10px] font-mono tracking-wider uppercase ${textClass}`}>
          {label}
        </div>
        {active && highlight === 'indigo' && (
          <div className="flex gap-1 mt-[4px] absolute bottom-1.5">
            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse [animation-delay:200ms]"></div>
            <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse [animation-delay:400ms]"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center w-full my-auto outline-none">
      <div className="relative w-[420px] h-[900px]">
        {/* SVG layer for arrows */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
             <marker id="arrow-zinc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-700" />
             </marker>
             <marker id="arrow-indigo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-indigo-400" />
             </marker>
          </defs>

          {EDGES.map((edge, i) => {
             const path = getPath(edge.from, edge.to);
             if (!path) return null;
             const isNext = edge.from === currentState && edge.to === nextState;
             const activePathColor = "stroke-indigo-400";
             const inactivePathColor = "stroke-zinc-700/50";
             const activeMarker = "url(#arrow-indigo)";
             const inactiveMarker = "url(#arrow-zinc)";

             return (
               <path 
                 key={`${edge.from}-${edge.to}-${i}`} 
                 d={path} 
                 strokeWidth="2" 
                 strokeDasharray="4 4" 
                 fill="none"
                 className={`transition-all duration-300 ${isNext ? `${activePathColor} animate-path-flow drop-shadow-[0_0_5px_rgba(129,140,248,0.8)]` : inactivePathColor}`}
                 markerEnd={isNext ? activeMarker : inactiveMarker}
               />
             );
          })}
        </svg>

        {/* Nodes Layer */}
        <StateBox id="idle" label="Idle" step="00 / M_IDLE" />
        <StateBox id="input_queued" label="Input Queued" step="01 / INPUT" />
        <StateBox id="processing_input" label="Processing" />
        <StateBox id="context_updated" label="Context Upd" />
        <StateBox id="calling_llm" label="Calling LLM" highlight="indigo" step="02 / ENGINE" />
        <StateBox id="reasoning" label="Reasoning" highlight="indigo" />
        <StateBox id="streaming_response" label="Streaming" highlight="indigo" />
        <StateBox id="done" label="Done" />
        
        <StateBox id="tool_call_pending" label="Tool Pending" highlight="amber" step="03 / TOOLS" />
        <StateBox id="executing_tool" label="Executing" highlight="amber" />
        <StateBox id="tool_result_received" label="Result Rx" highlight="amber" />
        <StateBox id="failed" label="Failed" step="ERR / FAIL" />
        
        <StateBox id="interrupted" label="Interrupted" step="WRN / INT" />
        <StateBox id="cancelled" label="Cancelled" step="STOP / CXL" />
      </div>
    </div>
  );
}
