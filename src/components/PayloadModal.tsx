import { X } from 'lucide-react';
import { MessageCard } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export function PayloadModal({ isOpen, onClose, stack }: { isOpen: boolean, onClose: () => void, stack: MessageCard[] }) {
  const payload = {
    model: "gemini-1.5-pro",
    system_instruction: {
      parts: [
        {
          text: "You are an autonomous AI orchestration agent.\n\nGoals:\n1. Parse instructions and resolve intent.\n2. Formulate execution plans using tools.\n3. Emit single actions and wait for results.\n4. Keep user communication strictly functional.\n\n[SYSTEM: Tool schemas injected automatically]"
        }
      ]
    },
    contents: stack.map(msg => {
      const parts = [];
      if (msg.reasoning) {
        parts.push({ text: msg.reasoning });
      }
      if (msg.content && msg.content.trim().length > 0) {
        parts.push({ text: msg.content });
      }
      if (parts.length === 0) {
        parts.push({ text: "" });
      }
      
      return {
        role: msg.role === 'tool' ? 'function' : msg.role,
        ...(msg.name ? { name: msg.name } : {}),
        parts
      };
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-3xl h-[80vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></div>
                <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Active Model Payload</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[#0a0a0c] custom-scrollbar relative">
              <pre className="text-[11px] font-mono leading-relaxed text-indigo-300/80 break-all whitespace-pre-wrap">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </div>
            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/80 flex justify-between items-center shrink-0">
               <div className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                 Estimated Token Count:{' '}
                 <span className="text-zinc-300 font-bold tracking-widest bg-zinc-800 px-2 py-0.5 rounded">
                   ~{Math.round(JSON.stringify(payload).length / 4)}
                 </span>
               </div>
               <button onClick={onClose} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-[10px] uppercase font-bold tracking-widest rounded transition-colors group flex items-center gap-2">
                 Close View
                 <div className="w-4 h-4 rounded bg-zinc-700 group-hover:bg-zinc-600 flex items-center justify-center text-[9px] text-zinc-400">Esc</div>
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
