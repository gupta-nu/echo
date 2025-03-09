import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const categories = {
  urgentImportant: { title: "Critical and Immediate", color: "bg-white border-gray-300" },
  notUrgentImportant: { title: "Important but not urgent", color: "bg-white border-gray-300" },
  urgentNotImportant: { title: "Critial and Shallow tasks", color: "bg-white border-gray-300" },
  notUrgentNotImportant: { title: "low Priority Tasks", color: "bg-white border-gray-300" },
};

const TaskItem = ({ task, index, quadrant, moveTask, toggleComplete, startEditing, updateTask }) => {
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

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragQuadrant === hoverQuadrant) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // Time to actually perform the action
      moveTask(dragQuadrant, dragIndex, hoverQuadrant, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
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
        task.text
      )}
    </motion.li>
  );
};

const CategoryColumn = ({ quadrant, title, color, tasks, moveTask, toggleComplete, startEditing, updateTask }) => {
  const [, drop] = useDrop({
    accept: "TASK",
    drop(item) {
      if (item.quadrant !== quadrant) {
        moveTask(item.quadrant, item.index, quadrant, tasks.length);
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


const App = () => {
  const [showNotepad, setShowNotepad] = useState(false);
  const [notes, setNotes] = useState("");
  
  const [dateTime, setDateTime] = useState(new Date());
  const [task, setTask] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState("urgentImportant");
  const [tasks, setTasks] = useState({
    urgentImportant: [],
    notUrgentImportant: [],
    urgentNotImportant: [],
    notUrgentNotImportant: [],
  });

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);
  // load takss from localstorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) setNotes(savedNotes);
  }, []);
  //save tasks from localstorage
  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);

  const addTask = () => {
    if (task.trim() === "") return;
    const newTask = {
      id: Date.now(),
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTask();
  };

  const toggleComplete = (quadrant, index) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      newTasks[quadrant] = newTasks[quadrant].map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      );
      newTasks[quadrant].sort((a, b) => a.completed - b.completed);
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

const moveTask = (fromQuadrant, fromIndex, toQuadrant, toIndex) => {
  setTasks((prev) => {
    // Prevent invalid moves
    if (
      fromIndex < 0 ||
      fromIndex >= prev[fromQuadrant].length ||
      toIndex < 0 ||
      toIndex > prev[toQuadrant].length
    ) {
      return prev;
    }

    const newTasks = { ...prev };
    const movedTask = newTasks[fromQuadrant][fromIndex];

    if (fromQuadrant === toQuadrant) {
      const tasksCopy = [...newTasks[fromQuadrant]];
      const [removed] = tasksCopy.splice(fromIndex, 1);
      tasksCopy.splice(toIndex, 0, removed);
      newTasks[fromQuadrant] = tasksCopy;
    } else {
      const sourceTasks = [...newTasks[fromQuadrant]];
      const targetTasks = [...newTasks[toQuadrant]];
      const [removed] = sourceTasks.splice(fromIndex, 1);
      targetTasks.splice(toIndex, 0, removed);
      newTasks[fromQuadrant] = sourceTasks;
      newTasks[toQuadrant] = targetTasks;
    }

    return newTasks;
  });
};
  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-6 font-['Noto Sans JP'] flex flex-col items-center">
        <div className="mt-0 mb-3 text-xs text-black font-mono tracking-wide font-['Noto Sans JP']">
          {dateTime.toLocaleString()}
        </div>
        <div className="w-full max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Echo!</h1>
            <div className="flex items-center justify-between flex-1 bg-white p-1 rounded-lg shadow-md border border-gray-300 w-[250px]">
              <input
                type="text"
                className="w-full p-1 border-none outline-none text-gray-800 text-xs"
                placeholder="Enter a new task, click on a existing task to mark it completed or double click to edit it"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={handleKeyDown}
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
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={clearCompletedTasks}
              className="text-xs px-3 py-1 bg-[#80011f] text-white rounded-lg hover:bg-red-700 transition duration-200 shadow-md font-semibold tracking-wide"
            >
              Clear Completed Tasks
            </button>
            <button
              onClick={() => setShowNotepad(!showNotepad)}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md font-semibold tracking-wide"
            >
              {showNotepad ? "Close Notepad" : "Quick Notes"}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showNotepad && (
          <motion.div
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 2 }}
          exit={{ rotateX: -90, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ transformPerspective: 1000 }}
            className="fixed  w-96 h-[28rem] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-10 "
          >
            <div className="p-2 bg-gray-100 rounded-t-lg flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700">Quick Notes</span>
              <button
                onClick={() => setShowNotepad(false)}
                className="text-gray-500 hover:text-gray-700 text-xs"
              >
                ❌
              </button>
            </div>
            <textarea
              className="flex-1 p-2 text-xs resize-none focus:outline-none bg-gray-50 rounded-b-lg"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down your thoughts here..."
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>
    </DndProvider>
  );
};

export default App;