import { useDrop } from "react-dnd";
import { motion, AnimatePresence } from "framer-motion";
import TaskItem from "./TaskItem";

const CategoryColumn = ({
  quadrant,
  title,
  color,
  tasks,
  moveTask,
  toggleComplete,
  startEditing,
  updateTask
}) => {
  const [, drop] = useDrop({
    accept: "TASK",
    drop(item) {
      if (item.quadrant !== quadrant) {
        moveTask(item.quadrant, item.index, quadrant, tasks.length);
      }
    },
  });

  return (
    <div 
      ref={drop}
      className={`p-2 rounded-xl border-2 ${color} shadow-lg min-h-[300px] flex flex-col`}
    >
      <h2 className="text-sm font-semibold mb-1 text-gray-700">{title}</h2>
      <ul className="space-y-1 flex-1">
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
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default CategoryColumn;