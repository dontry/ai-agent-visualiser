import { Database, FileText, Terminal, Search, Brain } from 'lucide-react';
import { AgentSimulatorState, ActiveTool } from '../types';

export function ExternalEnv({ state, activeTool, streamBuffer, reasoningBuffer }: { state: AgentSimulatorState, activeTool: ActiveTool | null, streamBuffer: string, reasoningBuffer: string }) {
  const isLLMActive = ['calling_llm', 'streaming_response', 'reasoning'].includes(state);
  
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className={`p-3 rounded border transition-all duration-300 ${isLLMActive ? 'border-indigo-500/30 bg-indigo-950/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-zinc-800 bg-zinc-900/30'}`}>
        <h3 className={`font-mono text-[10px] uppercase tracking-widest font-bold mb-2 flex items-center justify-between ${isLLMActive ? 'text-indigo-400' : 'text-zinc-500'}`}>
          <span className="flex items-center gap-1.5"><Database size={12} /> LLM_CORE</span>
          {state === 'calling_llm' ? <span className="animate-pulse text-[9px]">AWAITING...</span> : state === 'streaming_response' ? <span className="animate-pulse text-[9px]">STREAMING...</span> : state === 'reasoning' ? <span className="animate-pulse text-[9px] text-purple-400">REASONING...</span> : <span className="text-[9px] opacity-60">IDLE</span>}
        </h3>
        <div className="h-[60px] overflow-y-auto text-[10px] text-zinc-300 font-mono rounded bg-black/20 p-2 border border-zinc-800/30 break-words no-scrollbar">
          {state === 'reasoning' ? (reasoningBuffer || <span className="opacity-30">Generating thoughts...</span>) : (streamBuffer || <span className="opacity-30">No output</span>)}
          {(state === 'streaming_response' || state === 'reasoning') && <span className={`w-1.5 h-3 inline-block animate-pulse ml-1 align-middle ${state === 'reasoning' ? 'bg-purple-400' : 'bg-indigo-400'}`} />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ToolCard name="FILE_SYS" icon={<FileText size={12} />} activeTool={activeTool} state={state} />
        <ToolCard name="SHELL" icon={<Terminal size={12} />} activeTool={activeTool} state={state} />
        <ToolCard name="WEB_SEARCH" icon={<Search size={12} />} activeTool={activeTool} state={state} />
        <ToolCard name="MEMORY" icon={<Brain size={12} />} activeTool={activeTool} state={state} />
      </div>
    </div>
  );
}

function ToolCard({ name, icon, activeTool, state }: { name: string, icon: React.ReactNode, activeTool: ActiveTool | null, state: AgentSimulatorState }) {
  const isMatch = activeTool?.name === (name === 'FILE_SYS' ? 'File Tool' : name === 'SHELL' ? 'Shell Tool' : name === 'WEB_SEARCH' ? 'Search Tool' : 'Memory Tool');
  const isActive = isMatch && ['executing_tool', 'tool_result_received'].includes(state);
  
  return (
    <div className={`p-2 rounded text-center border transition-all duration-300 ${isActive ? 'border-amber-500/30 bg-amber-950/20' : 'border-zinc-800 bg-zinc-900 opacity-80'}`}>
      <div className="flex flex-col items-center justify-center gap-1">
         <div className={`text-[10px] font-bold flex items-center gap-1 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`}>
           {icon} {name}
         </div>
         <div className={`text-[9px] ${isActive ? 'text-amber-300/60' : 'text-zinc-600'}`}>
           {isActive ? 'ACTIVE' : 'READY'}
         </div>
      </div>
      {isActive && activeTool && activeTool.args && (
        <div className="mt-2 text-left">
          <div className="text-[9px] font-mono p-1.5 bg-black/40 rounded border border-amber-900/20 text-amber-200/70 truncate">
            {activeTool.args}
          </div>
        </div>
      )}
    </div>
  );
}
