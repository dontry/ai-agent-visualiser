import { Play, Pause, StepForward, StepBack, Square, RotateCcw, MousePointerClick, MessageSquare, AlertTriangle, XCircle, RefreshCcw, Braces } from 'lucide-react';
import { useSimulator } from './hooks/useSimulator';
import { scenarios } from './data/scenarios';
import { Flowchart } from './components/Flowchart';
import { ContextStack } from './components/ContextStack';
import { ExternalEnv } from './components/ExternalEnv';
import { Timeline } from './components/Timeline';
import { PayloadModal } from './components/PayloadModal';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const sim = useSimulator();
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header Navigation */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-sm shrink-0 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase font-bold">Agent Runtime / Visualizer</span>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-md px-3 py-1.5">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Scenario:</span>
          <select
            className="bg-transparent text-xs text-zinc-200 outline-none cursor-pointer border-none p-0 focus:ring-0"
            value={sim.scenarioId}
            onChange={(e) => sim.selectScenario(e.target.value)}
          >
            {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex flex-row items-center gap-4 border border-zinc-800 bg-zinc-900/50 rounded-md px-3 py-1.5">
           <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Speed:</span>
           <select
            className="bg-transparent text-xs text-zinc-200 outline-none cursor-pointer border-none p-0 focus:ring-0"
            value={sim.speed}
            onChange={(e) => sim.setSpeed(Number(e.target.value))}
          >
            <option value={2000}>Slow</option>
            <option value={1000}>Normal</option>
            <option value={500}>Fast</option>
          </select>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-12 relative z-10">
        
        {/* Left: User Events */}
        <aside className="col-span-3 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-6 z-10">
          <div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Event Injector</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => sim.sendTask(sim.scenarioId)} className="w-full text-left px-3 py-2.5 rounded border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-xs transition-colors group flex items-center justify-between">
                <span>Send Task Message</span>
                <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400">+T</span>
              </button>
              <button onClick={() => sim.sendFollowUp("Also, include react-dom.")} className="w-full text-left px-3 py-2.5 rounded border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-xs transition-colors group flex items-center justify-between">
                <span>Follow-up Message</span>
                <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400">+F</span>
              </button>
              <button onClick={() => sim.interrupt()} className="w-full text-left px-3 py-2.5 rounded border border-rose-900/30 bg-rose-950/10 hover:bg-rose-950/20 text-xs text-rose-400 transition-colors group flex items-center justify-between">
                <span>Interrupt Current Run</span>
                <span className="text-[10px] font-mono text-rose-900 group-hover:text-rose-500">ESC</span>
              </button>
              <button onClick={() => sim.cancel()} className="w-full text-left px-3 py-2.5 rounded border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-xs transition-colors group flex items-center justify-between">
                <span>Cancel Task</span>
                <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400">DEL</span>
              </button>
              <button onClick={() => sim.correction("Actually, correct the filename.")} className="w-full text-left px-3 py-2.5 rounded border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-xs transition-colors group flex items-center justify-between">
                <span>Correction Message</span>
                <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400">^C</span>
              </button>
            </div>
          </div>

          <div className="mt-8 flex-1 flex flex-col min-h-0 relative">
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex flex-col h-full">
              <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-tighter flex justify-between shrink-0">
                <span>Active Event Queue</span>
                <span className="text-indigo-400">{sim.simulatorState.inputQueue.length} item(s)</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 relative no-scrollbar">
                <AnimatePresence>
                  {sim.simulatorState.inputQueue.map(q => (
                    <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="text-[10px] font-mono text-indigo-400 break-all p-2 bg-black/40 border border-zinc-800/80 rounded">
                      {q.message}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {sim.simulatorState.inputQueue.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-[10px] uppercase font-mono italic">
                    Queue empty
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Runtime Engine State Machine */}
        <main className="col-span-5 bg-zinc-950 relative overflow-hidden flex flex-col border-r border-zinc-800 min-h-0">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid-pattern"></div>
          
          <AnimatePresence>
            {sim.pendingEvents[0]?.type === "WAIT_FOR_USER" && (sim.pendingEvents[0] as any).action === "APPROVE" && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 bg-emerald-950/80 border border-emerald-500/50 rounded-full flex items-center gap-3 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Human Approval Required</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto relative z-10 flex flex-col no-scrollbar pb-12 pt-6">
            <Flowchart currentState={sim.simulatorState.agentState} pendingEvents={sim.pendingEvents} />
          </div>
        </main>

        {/* Right: External Systems & Context */}
        <aside className="col-span-4 bg-zinc-950 flex flex-col min-h-0 z-10">
          {/* Targets */}
          <div className="p-4 border-b border-zinc-800 shrink-0">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">External Interfaces</h3>
            <ExternalEnv state={sim.simulatorState.agentState} activeTool={sim.simulatorState.activeTool} streamBuffer={sim.simulatorState.streamBuffer} reasoningBuffer={sim.simulatorState.reasoningBuffer} />
          </div>

          {/* Context Window */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-0 gap-4">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Context Window</h3>
              <button 
                onClick={() => setIsPayloadModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded text-[9px] uppercase font-bold tracking-widest transition-colors shadow-sm">
                <Braces size={10} />
                Inspect Payload
              </button>
            </div>

            {/* System Prompt */}
            <div className="shrink-0 flex flex-col gap-2">
              <div className="p-3 bg-black/20 border border-zinc-800/80 border-l-2 border-l-purple-500/50 rounded-r-lg shadow-sm">
                <div className="flex justify-between mb-1.5 items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-purple-400">
                    Agent Core Directives
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar pr-2 font-mono whitespace-pre-wrap">
You are an autonomous AI orchestration agent.

Goals:
1. Parse instructions and resolve intent.
2. Formulate execution plans using tools.
3. Emit single actions and wait for results.
4. Keep user communication strictly functional.

[SYSTEM: Tool schemas injected automatically]
                </div>
              </div>
            </div>

            {/* Message Stack */}
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 shrink-0">Message History ({sim.simulatorState.contextStack.length})</h3>
              <div className="flex-1 overflow-y-auto no-scrollbar pb-4 shadow-[inset_0_-20px_20px_-20px_rgba(0,0,0,0.8)]">
                 <ContextStack stack={sim.simulatorState.contextStack} />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom: Playback & Timeline */}
      <footer className="h-28 border-t border-zinc-800 bg-zinc-950 flex p-4 gap-6 shrink-0 z-20 relative shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <PayloadModal isOpen={isPayloadModalOpen} onClose={() => setIsPayloadModalOpen(false)} stack={sim.simulatorState.contextStack} />
        <div className="flex flex-col justify-center gap-2 items-center px-4 w-64 border-r border-zinc-800/50">
          <div className="flex gap-1.5">
            <button disabled={sim.isPlaying || sim.history.length === 0 || (sim.pendingEvents[0]?.type === "WAIT_FOR_USER" && (sim.pendingEvents[0] as any).action === "APPROVE")} onClick={() => sim.stepBack()} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 border border-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-all disabled:cursor-not-allowed">
               <StepBack size={18}/>
            </button>
            <button disabled={sim.isPlaying || sim.pendingEvents.length === 0 || (sim.pendingEvents[0]?.type === "WAIT_FOR_USER" && (sim.pendingEvents[0] as any).action === "APPROVE")} onClick={() => sim.play()} className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-30 disabled:shadow-none disabled:hover:bg-indigo-600 disabled:cursor-not-allowed">
               <Play fill="currentColor" size={18} className="translate-x-[1px]"/>
            </button>
            <button disabled={!sim.isPlaying} onClick={() => sim.pause()} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 border border-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-all disabled:cursor-not-allowed">
               <Pause fill="currentColor" size={18}/>
            </button>
            <button disabled={sim.isPlaying || sim.pendingEvents.length === 0 || (sim.pendingEvents[0]?.type === "WAIT_FOR_USER" && (sim.pendingEvents[0] as any).action === "APPROVE")} onClick={() => sim.step()} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 border border-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-all disabled:cursor-not-allowed">
               <StepForward size={18}/>
            </button>
            <button disabled={sim.history.length === 0 && !sim.isPlaying} onClick={() => sim.stop()} className="w-10 h-10 rounded-full bg-rose-900/20 hover:bg-rose-900/40 flex items-center justify-center text-rose-400 border border-rose-900/50 disabled:opacity-30 disabled:hover:bg-rose-900/20 transition-all disabled:cursor-not-allowed">
               <Square fill="currentColor" size={14}/>
            </button>
          </div>
          {sim.simulatorState.failureReason && sim.pendingEvents[0]?.action === "RETRY" && (
            <div className="flex gap-1 justify-center mt-1">
              <button onClick={() => sim.retry()} className="px-3 py-1 bg-zinc-900 border border-rose-900 text-[10px] rounded text-rose-400 hover:bg-rose-900/20 hover:text-rose-300 uppercase tracking-widest transition-colors font-bold">Retry Operation</button>
            </div>
          )}
          {sim.pendingEvents[0]?.type === "WAIT_FOR_USER" && sim.pendingEvents[0]?.action === "APPROVE" && (
            <div className="flex gap-1 justify-center mt-1">
              <button onClick={() => sim.approve()} className="px-3 py-1 bg-emerald-900/20 border border-emerald-900/50 text-[10px] rounded text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-300 uppercase tracking-widest transition-colors font-bold shadow-[0_0_10px_rgba(52,211,153,0.2)]">Approve Tool Call</button>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center px-4">
          <div className="flex justify-between text-[10px] text-zinc-600 uppercase tracking-widest mb-3 px-2">
            <span>Runtime Execution Timeline</span>
            <span className="text-indigo-500">Step {sim.history.length} of {sim.history.length + sim.pendingEvents.length}</span>
          </div>
          
          <Timeline history={sim.history} pendingEvents={sim.pendingEvents} />
          
          <div className="flex justify-between mt-2 pt-1 px-2 border-t border-zinc-900/50">
            <span className="text-[9px] font-mono text-zinc-500">START</span>
            <AnimatePresence mode="wait">
              <motion.span key={sim.simulatorState.agentState} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest">
                {sim.simulatorState.agentState} (ACTIVE)
              </motion.span>
            </AnimatePresence>
            <span className="text-[9px] font-mono text-zinc-500">END</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
