import { motion, AnimatePresence } from 'motion/react';
import { MessageCard } from '../types';

export function ContextStack({ stack }: { stack: MessageCard[] }) {
  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {stack.map((msg) => {
          let borderClass = 'border-l-zinc-500';
          let textHeaderClass = 'text-zinc-400';
          
          if (msg.role === 'user') { borderClass = 'border-l-indigo-500'; textHeaderClass = 'text-indigo-400'; }
          if (msg.role === 'assistant') { borderClass = 'border-l-emerald-500'; textHeaderClass = 'text-emerald-400'; }
          if (msg.role === 'tool') { borderClass = 'border-l-amber-500'; textHeaderClass = 'text-amber-400'; }

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              layout
              className={`p-3 bg-zinc-900/60 border-l-2 ${borderClass} rounded-r-lg shadow-sm`}
            >
              <div className="flex justify-between mb-1 items-center">
                <span className={`text-[10px] font-bold uppercase tracking-wide ${textHeaderClass}`}>
                  {msg.role} {msg.name && <span className="opacity-70">({msg.name})</span>}
                </span>
              </div>
              {msg.reasoning && (
                <div className="mt-2 mb-1 p-2 bg-zinc-950/50 rounded border border-zinc-800 border-l-purple-500/50 border-l-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 block mb-1">Internal Thought Process</span>
                  <div className="text-[10px] font-mono text-zinc-400 leading-relaxed whitespace-pre-wrap break-words">{msg.reasoning}</div>
                </div>
              )}
              {msg.content && msg.content.trim().length > 0 && (
                <div className="mt-1 text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">{msg.content}</div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {stack.length === 0 && (
        <div className="py-4 flex items-center justify-center text-zinc-600 text-[10px] italic opacity-50 uppercase tracking-widest">
          Stack is empty
        </div>
      )}
    </div>
  );
}
