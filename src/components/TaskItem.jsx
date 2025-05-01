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
  
  // Define task item styles based on quadrant number
  const getQuadrantStyles = (quadrantNumber) => {
    const styles = {
      1: {
        background: "bg-gradient-to-r from-blue-100 to-indigo-100",
        border: "border-l-4 border-l-blue-500",
        activeColor: "text-blue-500"
      },
      2: {
        background: "bg-gradient-to-r from-green-100 to-teal-100",
        border: "border-l-4 border-l-green-500",
        activeColor: "text-green-500"
      },
      3: {
        background: "bg-gradient-to-r from-yellow-100 to-amber-100",
        border: "border-l-4 border-l-yellow-500",
        activeColor: "text-yellow-600"
      },
      4: {
        background: "bg-gradient-to-r from-red-100 to-rose-100",
        border: "border-l-4 border-l-red-500",
        activeColor: "text-red-500"
      }
    };
    
    return styles[quadrantNumber] || styles[1];
  };
  
  // Use the actual quadrant number to determine styling
  const quadrantStyles = getQuadrantStyles(quadrant);
  
  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { index, quadrant },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Set up drop functionality
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
      item.quadrant = hoverQuadrant; // Update the quadrant when moving between columns
    },
  });
  
  // Connect drag and drop refs
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
      className={`p-3 mb-2 rounded-lg shadow-sm transition-all duration-150 
        ${quadrantStyles.background} ${quadrantStyles.border}
        ${task.completed ? "opacity-75" : ""} 
        ${isDragging ? "opacity-50 shadow-lg" : ""}`}
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
            <CheckCircle size={16} className={quadrantStyles.activeColor} />
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
              className={`p-1 text-gray-400 hover:${quadrantStyles.activeColor} transition-colors rounded-full hover:bg-white hover:bg-opacity-40`}
            >
              <Edit size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(quadrant, index);
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-white hover:bg-opacity-40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.li>
  );
};

export default TaskItem;