import { useState } from "react";

const categories = {
  urgentImportant: { title: "Important and Urgent", color: "bg-white border-gray-300" },
  notUrgentImportant: { title: "Important but Not Urgent", color: "bg-white border-gray-300" },
  urgentNotImportant: { title: "Urgent but Not Important", color: "bg-white border-gray-300" },
  notUrgentNotImportant: { title: "Neither Important nor Urgent", color: "bg-white border-gray-300" },
};

const App = () => {
  const [task, setTask] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState("urgentImportant");
  const [tasks, setTasks] = useState({
    urgentImportant: [],
    notUrgentImportant: [],
    urgentNotImportant: [],
    notUrgentNotImportant: [],
  });
  const [draggedItem, setDraggedItem] = useState(null);
  
  const addTask = () => {
    if (task.trim() === "") return;
    setTasks(prev => ({
      ...prev,
      [selectedQuadrant]: [...prev[selectedQuadrant], { text: task, completed: false }]
    }));
    setTask("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const handleDragStart = (e, quadrant, index) => {
    setDraggedItem({ quadrant, index, task: tasks[quadrant][index] });
    e.dataTransfer.setData("text/plain", tasks[quadrant][index].text);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (targetQuadrant) => {
    if (!draggedItem) return;
    const { quadrant: sourceQuadrant, index: sourceIndex, task } = draggedItem;
    if (sourceQuadrant === targetQuadrant) return;

    setTasks(prev => {
      const newTasks = { ...prev };
      newTasks[sourceQuadrant] = newTasks[sourceQuadrant].filter((_, i) => i !== sourceIndex);
      newTasks[targetQuadrant] = [...newTasks[targetQuadrant], task];
      return newTasks;
    });

    setDraggedItem(null);
  };

  const toggleComplete = (quadrant, index) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      newTasks[quadrant] = newTasks[quadrant].map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      );
      return newTasks;
    });
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

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-['Noto Sans JP']">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-medium text-center mb-8 text-gray-800 tracking-wide">
          Task Organizer
        </h1>

        <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-lg shadow-md border border-gray-300">
          <input
            type="text"
            className="flex-1 p-3 border-none outline-none text-gray-800 text-lg"
            placeholder="Enter a new task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <select
            className="p-2 border border-gray-300 rounded-md bg-white text-gray-700"
            value={selectedQuadrant}
            onChange={(e) => setSelectedQuadrant(e.target.value)}
          >
            {Object.entries(categories).map(([key, { title }]) => (
              <option key={key} value={key}>{title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categories).map(([key, { title, color }]) => (
            <div
              key={key}
              className={`p-4 rounded-md border ${color} shadow-sm min-h-[250px]`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(key)}
            >
              <h2 className="text-lg font-medium mb-3 text-gray-700">{title}</h2>
              <ul className="space-y-2">
                {tasks[key].map((task, index) => (
                  <li
                    key={index}
                    className={`p-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm cursor-pointer flex items-center justify-between transition-all duration-200 ${
                      task.completed ? 'line-through text-gray-400' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, key, index)}
                    onClick={() => toggleComplete(key, index)}
                  >
                    <span>{task.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={clearCompletedTasks}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 shadow-md font-semibold tracking-wide"
          >
            Clear Completed Tasks
            </button>
        </div>
      </div>
    </div>
  );
};

export default App;

