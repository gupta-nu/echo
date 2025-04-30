import { useDrop } from "react-dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import TaskItem from "./TaskItem";

const CategoryColumn = ({
  quadrant,
  title,
  color,
  tasks,
  moveTask,
  toggleComplete,
  startEditing,
  updateTask,
  onDelete,
  addNewTask
}) => {
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

  // Define colors for different quadrants
  const getQuadrantColors = () => {
    const colorMap = {
      1: { bg: "from-blue-500 to-indigo-600", headerBg: "bg-gradient-to-r from-blue-500 to-indigo-600" },
      2: { bg: "from-green-500 to-teal-600", headerBg: "bg-gradient-to-r from-green-500 to-teal-600" },
      3: { bg: "from-yellow-500 to-amber-600", headerBg: "bg-gradient-to-r from-yellow-500 to-amber-600" },
      4: { bg: "from-red-500 to-rose-600", headerBg: "bg-gradient-to-r from-red-500 to-rose-600" }
    };
    
    return colorMap[quadrant] || colorMap[1];
  };

  const colors = getQuadrantColors();

  return (
    <motion.div
      ref={drop}
      className={`rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${
        isOver ? "ring-2 ring-blue-300 shadow-xl" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: "400px",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className={`${colors.headerBg} p-3 text-white flex justify-between items-center`}>
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Task List */}
      <div className="p-4 flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <p>No tasks yet</p>
            <p className="text-xs">Drag tasks here or add a new one</p>
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
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Task Button */}
      <div className="p-3 border-t border-gray-200">
        <button 
          className="w-full py-2 px-3 text-sm flex items-center justify-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          onClick={() => {
            // Assuming you have or will implement an addNewTask function
            if (typeof addNewTask === 'function') {
              addNewTask(quadrant);
            } else {
              console.warn('addNewTask function is not provided to CategoryColumn');
            }
          }}
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>
    </motion.div>
  );
};

export default CategoryColumn;