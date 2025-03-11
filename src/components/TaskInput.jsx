import TimeSlotPicker from "./TimeSlotPicker";
const TaskInput = ({ task, setTask, addTask, handleKeyDown, isTimeBlocked, setIsTimeBlocked, selectedHours, setSelectedHours, selectedQuadrant, setSelectedQuadrant, categories }) => {
    return (
      <div className="flex items-center gap-4 mb-6">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between flex-1 bg-white p-1 rounded-lg shadow-md border border-gray-300 w-[250px]">
            <input
              type="text"
              className="w-full p-1 border-none outline-none text-gray-800 text-xs"
              placeholder="Enter a new task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={addTask}
              className="px-2 py-1 bg-blue-500 text-white rounded-md ml-2 text-xs"
            >
              Add
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={isTimeBlocked}
                onChange={(e) => setIsTimeBlocked(e.target.checked)}
                className="w-4 h-4"
              />
              Time Block Task
            </label>
            {isTimeBlocked && (
              <TimeSlotPicker selectedSlots={selectedHours} onSelect={setSelectedHours} />
            )}
          </div>
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
    );
  };
  
  export default TaskInput;