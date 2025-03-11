import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";

const TaskItem = ({ task, index, quadrant, moveTask, toggleComplete, startEditing, updateTask }) => {
  const ref = React.useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { index, quadrant },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "TASK",
    hover: (item, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      const dragQuadrant = item.quadrant;
      const hoverQuadrant = quadrant;

      if (dragIndex === hoverIndex && dragQuadrant === hoverQuadrant) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveTask(dragQuadrant, dragIndex, hoverQuadrant, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  if (!task) return null;

  return (
    <motion.li
      ref={ref}
      className={`p-1 text-xs bg-gray-50 text-black border border-gray-300 rounded-lg shadow-sm flex items-center transition-all duration-200 cursor-pointer ${
        task.completed ? "line-through text-gray-400" : ""
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={() => toggleComplete(quadrant, index)}
      onDoubleClick={() => startEditing(quadrant, index, task.text)}
    >
      <span className="mr-2 text-sm">→</span>
      {task.editing ? (
        <input
          type="text"
          className="text-xs border border-gray-300 rounded-md px-1"
          value={task.text}
          onChange={(e) => updateTask(quadrant, index, e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startEditing(quadrant, index, null)}
          onBlur={() => startEditing(quadrant, index, null)}
          autoFocus
        />
      ) : (
        <div className="flex items-center">
          <span>{task.text}</span>
          {task.isTimeBlocked && (
            <span className="ml-2 text-xs text-gray-500">
              {task.timeSlots.map((h) => `${h % 12 || 12}${h >= 12 ? "pm" : "am"}`).join(", ")}
            </span>
          )}
        </div>
      )}
    </motion.li>
  );
};

export default TaskItem;