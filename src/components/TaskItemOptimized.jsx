import { memo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import { Trash2, Circle, CheckCircle, Edit, Clock } from 'lucide-react';

const TaskItemOptimized = memo(({
  task,
  index,
  quadrant,
  moveTask,
  toggleComplete,
  updateTask,
  onDelete,
}) => {
  const ref = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  // Memoized quadrant styles
  const quadrantStyles = {
    urgentImportant: {
      background: 'bg-gradient-to-r from-red-50 to-red-100',
      border: 'border-l-4 border-l-red-500',
      activeColor: 'text-red-500',
    },
    notUrgentImportant: {
      background: 'bg-gradient-to-r from-blue-50 to-blue-100',
      border: 'border-l-4 border-l-blue-500',
      activeColor: 'text-blue-500',
    },
    urgentNotImportant: {
      background: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
      border: 'border-l-4 border-l-yellow-500',
      activeColor: 'text-yellow-600',
    },
    notUrgentNotImportant: {
      background: 'bg-gradient-to-r from-green-50 to-green-100',
      border: 'border-l-4 border-l-green-500',
      activeColor: 'text-green-500',
    },
  };

  const currentStyles = quadrantStyles[quadrant] || quadrantStyles.urgentImportant;

  // Optimized drag setup
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'TASK',
      item: { index, quadrant, id: task.id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index, quadrant, task.id]
  );

  // Optimized drop setup
  const [, drop] = useDrop(
    () => ({
      accept: 'TASK',
      hover: (item, monitor) => {
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
        item.quadrant = hoverQuadrant;
      },
    }),
    [index, quadrant, moveTask]
  );

  // Connect refs
  drag(drop(ref));

  // Memoized handlers
  const handleToggleComplete = useCallback(
    (e) => {
      e.stopPropagation();
      toggleComplete(quadrant, task.id);
    },
    [quadrant, task.id, toggleComplete]
  );

  const handleEditStart = useCallback(
    (e) => {
      e.stopPropagation();
      setIsEditing(true);
      setEditText(task.text);
    },
    [task.text]
  );

  const handleEditSubmit = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.type === 'blur') {
        setIsEditing(false);
        if (editText.trim() && editText !== task.text) {
          updateTask(quadrant, task.id, { text: editText.trim() });
        } else {
          setEditText(task.text);
        }
      }
    },
    [editText, task.text, task.id, quadrant, updateTask]
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete(quadrant, task.id);
    },
    [quadrant, task.id, onDelete]
  );

  const taskVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -10 },
  };

  return (
    <motion.li
      ref={ref}
      className={`p-3 mb-2 rounded-lg shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing
        ${currentStyles.background} ${currentStyles.border}
        ${task.completed ? 'opacity-75' : ''} 
        ${isDragging ? 'opacity-50 shadow-lg scale-105' : 'hover:shadow-md'}`}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={taskVariants}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <button
          onClick={handleToggleComplete}
          className="mt-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed ? (
            <CheckCircle size={18} className={currentStyles.activeColor} />
          ) : (
            <Circle size={18} className="text-gray-400 hover:text-gray-600" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              className="w-full text-sm border border-blue-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditSubmit}
              onBlur={handleEditSubmit}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div>
              <div
                className={`font-medium text-sm cursor-pointer ${
                  task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                }`}
                onClick={handleToggleComplete}
                onDoubleClick={handleEditStart}
              >
                {task.text}
              </div>
              {task.times && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{task.times}</span>
                </div>
              )}
              {task.createdAt && (
                <div className="text-xs text-gray-400 mt-1">
                  Added {new Date(task.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <button
              onClick={handleEditStart}
              className={`p-1 text-gray-400 hover:${currentStyles.activeColor} transition-colors rounded-full hover:bg-white hover:bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Edit task"
            >
              <Edit size={14} />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-white hover:bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.li>
  );
});

TaskItemOptimized.displayName = 'TaskItemOptimized';

export default TaskItemOptimized;