import { useDrop } from "react-dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import TaskItem from "./TaskItem";

const QUADRANT_THEME = {
  urgentImportant: {
    dot: "bg-red-500",
    dropHighlight: "ring-red-300 dark:ring-red-500/30",
    addBtn: "hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500",
    emptyIcon: "text-red-200 dark:text-red-500/20",
  },
  notUrgentImportant: {
    dot: "bg-blue-500",
    dropHighlight: "ring-blue-300 dark:ring-blue-500/30",
    addBtn: "hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500",
    emptyIcon: "text-blue-200 dark:text-blue-500/20",
  },
  urgentNotImportant: {
    dot: "bg-amber-500",
    dropHighlight: "ring-amber-300 dark:ring-amber-500/30",
    addBtn: "hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-500",
    emptyIcon: "text-amber-200 dark:text-amber-500/20",
  },
  notUrgentNotImportant: {
    dot: "bg-emerald-500",
    dropHighlight: "ring-emerald-300 dark:ring-emerald-500/30",
    addBtn: "hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500",
    emptyIcon: "text-emerald-200 dark:text-emerald-500/20",
  },
};

const CategoryColumn = ({
  quadrant,
  title,
  tasks,
  moveTask,
  toggleComplete,
  startEditing,
  updateTask,
  onDelete,
  addNewTask,
  isDarkMode,
}) => {
  const theme = QUADRANT_THEME[quadrant] || QUADRANT_THEME.urgentImportant;

  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop(item) {
      if (item.quadrant !== quadrant) {
        moveTask(item.quadrant, item.index, quadrant, tasks.length);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <motion.div
      ref={drop}
      className={`rounded-2xl overflow-hidden flex flex-col transition-all duration-200 ${
        isDarkMode
          ? "bg-[rgb(44,44,46)] border border-[rgb(58,58,60)]"
          : "bg-white border border-[rgb(229,229,234)] shadow-sm"
      } ${isOver ? `ring-2 ${theme.dropHighlight}` : ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      style={{ minHeight: "320px" }}
    >
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${
        isDarkMode ? "border-[rgb(58,58,60)]" : "border-[rgb(242,242,247)]"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${theme.dot}`} />
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        </div>
        <span
          className={`text-xs font-medium tabular-nums px-2 py-0.5 rounded-full ${
            isDarkMode ? "bg-white/5 text-white/40" : "bg-black/[0.04] text-black/35"
          }`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="p-3 flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              isDarkMode ? "bg-white/5" : "bg-black/[0.03]"
            }`}>
              <Plus size={18} className={isDarkMode ? "text-white/15" : "text-black/15"} />
            </div>
            <p className={`text-xs ${isDarkMode ? "text-white/25" : "text-black/25"}`}>
              No tasks yet
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                quadrant={quadrant}
                moveTask={moveTask}
                toggleComplete={toggleComplete}
                startEditing={startEditing}
                updateTask={updateTask}
                onDelete={onDelete}
                isDarkMode={isDarkMode}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Task */}
      <div className={`px-3 pb-3`}>
        <button
          className={`w-full py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 rounded-xl transition-colors ${
            isDarkMode
              ? "bg-white/5 hover:bg-white/10 text-white/50"
              : "bg-black/[0.03] hover:bg-black/[0.06] text-black/40"
          }`}
          onClick={() => addNewTask?.(quadrant)}
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>
    </motion.div>
  );
};

export default CategoryColumn;