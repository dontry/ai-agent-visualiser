import { RuntimeEvent } from '../types';

export function Timeline({ history, pendingEvents }: { history: RuntimeEvent[], pendingEvents: RuntimeEvent[] }) {
  const allEvents = [...history, ...pendingEvents];
  const currentIndex = history.length === 0 ? -1 : history.length - 1;
  const progressPercent = allEvents.length > 1 ? Math.max(0, currentIndex / (allEvents.length - 1)) * 100 : 0;

  return (
    <div className="relative h-12 flex items-center group w-full">
      {/* Timeline bar background */}
      <div className="absolute w-full h-0.5 bg-zinc-800"></div>
      {/* Progress */}
      <div className="absolute h-0.5 bg-indigo-500" style={{ width: `${progressPercent}%`, transition: 'width 0.3s ease' }}></div>
      
      <div className="relative w-full flex justify-between px-0.5 items-center">
        {allEvents.map((ev, i) => {
          const isPast = i < currentIndex;
          const isCurrent = i === currentIndex;
          
          let nodeClass = "w-3 h-3 rounded-full bg-zinc-800 border-4 border-zinc-950 ring-1 ring-zinc-700 cursor-pointer transition-all";
          if (isPast) {
            nodeClass = "w-3 h-3 rounded-full bg-indigo-500 border-4 border-zinc-950 ring-1 ring-indigo-500 cursor-pointer transition-all";
          } else if (isCurrent) {
            nodeClass = "w-5 h-5 -mt-1 rounded-full bg-white border-4 border-indigo-600 shadow-[0_0_10px_rgba(255,255,255,0.4)] cursor-pointer transition-all";
          }

          return (
            <div key={i} className="relative group/node flex items-center justify-center">
              <div className={nodeClass} />
              {/* Tooltip */}
              <div className="absolute bottom-8 opacity-0 group-hover/node:opacity-100 transition-opacity bg-zinc-800 text-[10px] text-zinc-300 font-mono px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50 border border-zinc-700 shadow-xl">
                {ev.type}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
