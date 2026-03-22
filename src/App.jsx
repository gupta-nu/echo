import { useState, useEffect, useCallback, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AnimatePresence, motion } from "framer-motion";
import { categories } from "./constants";
import { mergeTimeSlots } from "./utils/helpers";
import CategoryColumn from "./components/CategoryColumn";
import NotepadModal from "./components/NotepadModal";
import TimeSlotModal from "./components/TimeSlotModal";
import CommandPalette from "./components/CommandPalette";
import { 
  Plus, 
  Clock, 
  CheckSquare, 
  Trash2, 
  BookOpen, 
  Menu, 
  RefreshCw,
  Command,
  Moon,
  Sun,
} from "lucide-react";

const App = () => {
  const [showNotepad, setShowNotepad] = useState(false);
  const [notes, setNotes] = useState([""]);
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
  const [commandOpen, setCommandOpen] = useState(false);
  const [undoHistory, setUndoHistory] = useState([]);
  const [focusMode, setFocusMode] = useState(false);
  const [focusedQuadrant, setFocusedQuadrant] = useState(null);
  const taskInputRef = useRef(null);

  // Load saved data
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("tasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      
      const savedNotes = localStorage.getItem("savedNotes");
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      
      const savedDarkMode = localStorage.getItem("echo_dark_mode");
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

  // Dark mode
  useEffect(() => {
    try {
      localStorage.setItem("echo_dark_mode", JSON.stringify(isDarkMode));
      document.documentElement.classList.toggle("dark", isDarkMode);
    } catch (error) {
      console.error("Error saving dark mode:", error);
    }
  }, [isDarkMode]);

  // Push to undo history
  const pushUndo = useCallback(() => {
    setUndoHistory((prev) => [...prev.slice(-19), JSON.parse(JSON.stringify(tasks))]);
  }, [tasks]);

  const undo = useCallback(() => {
    if (undoHistory.length === 0) return;
    const prev = undoHistory[undoHistory.length - 1];
    setUndoHistory((h) => h.slice(0, -1));
    setTasks(prev);
  }, [undoHistory]);

  // Global undo shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [undo]);

  // Task management
  const addTask = useCallback(() => {
    if (task.trim() === "") return;
    pushUndo();
    const newTask = {
      id: Date.now(),
      text: task,
      times: timeSlotsSelected.length > 0 ? mergeTimeSlots(timeSlotsSelected) : "",
      completed: false,
      editing: false,
    };
    setTasks((prev) => ({
      ...prev,
      [selectedQuadrant]: [...prev[selectedQuadrant], newTask],
    }));
    setTask("");
    setTimeSlotsSelected([]);
    setShowTimeSlotForm(false);
  }, [task, selectedQuadrant, timeSlotsSelected, pushUndo]);

  const addTaskToQuadrant = useCallback(
    (quadrant, text) => {
      pushUndo();
      const newTask = {
        id: Date.now(),
        text,
        times: "",
        completed: false,
        editing: false,
      };
      setTasks((prev) => ({
        ...prev,
        [quadrant]: [...prev[quadrant], newTask],
      }));
    },
    [pushUndo]
  );

  const addNewTask = useCallback((quadrant) => {
    setSelectedQuadrant(quadrant);
    setTimeout(() => taskInputRef.current?.focus(), 100);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTask();
      }
    },
    [addTask]
  );

  const toggleComplete = useCallback(
    (quadrant, index) => {
      pushUndo();
      setTasks((prev) => {
        const newTasks = { ...prev };
        newTasks[quadrant] = newTasks[quadrant]
          .map((t, i) => (i === index ? { ...t, completed: !t.completed } : t))
          .sort((a, b) => a.completed - b.completed);
        return newTasks;
      });
    },
    [pushUndo]
  );

  const startEditing = useCallback((quadrant, index, text) => {
    setTasks((prev) => ({
      ...prev,
      [quadrant]: prev[quadrant].map((t, i) =>
        i === index ? { ...t, editing: text !== null, text: text ?? t.text } : t
      ),
    }));
  }, []);

  const updateTask = useCallback((quadrant, index, newText) => {
    setTasks((prev) => ({
      ...prev,
      [quadrant]: prev[quadrant].map((t, i) =>
        i === index ? { ...t, text: newText } : t
      ),
    }));
  }, []);

  const moveTask = useCallback(
    (fromQuadrant, fromIndex, toQuadrant, toIndex) => {
      setTasks((prev) => {
        if (
          fromIndex < 0 ||
          fromIndex >= prev[fromQuadrant].length ||
          toIndex < 0 ||
          toIndex > prev[toQuadrant].length
        )
          return prev;
        const newTasks = { ...prev };
        if (fromQuadrant === toQuadrant) {
          const copy = [...newTasks[fromQuadrant]];
          const [removed] = copy.splice(fromIndex, 1);
          copy.splice(toIndex, 0, removed);
          newTasks[fromQuadrant] = copy;
        } else {
          const src = [...newTasks[fromQuadrant]];
          const dst = [...newTasks[toQuadrant]];
          const [removed] = src.splice(fromIndex, 1);
          dst.splice(toIndex, 0, removed);
          newTasks[fromQuadrant] = src;
          newTasks[toQuadrant] = dst;
        }
        return newTasks;
      });
    },
    []
  );

  const clearCompletedTasks = useCallback(() => {
    pushUndo();
    setTasks((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([key, val]) => [key, val.filter((t) => !t.completed)])
      )
    );
  }, [pushUndo]);

  const tasksReset = useCallback(() => {
    pushUndo();
    setShowConfirmReset(false);
    setTasks({
      urgentImportant: [],
      notUrgentImportant: [],
      urgentNotImportant: [],
      notUrgentNotImportant: [],
    });
  }, [pushUndo]);

  const deleteTask = useCallback(
    (quadrant, index) => {
      pushUndo();
      setTasks((prev) => ({
        ...prev,
        [quadrant]: prev[quadrant].filter((_, i) => i !== index),
      }));
    },
    [pushUndo]
  );

  const jumpToQuadrant = useCallback((quadrant) => {
    const el = document.getElementById(`quadrant-${quadrant}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-blue-400");
      setTimeout(() => el.classList.remove("ring-2", "ring-blue-400"), 1500);
    }
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => !prev);
    setFocusedQuadrant(null);
  }, []);

  const totalTasks = Object.values(tasks).reduce((acc, q) => acc + q.length, 0);
  const completedTasks = Object.values(tasks).reduce(
    (acc, q) => acc + q.filter((t) => t.completed).length,
    0
  );
  const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

  const quadrantLabels = {
    urgentImportant: { label: "Do First", color: "bg-red-500", tint: "text-red-600 dark:text-red-400" },
    notUrgentImportant: { label: "Schedule", color: "bg-blue-500", tint: "text-blue-600 dark:text-blue-400" },
    urgentNotImportant: { label: "Delegate", color: "bg-amber-500", tint: "text-amber-600 dark:text-amber-400" },
    notUrgentNotImportant: { label: "Eliminate", color: "bg-emerald-500", tint: "text-emerald-600 dark:text-emerald-400" },
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`min-h-screen transition-theme ${
          isDarkMode
            ? "bg-[rgb(28,28,30)] text-white"
            : "bg-[rgb(242,242,247)] text-[rgb(28,28,30)]"
        }`}
      >
        {/* ── Header ── */}
        <header
          className={`sticky top-0 z-40 glass transition-theme ${
            isDarkMode ? "border-b border-[rgb(58,58,60)]" : "border-b border-[rgb(229,229,234)]"
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold tracking-tight">
                Echo
              </h1>
              <div
                className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  isDarkMode ? "bg-white/5 text-white/60" : "bg-black/[0.04] text-black/50"
                }`}
              >
                <Clock size={12} />
                <span className="tabular-nums">
                  {dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="mx-0.5 opacity-30">·</span>
                <span className="tabular-nums">
                  {dateTime.toLocaleDateString([], { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>

            {/* Center: Progress */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-32 h-1.5 rounded-full overflow-hidden ${
                    isDarkMode ? "bg-white/10" : "bg-black/[0.06]"
                  }`}
                >
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <span
                  className={`text-xs font-medium tabular-nums ${
                    isDarkMode ? "text-white/50" : "text-black/40"
                  }`}
                >
                  {completedTasks}/{totalTasks}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
              {/* Command Palette Trigger */}
              <button
                onClick={() => setCommandOpen(true)}
                className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-white/5 hover:bg-white/10 text-white/60"
                    : "bg-black/[0.04] hover:bg-black/[0.06] text-black/50"
                }`}
              >
                <Command size={12} />
                <span>K</span>
              </button>

              <button
                onClick={() => setIsDarkMode((p) => !p)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-white/10 text-white/70" : "hover:bg-black/[0.04] text-black/50"
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                onClick={() => setShowNotepad(!showNotepad)}
                className={`hidden md:flex p-2 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-white/10 text-white/70" : "hover:bg-black/[0.04] text-black/50"
                }`}
                aria-label="Quick Notes"
              >
                <BookOpen size={16} />
              </button>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-white/10" : "hover:bg-black/[0.04]"
                }`}
                aria-label="Menu"
              >
                <Menu size={16} />
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
                className="md:hidden overflow-hidden"
              >
                <div className="px-4 pb-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isDarkMode ? "text-white/50" : "text-black/40"}>
                      {completedTasks}/{totalTasks} completed
                    </span>
                    <div
                      className={`w-20 h-1.5 rounded-full overflow-hidden ${
                        isDarkMode ? "bg-white/10" : "bg-black/[0.06]"
                      }`}
                    >
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCommandOpen(true);
                        setShowMobileMenu(false);
                      }}
                      className={`flex-1 text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-medium ${
                        isDarkMode ? "bg-white/10 text-white" : "bg-blue-500 text-white"
                      }`}
                    >
                      <Command size={14} />
                      Commands
                    </button>
                    <button
                      onClick={() => {
                        setShowNotepad(!showNotepad);
                        setShowMobileMenu(false);
                      }}
                      className={`flex-1 text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-medium ${
                        isDarkMode ? "bg-white/10 text-white" : "bg-black/[0.06] text-black/70"
                      }`}
                    >
                      <BookOpen size={14} />
                      Notes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* ── Task Input ── */}
          <div
            className={`mb-6 rounded-2xl p-4 transition-theme ${
              isDarkMode
                ? "bg-[rgb(44,44,46)] border border-[rgb(58,58,60)]"
                : "bg-white border border-[rgb(229,229,234)] shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={taskInputRef}
                  id="task-input"
                  type="text"
                  className={`w-full pl-4 pr-10 py-2.5 rounded-xl text-sm transition-colors ${
                    isDarkMode
                      ? "bg-[rgb(58,58,60)] text-white placeholder-[rgb(142,142,147)] focus:ring-2 focus:ring-blue-500/50"
                      : "bg-[rgb(242,242,247)] text-[rgb(28,28,30)] placeholder-[rgb(142,142,147)] focus:ring-2 focus:ring-blue-500/30"
                  } border-0 outline-none`}
                  placeholder="Add a new task…"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={addTask}
                  disabled={!task.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                    task.trim()
                      ? "text-blue-500 hover:bg-blue-500/10"
                      : isDarkMode
                      ? "text-[rgb(99,99,102)]"
                      : "text-[rgb(199,199,204)]"
                  }`}
                  aria-label="Add task"
                >
                  <Plus size={16} />
                </button>
              </div>

              <select
                className={`py-2.5 px-3 rounded-xl text-sm transition-colors border-0 outline-none ${
                  isDarkMode
                    ? "bg-[rgb(58,58,60)] text-white"
                    : "bg-[rgb(242,242,247)] text-[rgb(28,28,30)]"
                }`}
                value={selectedQuadrant}
                onChange={(e) => setSelectedQuadrant(e.target.value)}
                aria-label="Category"
              >
                {Object.entries(quadrantLabels).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowTimeSlotForm(true)}
                className={`hidden sm:flex p-2.5 rounded-xl transition-colors ${
                  isDarkMode ? "bg-[rgb(58,58,60)] hover:bg-[rgb(72,72,74)] text-white/70" : "bg-[rgb(242,242,247)] hover:bg-[rgb(229,229,234)] text-black/50"
                }`}
                aria-label="Time slots"
              >
                <Clock size={16} />
              </button>
            </div>

            <div
              className={`mt-2.5 text-center text-xs ${
                isDarkMode ? "text-white/30" : "text-black/30"
              }`}
            >
              <kbd
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  isDarkMode ? "bg-white/5" : "bg-black/[0.04]"
                }`}
              >
                ⌘K
              </kbd>{" "}
              to open command palette
            </div>
          </div>

          {/* ── Quadrant Grid ── */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${focusMode ? "focus-mode" : ""}`}>
            {Object.entries(categories).map(([key, { title, color }]) => (
              <div
                key={key}
                id={`quadrant-${key}`}
                className={`quadrant-card transition-all duration-300 rounded-2xl ${
                  focusMode && focusedQuadrant && focusedQuadrant !== key ? "" : "focused"
                }`}
                onClick={() => focusMode && setFocusedQuadrant(key)}
              >
                <CategoryColumn
                  quadrant={key}
                  title={quadrantLabels[key]?.label || title}
                  color={color}
                  tasks={tasks[key]}
                  moveTask={moveTask}
                  toggleComplete={toggleComplete}
                  startEditing={startEditing}
                  updateTask={updateTask}
                  onDelete={deleteTask}
                  addNewTask={addNewTask}
                  isDarkMode={isDarkMode}
                  quadrantMeta={quadrantLabels[key]}
                />
              </div>
            ))}
          </div>

          {/* ── Bottom Actions ── */}
          <div className="flex items-center justify-between gap-3 mb-8">
            <button
              onClick={clearCompletedTasks}
              className={`text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? "bg-[rgb(44,44,46)] hover:bg-[rgb(58,58,60)] text-white/70 border border-[rgb(58,58,60)]"
                  : "bg-white hover:bg-gray-50 text-black/60 border border-[rgb(229,229,234)] shadow-sm"
              }`}
            >
              <CheckSquare size={14} />
              Clear Completed
            </button>

            <button
              onClick={() => setShowConfirmReset(true)}
              className={`text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                  : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
              }`}
            >
              <RefreshCw size={14} />
              Reset All
            </button>
          </div>
        </main>

        {/* ── Command Palette ── */}
        <CommandPalette
          open={commandOpen}
          setOpen={setCommandOpen}
          tasks={tasks}
          isDarkMode={isDarkMode}
          onAddTask={addTaskToQuadrant}
          onToggleDarkMode={() => setIsDarkMode((p) => !p)}
          onClearCompleted={clearCompletedTasks}
          onResetAll={() => setShowConfirmReset(true)}
          onToggleNotepad={() => setShowNotepad((p) => !p)}
          onJumpToQuadrant={jumpToQuadrant}
          onUndo={undo}
          onToggleFocusMode={toggleFocusMode}
          canUndo={undoHistory.length > 0}
          focusMode={focusMode}
        />

        {/* ── Time Slot Modal ── */}
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

        {/* ── Notepad Modal ── */}
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

        {/* ── Reset Confirmation ── */}
        <AnimatePresence>
          {showConfirmReset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
              onClick={() => setShowConfirmReset(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className={`rounded-2xl p-6 max-w-sm mx-4 w-full shadow-xl ${
                  isDarkMode
                    ? "bg-[rgb(44,44,46)] border border-[rgb(68,68,70)]"
                    : "bg-white border border-[rgb(229,229,234)]"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-5">
                  <div
                    className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      isDarkMode ? "bg-red-500/15" : "bg-red-50"
                    }`}
                  >
                    <Trash2 size={20} className="text-red-500" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">Reset All Tasks</h3>
                  <p
                    className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/40"}`}
                  >
                    This will permanently delete all tasks. This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                      isDarkMode
                        ? "bg-[rgb(58,58,60)] hover:bg-[rgb(72,72,74)] text-white"
                        : "bg-[rgb(242,242,247)] hover:bg-[rgb(229,229,234)] text-[rgb(28,28,30)]"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={tasksReset}
                    className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    Reset
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