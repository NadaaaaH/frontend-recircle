export const StepBadge = ({ step, active, completed }) => (
    <div
        className={`flex items-center gap-3 transition-all duration-500 ${active ? "scale-105" : "opacity-60"}`}
    >
        <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm
            ${completed ? "bg-emerald-500 text-white" : active ? "bg-slate-900 text-white" : "bg-gray-200 text-gray-500"}`}
        >
            {completed ? "✓" : step}
        </div>
    </div>
);
