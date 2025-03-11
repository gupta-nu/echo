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

      if (dragIndex === hoverIndex && dragQuadrant === hoverQuadrant) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveTask(dragQuadrant, dragIndex, hoverQuadrant, hoverIndex);
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
        <div>
          <div>{task.text}</div>
          <div className="text-xs text-gray-500">{task.times}</div>
        </div>
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
    <div ref={drop} className={`p-1.5 rounded-xl border ${color} shadow-md min-h-[300px] flex flex-col`}>
      <h2 className="text-md font-semibold  text-gray-700">{title}</h2>
      <ul className="space-y-0 flex-1">
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
  const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);
  const [timeSlotsSelected, setTimeSlotsSelected] = useState([]);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const start = String(i).padStart(2, '0');
    const end = String((i + 1) % 24).padStart(2, '0');
    const periodStart = i < 12 ? 'AM' : 'PM';
    const periodEnd = (i + 1) < 12 ? 'AM' : 'PM';
    const label = `${i % 12 === 0 ? 12 : i % 12}:00 ${periodStart} - ${(i + 1) % 12 === 0 ? 12 : (i + 1) % 12}:00 ${periodEnd}`;
    return { value: `${start}-${end}`, label };
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) setNotes(savedNotes);
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);

  const addTask = () => {
    if (task.trim() === "" || timeSlotsSelected.length === 0) return;
    const newTask = {
      id: Date.now(),
      text: task,
      times: mergeTimeSlots(timeSlotsSelected),
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
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTask();
  };

  const handleTimeSlotChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setTimeSlotsSelected(selectedOptions);
  };

  const mergeTimeSlots = (slots) => {
    if (!slots.length) return '';

    const sorted = slots.map(slot => slot.split('-').map(Number)).sort((a, b) => a[0] - b[0]);

    let merged = [];
    let start = sorted[0][0], end = sorted[0][1];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i][0] === end) {
        end = sorted[i][1];
      } else {
        merged.push({ start, end });
        start = sorted[i][0];
        end = sorted[i][1];
      }
    }
    merged.push({ start, end });

    return merged.map(({ start, end }) => formatTimeRange(start, end)).join(', ');
  };

  const formatTimeRange = (start, end) => {
    const formatTime = (hour) => {
      const period = hour < 12 ? 'AM' : 'PM';
      return `${hour % 12 === 0 ? 12 : hour % 12}:00 ${period}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
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

  const tasksreset = () => {
    setTasks({
      urgentImportant: [],
      notUrgentImportant: [],
      urgentNotImportant: [],
      notUrgentNotImportant: [],
    });
  };

  const moveTask = (fromQuadrant, fromIndex, toQuadrant, toIndex) => {
    setTasks((prev) => {
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
      <div className="min-h-screen bg-gray-100 p-3 font-['Noto Sans JP'] flex flex-col items-center">
        <div className="mt-0 mb-1 text-xs text-black font-mono tracking-wide font-['Noto Sans JP']">
          {dateTime.toLocaleString()}
        </div>
        <div className="w-full max-w-7xl">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-800">Echo!</h1>
            <button
              onClick={() => setShowTimeSlotForm(true)}
              className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow-md font-semibold tracking-wide w-fit"
            >
              Add Time Slots
            </button>
          </div>
          <div className="flex items-center gap-4 mb-6">
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

      {/* Time Slot Form Modal */}
      <AnimatePresence>
        {showTimeSlotForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
            onClick={() => setShowTimeSlotForm(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-6 rounded-lg shadow-lg w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">Select Time Slots</h2>
              <select
                multiple
                value={timeSlotsSelected}
                onChange={handleTimeSlotChange}
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                size="5"
              >
                {timeSlots.map(slot => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
              <button
                onClick={addTask}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200"
              >
                Add Task
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notepad Modal */}
      <AnimatePresence>
        {showNotepad && (
          <motion.div
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 2 }}
            exit={{ rotateX: -90, opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ transformPerspective: 1000 }}
            className="fixed w-96 h-[28rem] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-10"
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