import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { useRef } from "react";

const TaskItem = ({ 
  task, 
  index, 
  quadrant, 
  moveTask, 
  toggleComplete, 
  startEditing, 
  updateTask 
}) => {
  const ref = useRef(null);

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
      
      className={`p-1.5 text-xs bg-gray-100 border border-gray-200 rounded-md shadow-xs flex items-center transition-all duration-150 cursor-pointer ${
        task.completed ? "line-through text-gray-400" : ""
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={() => toggleComplete(quadrant, index)}
      onDoubleClick={() => startEditing(quadrant, index, task.text)}
    >
      <span className="mr-1 text-xs">→</span>
      {task.editing ? (
        <input
          type="text"
          className="flex-1 text-xs border border-gray-200 rounded-sm px-1"
          value={task.text}
          onChange={(e) => updateTask(quadrant, index, e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startEditing(quadrant, index, null)}
          onBlur={() => startEditing(quadrant, index, null)}
          autoFocus
        />
      ) : (
        <div className="flex flex-col">
          <div className="font-medium">{task.text}</div>
          {task.times && (
             <div className="text-[18px] text-gray-500">{task.times}</div>
          )}
        </div>
      )}
    </motion.li>
  );
};

export default TaskItem;