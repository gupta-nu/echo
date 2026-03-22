import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { useRef } from "react";
import { Trash2, Circle, CheckCircle, Edit } from "lucide-react";

const QUADRANT_STYLES = {
  urgentImportant: {
    check: "text-red-500",
    editHover: "hover:text-red-500",
  },
  notUrgentImportant: {
    check: "text-blue-500",
    editHover: "hover:text-blue-500",
  },
  urgentNotImportant: {
    check: "text-amber-500",
    editHover: "hover:text-amber-500",
  },
  notUrgentNotImportant: {
    check: "text-emerald-500",
    editHover: "hover:text-emerald-500",
  },
};

const TaskItem = ({
  task,
  index,
  quadrant,
  moveTask,
  toggleComplete,
  startEditing,
  updateTask,
  onDelete,
  isDarkMode,
}) => {
  const ref = useRef(null);
  const styles = QUADRANT_STYLES[quadrant] || QUADRANT_STYLES.urgentImportant;

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { index, quadrant },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "TASK",
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      const dragQuadrant = item.quadrant;
      const hoverQuadrant = quadrant;

      if (dragIndex === hoverIndex && dragQuadrant === hoverQuadrant) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveTask(dragQuadrant, dragIndex, hoverQuadrant, hoverIndex);
      item.index = hoverIndex;
      item.quadrant = hoverQuadrant;
    },
  });

  drag(drop(ref));

  if (!task) return null;

  const handleEdit = (e) => {
    e.stopPropagation();
    startEditing(quadrant, index, task.text);
  };

  return (
    <motion.li
      ref={ref}
      className={`group p-2.5 mb-1.5 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150 ${
        isDarkMode
          ? "bg-white/[0.04] hover:bg-white/[0.07]"
          : "bg-black/[0.02] hover:bg-black/[0.04]"
      } ${task.completed ? "opacity-60" : ""} ${
        isDragging ? "opacity-40 scale-[1.02] shadow-lg" : ""
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      layout
    >
      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <button
          className={`mt-0.5 flex-shrink-0 transition-colors ${
            task.completed
              ? styles.check
              : isDarkMode
              ? "text-white/20 hover:text-white/40"
              : "text-black/15 hover:text-black/30"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleComplete(quadrant, index);
          }}
        >
          {task.completed ? (
            <CheckCircle size={18} />
          ) : (
            <Circle size={18} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {task.editing ? (
            <input
              type="text"
              className={`w-full text-sm px-2 py-1 rounded-lg border outline-none transition-colors ${
                isDarkMode
                  ? "bg-[rgb(58,58,60)] border-[rgb(72,72,74)] text-white focus:border-blue-500"
                  : "bg-white border-[rgb(229,229,234)] text-[rgb(28,28,30)] focus:border-blue-500"
              }`}
              value={task.text}
              onChange={(e) => updateTask(quadrant, index, e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && startEditing(quadrant, index, null)
              }
              onBlur={() => startEditing(quadrant, index, null)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex flex-col">
              <span
                className={`text-sm leading-snug ${
                  task.completed ? "line-through" : ""
                } ${
                  isDarkMode ? "text-white/80" : "text-[rgb(28,28,30)]"
                }`}
                onDoubleClick={handleEdit}
              >
                {task.text}
              </span>
              {task.times && (
                <span
                  className={`text-[11px] mt-0.5 ${
                    isDarkMode ? "text-white/25" : "text-black/30"
                  }`}
                >
                  {task.times}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {!task.editing && (
            <button
              onClick={handleEdit}
              className={`p-1 rounded-md transition-colors ${
                isDarkMode
                  ? "text-white/20 hover:text-white/60 hover:bg-white/5"
                  : "text-black/15 hover:text-black/50 hover:bg-black/[0.04]"
              }`}
            >
              <Edit size={13} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(quadrant, index);
            }}
            className={`p-1 rounded-md transition-colors ${
              isDarkMode
                ? "text-white/20 hover:text-red-400 hover:bg-red-500/10"
                : "text-black/15 hover:text-red-500 hover:bg-red-50"
            }`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.li>
  );
};

export default TaskItem;