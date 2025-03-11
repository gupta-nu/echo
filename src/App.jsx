import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import TaskInput from "./components/TaskInput"; 
import CategoryColumn from "./components/CategoryColumn";
import Notepad from "./components/notepad";
import TimeSlotPicker from "./components/TimeSlotPicker";
import TaskItem from "./components/TaskItem";

const categories = {
  urgentImportant: { title: "Critical and Immediate", color: "bg-white border-gray-300" },
  notUrgentImportant: { title: "Important but not urgent", color: "bg-white border-gray-300" },
  urgentNotImportant: { title: "Critical and Shallow tasks", color: "bg-white border-gray-300" },
  notUrgentNotImportant: { title: "Low Priority Tasks", color: "bg-white border-gray-300" },
};

const App = () => {
  const [isTimeBlocked, setIsTimeBlocked] = useState(true);
  const [selectedHours, setSelectedHours] = useState([]);
  const [showNotepad, setShowNotepad] = useState(false);
  const [notes, setNotes] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [task, setTask] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState("urgentImportant");
  const [tasks, setTasks] = useState({
    timeBlocked: [],
    unScheduled: [],
    urgentImportant: [],
    notUrgentImportant: [],
    urgentNotImportant: [],
    notUrgentNotImportant: [],
  });

  // Load tasks and notes from localStorage
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || {};
    const savedNotes = localStorage.getItem("notes") || "";
    setTasks(prev => ({
      ...prev,
      ...savedTasks,
      timeBlocked: savedTasks.timeBlocked || [],
      unScheduled: savedTasks.unScheduled || [],
    }));
    setNotes(savedNotes);
  }, []);

  // Save tasks and notes to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("notes", notes);
  }, [tasks, notes]);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const addTask = () => {
    if (!task.trim()) return;
    const newTask = {
      id: Date.now(),
      text: task,
      completed: false,
      editing: false,
      isTimeBlocked,
      timeSlots: isTimeBlocked ? selectedHours : []
    };
    
    setTasks(prev => ({
      ...prev,
      [isTimeBlocked ? 'timeBlocked' : 'unScheduled']: [
        ...prev[isTimeBlocked ? 'timeBlocked' : 'unScheduled'],
        newTask
      ]
    }));
    
    setTask("");
    setSelectedHours([]);
    setIsTimeBlocked(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTask();
  };

  const toggleComplete = (quadrant, index) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      newTasks[quadrant] = newTasks[quadrant].map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      ).sort((a, b) => a.completed - b.completed);
      return newTasks;
    });
  };

  const startEditing = (quadrant, index, text) => {
    setTasks(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].map((task, i) =>
        i === index ? { ...task, editing: text !== null, text: text ?? task.text } : task
      )
    }));
  };

  const updateTask = (quadrant, index, newText) => {
    setTasks(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].map((task, i) =>
        i === index ? { ...task, text: newText } : task
      )
    }));
  };

  const clearCompletedTasks = () => {
    setTasks(prev => {
      const newTasks = {};
      Object.keys(prev).forEach(key => {
        newTasks[key] = prev[key].filter(task => !task.completed);
      });
      return newTasks;
    });
  };

  const tasksreset = () => {
    setTasks({
      timeBlocked: [],
      unScheduled: [],
      urgentImportant: [],
      notUrgentImportant: [],
      urgentNotImportant: [],
      notUrgentNotImportant: [],
    });
  };

  const moveTask = (fromQuadrant, fromIndex, toQuadrant, toIndex) => {
    setTasks(prev => {
      if (fromIndex < 0 || fromIndex >= prev[fromQuadrant]?.length ||
          toIndex < 0 || toIndex > prev[toQuadrant]?.length) return prev;

      const newTasks = { ...prev };
      const [movedTask] = newTasks[fromQuadrant].splice(fromIndex, 1);
      newTasks[toQuadrant].splice(toIndex, 0, movedTask);
      return newTasks;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-6 font-['Noto Sans JP'] flex flex-col items-center">
        <div className="mt-0 mb-3 text-xs text-black font-mono tracking-wide">
          {dateTime.toLocaleString()}
        </div>

        <div className="w-full max-w-6xl">
          <TaskInput
            task={task}
            setTask={setTask}
            addTask={addTask}
            handleKeyDown={handleKeyDown}
            isTimeBlocked={isTimeBlocked}
            setIsTimeBlocked={setIsTimeBlocked}
            selectedHours={selectedHours}
            setSelectedHours={setSelectedHours}
            selectedQuadrant={selectedQuadrant}
            setSelectedQuadrant={setSelectedQuadrant}
            categories={categories}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Scheduled Tasks */}
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Scheduled Tasks</h2>
              <ul className="space-y-2">
                {tasks.timeBlocked.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    quadrant="timeBlocked"
                    moveTask={moveTask}
                    toggleComplete={toggleComplete}
                    startEditing={startEditing}
                    updateTask={updateTask}
                  />
                ))}
              </ul>
            </div>

            {/* Unscheduled Tasks */}
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Unscheduled Tasks</h2>
              <ul className="space-y-2">
                {tasks.unScheduled.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    quadrant="unScheduled"
                    moveTask={moveTask}
                    toggleComplete={toggleComplete}
                    startEditing={startEditing}
                    updateTask={updateTask}
                  />
                ))}
              </ul>
            </div>
          </div>

          {/* Eisenhower Matrix Grid */}
          <div className="grid grid-cols-2 gap-4 mt-6">
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

          {/* Control Buttons */}
          <div className="flex gap-2 mt-4">
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
            <button
              onClick={tasksreset}
              className="text-xs px-3 py-1 bg-[#80011f] text-white rounded-lg hover:bg-red-700 transition duration-200 shadow-md font-semibold tracking-wide ml-auto"
            >
              Reset all Tasks
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNotepad && (
          <Notepad
            showNotepad={showNotepad}
            setShowNotepad={setShowNotepad}
            notes={notes}
            setNotes={setNotes}
          />
        )}
      </AnimatePresence>
    </DndProvider>
  );
};

export default App;