import React from "react";
import { useDrop } from "react-dnd";
import TaskItem from "./TaskItem";

const CategoryColumn = ({ quadrant, title, color, tasks, moveTask, toggleComplete, startEditing, updateTask }) => {
  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item) => {
      if (item.quadrant !== quadrant) {
        moveTask(item.quadrant, item.index, quadrant, tasks.length);
      }
    },
  });

  return (
    <div ref={drop} className={`p-1.5 rounded-xl border ${color} shadow-md min-h-[300px] flex flex-col`}>
      <h2 className="text-md font-semibold text-gray-700">{title}</h2>
      <ul className="space-y-0 flex-1">
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
      </ul>
    </div>
  );
};

export default CategoryColumn;