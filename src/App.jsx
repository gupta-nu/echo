import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const categories = {
  urgentImportant: { title: "Important and Urgent", color: "bg-white border-gray-300" },
  notUrgentImportant: { title: "Important but Not Urgent", color: "bg-white border-gray-300" },
  urgentNotImportant: { title: "Urgent but Not Important", color: "bg-white border-gray-300" },
  notUrgentNotImportant: { title: "Neither Important nor Urgent", color: "bg-white border-gray-300" },
};

const TaskItem = ({ task, index, quadrant, moveTask, toggleComplete, startEditing, updateTask }) => {
  if (!task) return null; // Early return if task is undefined

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { index, quadrant },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  });

  return (
    <motion.li
      ref={drag}
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              startEditing(quadrant, index, null); // Save and exit edit mode
            }
          }}
          onBlur={() => startEditing(quadrant, index, null)}
          autoFocus
        />
      ) : (
        task.text
      )}
    </motion.li>
  );
};

const CategoryColumn = ({ quadrant, title, color, tasks, moveTask, toggleComplete, startEditing, updateTask }) => {
  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item) => {
      // Only move if the dragged task is not in the same quadrant
      if (item.quadrant !== quadrant) {
        moveTask(item.quadrant, item.index, quadrant); // Move the task to the new quadrant
      }
    },
  });

  return (
    <div ref={drop} className={`p-2 rounded-xl border ${color} shadow-md min-h-[300px] flex flex-col`}>
      <h2 className="text-md font-semibold mb-1 text-gray-700">{title}</h2>
      <ul className="space-y-2 flex-1">
        <AnimatePresence>
          {tasks.map((task, index) => (
            <TaskItem
              key={task.id} // Fix key to be task.id
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

const App = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [task, setTask] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState("urgentImportant");
  const [tasks, setTasks] = useState({
    urgentImportant: [],
    notUrgentImportant: [],
    urgentNotImportant: [],
    notUrgentNotImportant: [],
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const addTask = () => {
    if (task.trim() === "") return;
    const newTask = {
      id: Date.now(), // Use timestamp as a unique ID
      text: task,
      completed: false,
      editing: false,
    };
    setTasks((prev) => ({
      ...prev,
      [selectedQuadrant]: [...prev[selectedQuadrant], newTask],
    }));
    setTask("");
  };

  const toggleComplete = (quadrant, index) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      newTasks[quadrant] = newTasks[quadrant].map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      );
      return newTasks;
    });
  };

  const startEditing = (quadrant, index, text) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      newTasks[quadrant] = newTasks[quadrant].map((task, i) =>
        i === index ? { ...task, editing: text !== null, text: text ?? task.text } : task
      );
      return newTasks;
    });
  };

  const updateTask = (quadrant, index, newText) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      newTasks[quadrant] = newTasks[quadrant].map((task, i) =>
        i === index ? { ...task, text: newText } : task
      );
      return newTasks;
    });
  };

  const clearCompletedTasks = () => {
    setTasks((prev) => {
      const newTasks = {};
      Object.keys(prev).forEach((key) => {
        newTasks[key] = prev[key].filter((task) => !task.completed);
      });
      return newTasks;
    });
  };

  const moveTask = (fromQuadrant, index, toQuadrant) => {
    console.log("Moving task", fromQuadrant, index, "to", toQuadrant);

    setTasks((prev) => {
      const newTasks = { ...prev };

      const movedTask = newTasks[fromQuadrant][index];
      if (!movedTask) {
        console.error("Task to move is not found!");
        return prev; // Do not update if task is not found
      }

      // Remove task from the source quadrant
      newTasks[fromQuadrant] = newTasks[fromQuadrant].filter((_, i) => i !== index);

      // Add task to the destination quadrant
      newTasks[toQuadrant] = [...newTasks[toQuadrant], movedTask];

      return newTasks;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date()); // Update the state every second
    }, 1000);

    return () => clearInterval(interval); // Cleanup the interval
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-6 font-['Noto Sans JP'] flex flex-col items-center">
        <div className="mt-0 mb-3 text-xs text-grey-700 font-mono tracking-wide font-['Noto Sans JP']">
          {dateTime.toLocaleString()} {/* Formats date & time nicely */}
        </div>
        <div className="w-full max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Echo!</h1>
            <div className="flex items-center justify-between flex-1 bg-white p-1 rounded-lg shadow-md border border-gray-300 w-[250px]">
              <input
                type="text"
                className="w-full p-1 border-none outline-none text-gray-800 text-xs"
                placeholder="Enter a new task, click on an existing task to mark it completed, and double-click to edit, drag and drop tasks from each category as needed"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={handleKeyDown} // Added handleKeyDown
              />
              <select
                className="p-1 border border-gray-300 rounded-md bg-white text-gray-700 text-xs"
                value={selectedQuadrant}
                onChange={(e) => setSelectedQuadrant(e.target.value)}
              >
                {Object.entries(categories).map(([key, { title }]) => (
                  <option key={key} value={key}>{title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {Object.entries(categories).map(([key, { title, color }]) => (
              <CategoryColumn
                key={key}
                quadrant={key}
                title={title}
                color={color}
                tasks={tasks[key]}
                moveTask={moveTask}
                toggleComplete={toggleComplete}
                startEditing={startEditing}
                updateTask={updateTask}
              />
            ))}
          </div>
          <button
            onClick={clearCompletedTasks}
            className="mt-6 text-xs px-3 py-1 bg-[#80011f] text-white rounded-lg hover:bg-red-700 transition duration-200 shadow-md font-semibold tracking-wide"
          >
            Clear Completed Tasks
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default App;
