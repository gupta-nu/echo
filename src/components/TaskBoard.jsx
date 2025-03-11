import { useState } from 'react';
import './TaskBoard.css';

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [timeSlotsSelected, setTimeSlotsSelected] = useState([]);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const start = String(i).padStart(2, '0');
    const end = String((i + 1) % 24).padStart(2, '0');
    const periodStart = i < 12 ? 'AM' : 'PM';
    const periodEnd = (i + 1) < 12 ? 'AM' : 'PM';
    const label = `${i % 12 === 0 ? 12 : i % 12}:00 ${periodStart} - ${(i + 1) % 12 === 0 ? 12 : (i + 1) % 12}:00 ${periodEnd}`;
    return { value: `${start}-${end}`, label };
  });

  const handleAddTask = () => {
    if (!taskName.trim() || timeSlotsSelected.length === 0) return;

    const newTask = {
      id: Date.now(),
      name: taskName,
      times: mergeTimeSlots(timeSlotsSelected), // Merge time slots
      column: 'critical-immediate'
    };

    setTasks([...tasks, newTask]);
    setShowForm(false);
    setTaskName('');
    setTimeSlotsSelected([]);
  };

  const handleTimeSlotChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setTimeSlotsSelected(selectedOptions);
  };

  const mergeTimeSlots = (slots) => {
    if (!slots.length) return '';

    // Sort time slots
    const sorted = slots.map(slot => slot.split('-').map(Number)).sort((a, b) => a[0] - b[0]);

    let merged = [];
    let start = sorted[0][0], end = sorted[0][1];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i][0] === end) {
        // Extend the current range
        end = sorted[i][1];
      } else {
        // Push the previous range and start a new one
        merged.push({ start, end });
        start = sorted[i][0];
        end = sorted[i][1];
      }
    }
    merged.push({ start, end }); // Push last range

    // Convert back to readable format
    return merged.map(({ start, end }) => formatTimeRange(start, end)).join(', ');
  };

  const formatTimeRange = (start, end) => {
    const formatTime = (hour) => {
      const period = hour < 12 ? 'AM' : 'PM';
      return `${hour % 12 === 0 ? 12 : hour % 12}:00 ${period}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');

    setTasks(tasks.map(task =>
      task.id === Number(taskId) ? { ...task, column: columnId } : task
    ));
  };

  return (
    <div className="task-board">
      <button onClick={() => setShowForm(true)}>Enter a new task</button>

      {showForm && (
        <div className="task-form">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task name"
          />
          <select multiple value={timeSlotsSelected} onChange={handleTimeSlotChange} size="5">
            {timeSlots.map(slot => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
          <button onClick={handleAddTask}>Add Task</button>
        </div>
      )}

      <div className="columns-container">
        {['critical-immediate', 'critical-shallow', 'low-priority', 'completed'].map((column) => (
          <div
            key={column}
            className="column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column)}
          >
            <h3>{column.split('-').join(' ').toUpperCase()}</h3>
            {tasks
              .filter(task => task.column === column)
              .map(task => (
                <div
                  key={task.id}
                  className="task"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <strong>{task.name}</strong>
                  <div className="time-slot">
                    {task.times}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
