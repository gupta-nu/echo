import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion";
import { categories, timeSlots } from "./constants";
import { mergeTimeSlots, formatTimeRange } from "./utils/helpers";
import CategoryColumn from "./components/CategoryColumn";
import NotepadModal from "./components/NotepadModal";
import TimeSlotModal from "./components/TimeSlotModal";

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
  const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);
  const [timeSlotsSelected, setTimeSlotsSelected] = useState([]);

  // Load saved data
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) setNotes(savedNotes);
  }, []);

  // Save data
  useEffect(() => localStorage.setItem("tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("notes", notes), [notes]);

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Task management functions
  const addTask = () => {
    if (task.trim() === "" )return;
    const newTask = {
      id: Date.now(),
      text: task,
      times: timeSlotsSelected.length>0 
      ? mergeTimeSlots(timeSlotsSelected): "",
      completed: false,
      editing: false,
    };
    setTasks(prev => ({
      ...prev,
      [selectedQuadrant]: [...prev[selectedQuadrant], newTask]
    }));
    setTask("");
    setTimeSlotsSelected([]);
    setShowTimeSlotForm(false);
  };

  const handleKeyDown = (e) => 
  {
    if(e.key === "Enter")
    {
      e.preventDefault();
      addTask();
    }
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

  const moveTask = (fromQuadrant, fromIndex, toQuadrant, toIndex) => {
    setTasks(prev => {
      if (fromIndex < 0 || fromIndex >= prev[fromQuadrant].length || 
          toIndex < 0 || toIndex > prev[toQuadrant].length) return prev;

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

  const clearCompletedTasks = () => {
    setTasks(prev => Object.fromEntries(
      Object.entries(prev).map(([key, val]) => [key, val.filter(t => !t.completed)])
    ));
  };

  const tasksReset = () => {
    setTasks({
      urgentImportant: [],
      notUrgentImportant: [],
      urgentNotImportant: [],
      notUrgentNotImportant: [],
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
<div className="min-h-screen bg-gray-100 p-3 font-['Noto Sans JP'] flex flex-col items-center">        
  <div className="mt-0 mb-1 text-xs text-black font-mono">
          {dateTime.toLocaleString()}
        </div>
        <div className="w-full max-w-7xl">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-2xl font-bold text-black">Echo!</h1>
            <button
              onClick={() => setShowTimeSlotForm(true)}
              className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow-md w-fit"
            >
              Add Time Slots
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-between flex-1 bg-white p-0.5 rounded-md shadow-sm border border-gray-200 w-[220px]">
      <input
        type="text"
        className="w-full p-1 border-none outline-none text-black text-xs"
        placeholder="Enter task (press Enter to add)"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <select
        className="p-1 border border-gray-300 rounded-md bg-white text-black text-xs"
        value={selectedQuadrant}
        onChange={(e) => setSelectedQuadrant(e.target.value)}
      >
        {Object.entries(categories).map(([key, { title }]) => (
          <option key={key} value={key}>{title}</option>
        ))}
      </select>
    </div>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
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

          <div className="flex gap-2 mt-4">
            <button
              onClick={clearCompletedTasks}
              className="text-xs px-3 py-1 bg-[#80011f] text-white rounded-lg hover:bg-red-700 transition duration-200 shadow-md"
            >
              Clear Completed
            </button>
            <button
              onClick={() => setShowNotepad(!showNotepad)}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
            >
              {showNotepad ? "Close Notes" : "Quick Notes"}
            </button>
            <button
              onClick={tasksReset}
              className="text-xs px-3 py-1 bg-[#80011f] text-white rounded-lg hover:bg-red-700 transition duration-200 shadow-md ml-auto"
            >
              Reset All
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showTimeSlotForm && (
            <TimeSlotModal
              showTimeSlotForm={showTimeSlotForm}
              setShowTimeSlotForm={setShowTimeSlotForm}
              timeSlotsSelected={timeSlotsSelected}
              setTimeSlotsSelected={setTimeSlotsSelected}
              addTask={addTask}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showNotepad && (
            <NotepadModal
              showNotepad={showNotepad}
              setShowNotepad={setShowNotepad}
              notes={notes}
              setNotes={setNotes}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
};

export default App;