import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AnimatePresence } from "framer-motion";
import { categories } from "./constants";
import { mergeTimeSlots } from "./utils/helpers";
import CategoryColumn from "./components/CategoryColumn";
import NotepadModal from "./components/NotepadModal";
import TimeSlotModal from "./components/TimeSlotModal";
import { 
  Plus, 
  Clock, 
  CheckSquare, 
  X, 
  Trash2, 
  BookOpen, 
  Menu, 
  Calendar,
  RefreshCw
} from "lucide-react";

const App = () => {
  const [showNotepad, setShowNotepad] = useState(false);
  const [notes, setNotes] = useState([""]);  // Changed to array to match NotepadModal
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Load saved data
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("tasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      
      const savedNotes = localStorage.getItem("savedNotes");
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      
      const savedDarkMode = localStorage.getItem("notepadDarkMode");
      if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  }, []);

  // Save data
  useEffect(() => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  }, [tasks]);

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Save dark mode preference
  useEffect(() => {
    try {
      localStorage.setItem("notepadDarkMode", JSON.stringify(isDarkMode));
      
      // Apply dark mode to body
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    } catch (error) {
      console.error("Error saving dark mode preference:", error);
    }
  }, [isDarkMode]);

  // Task management functions
  const addTask = () => {
    if (task.trim() === "") return;
    const newTask = {
      id: Date.now(),
      text: task,
      times: timeSlotsSelected.length > 0 
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

  const addNewTask = (quadrant) => {
    // Set the selected quadrant and open the input field
    setSelectedQuadrant(quadrant);
    // Focus the input field
    document.getElementById("task-input").focus();
    // Optionally scroll to input
    document.getElementById("task-input").scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
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
    setShowConfirmReset(false);
    setTasks({
      urgentImportant: [],
      notUrgentImportant: [],
      urgentNotImportant: [],
      notUrgentNotImportant: [],
    });
  };

  const deleteTask = (quadrant, index) => {
    setTasks(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].filter((_, i) => i !== index)
    }));
  };

  const totalTasks = Object.values(tasks).reduce((acc, quadrantTasks) => acc + quadrantTasks.length, 0);
  const completedTasks = Object.values(tasks).reduce(
    (acc, quadrantTasks) => acc + quadrantTasks.filter(t => t.completed).length, 
    0
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gradient-to-br from-blue-50 to-gray-100 text-gray-800'} font-sans flex flex-col items-center transition-colors duration-300`}>
        {/* Header */}
        <header className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md mb-6 transition-colors duration-300`}>
          <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Echo!
              </h1>
              <div className="hidden md:flex items-center space-x-2 text-xs p-2 rounded-full bg-opacity-10 bg-blue-500">
                <Calendar size={14} className="text-blue-500" />
                <span className="font-mono">{dateTime.toLocaleDateString()}</span>
                <Clock size={14} className="text-blue-500 ml-2" />
                <span className="font-mono">{dateTime.toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`hidden md:flex items-center text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                <span>{completedTasks}/{totalTasks} completed</span>
                <div className="ml-2 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
              
              <button
                onClick={() => setIsDarkMode(prev => !prev)}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`md:hidden overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-blue-500" />
                      <span className="font-mono">{dateTime.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-blue-500" />
                      <span className="font-mono">{dateTime.toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span>{completedTasks}/{totalTasks} tasks completed</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowTimeSlotForm(true);
                        setShowMobileMenu(false);
                      }}
                      className={`flex-1 text-xs px-3 py-2 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition duration-200 shadow-sm flex items-center justify-center gap-1`}
                    >
                      <Clock size={14} />
                      <span>Add Time Slots</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowNotepad(!showNotepad);
                        setShowMobileMenu(false);
                      }}
                      className={`flex-1 text-xs px-3 py-2 ${isDarkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg transition duration-200 shadow-sm flex items-center justify-center gap-1`}
                    >
                      <BookOpen size={14} />
                      <span>Quick Notes</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div className="w-full max-w-7xl px-4">
          {/* Task Input Section */}
          <div className={`mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl shadow-md`}>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setShowTimeSlotForm(true)}
                className={`hidden md:flex text-xs px-4 py-2 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition duration-200 shadow-sm items-center gap-2`}
              >
                <Clock size={14} />
                <span>Add Time Slots</span>
              </button>
              
              <div className="flex-1 relative">
                <input
                  id="task-input"
                  type="text"
                  className={`w-full p-3 rounded-lg shadow-sm text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter a new task..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={addTask}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md ${
                    task.trim() === '' 
                      ? 'text-gray-400' 
                      : isDarkMode ? 'text-blue-400 hover:bg-blue-900' : 'text-blue-600 hover:bg-blue-100'
                  }`}
                  disabled={task.trim() === ''}
                  aria-label="Add task"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <select
                className={`p-3 border rounded-lg shadow-sm text-sm ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-800'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={selectedQuadrant}
                onChange={(e) => setSelectedQuadrant(e.target.value)}
                aria-label="Select task category"
              >
                {Object.entries(categories).map(([key, { title }]) => (
                  <option key={key} value={key}>{title}</option>
                ))}
              </select>
            </div>
            
            <div className="text-xs text-center opacity-80">
              <p>
                Press <kbd className={`px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Enter</kbd> to add task | 
                <span className="mx-1">Click a task to mark as complete |</span> 
                Double-click to edit
              </p>
            </div>
          </div>

          {/* Task Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                onDelete={deleteTask}
                addNewTask={addNewTask}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 mb-8">
            <button
              onClick={clearCompletedTasks}
              className={`text-xs px-4 py-2 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
              } rounded-lg transition duration-200 shadow-sm flex items-center gap-2`}
            >
              <CheckSquare size={14} />
              <span>Clear Completed</span>
            </button>
            
            <button
              onClick={() => setShowNotepad(!showNotepad)}
              className={`hidden md:flex text-xs px-4 py-2 ${
                isDarkMode 
                  ? 'bg-indigo-700 hover:bg-indigo-600' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white rounded-lg transition duration-200 shadow-sm items-center gap-2`}
            >
              <BookOpen size={14} />
              <span>{showNotepad ? "Close Notes" : "Quick Notes"}</span>
            </button>
            
            <button
              onClick={() => setShowConfirmReset(true)}
              className={`text-xs px-4 py-2 ${
                isDarkMode 
                  ? 'bg-red-900 hover:bg-red-800' 
                  : 'bg-red-600 hover:bg-red-700'
              } text-white rounded-lg transition duration-200 shadow-sm flex items-center gap-2`}
            >
              <RefreshCw size={14} />
              <span>Reset All</span>
            </button>
          </div>
        </div>

        {/* Time Slot Modal */}
        <AnimatePresence>
          {showTimeSlotForm && (
            <TimeSlotModal
              showTimeSlotForm={showTimeSlotForm}
              setShowTimeSlotForm={setShowTimeSlotForm}
              timeSlotsSelected={timeSlotsSelected}
              setTimeSlotsSelected={setTimeSlotsSelected}
              addTask={addTask}
              isDarkMode={isDarkMode}
            />
          )}
        </AnimatePresence>

        {/* Notepad Modal */}
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

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {showConfirmReset && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } p-6 rounded-xl border shadow-xl max-w-sm mx-4`}
              >
                <div className="text-center mb-4">
                  <div className={`mx-auto w-12 h-12 rounded-full ${isDarkMode ? 'bg-red-900' : 'bg-red-100'} flex items-center justify-center mb-4`}>
                    <Trash2 size={20} className={isDarkMode ? 'text-red-300' : 'text-red-600'} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Reset All Tasks</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Are you sure you want to delete all tasks? This cannot be undone.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={tasksReset}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                      isDarkMode 
                        ? 'bg-red-800 hover:bg-red-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white`}
                  >
                    Reset All
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
};

export default App;