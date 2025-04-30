import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { useRef } from "react";
import { Trash2, Circle, CheckCircle, Edit } from "lucide-react";

const TaskItem = ({
  task,
  index,
  quadrant,
  moveTask,
  toggleComplete,
  startEditing,
  updateTask,
  onDelete
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
  
  // Define the variants for task animation
  const taskVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -10 }
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    startEditing(quadrant, index, task.text);
  };
  
  return (
    <motion.li
      ref={ref}
      className={`p-3 mb-2 rounded-lg shadow-sm transition-all duration-150 ${
        task.completed ? "bg-gray-100" : "bg-white"
      } ${isDragging ? "opacity-50 shadow-lg" : ""} border ${
        task.completed ? "border-gray-200" : "border-gray-200 hover:border-blue-300"
      }`}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={taskVariants}
      transition={{ duration: 0.2 }}
      style={{
        backdropFilter: "blur(8px)",
        transform: isDragging ? "scale(1.02)" : "scale(1)",
      }}
    >
      <div className="flex items-center">
        {/* Status Icon */}
        <div 
          className="mr-2 cursor-pointer flex-shrink-0" 
          onClick={() => toggleComplete(quadrant, index)}
        >
          {task.completed ? (
            <CheckCircle size={16} className="text-green-500" />
          ) : (
            <Circle size={16} className="text-gray-400" />
          )}
        </div>
        
        {/* Task Content */}
        <div 
          className={`flex-1 flex items-center ${
            task.completed ? "text-gray-500" : "text-gray-800"
          }`}
          onClick={() => toggleComplete(quadrant, index)}
        >
          {task.editing ? (
            <input
              type="text"
              className="flex-1 text-sm border border-blue-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={task.text}
              onChange={(e) => updateTask(quadrant, index, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startEditing(quadrant, index, null)}
              onBlur={() => startEditing(quadrant, index, null)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex flex-col flex-1">
              <div className={`font-medium text-sm ${task.completed ? "line-through" : ""}`}>
                {task.text}
              </div>
              {task.times && (
                <div className="text-xs text-gray-500 mt-1">{task.times}</div>
              )}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex ml-2 space-x-1">
          {!task.editing && (
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-gray-100"
            >
              <Edit size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(quadrant, index);
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.li>
  );
};

export default TaskItem;