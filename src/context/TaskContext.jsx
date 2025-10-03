import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types
export const TASK_ACTIONS = {
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  TOGGLE_COMPLETE: 'TOGGLE_COMPLETE',
  MOVE_TASK: 'MOVE_TASK',
  CLEAR_COMPLETED: 'CLEAR_COMPLETED',
  RESET_ALL: 'RESET_ALL',
  LOAD_TASKS: 'LOAD_TASKS',
};

const initialState = {
  urgentImportant: [],
  notUrgentImportant: [],
  urgentNotImportant: [],
  notUrgentNotImportant: [],
};

// Task reducer
const taskReducer = (state, action) => {
  switch (action.type) {
    case TASK_ACTIONS.ADD_TASK: {
      const { quadrant, task } = action.payload;
      const newTask = {
        id: uuidv4(),
        text: task.text,
        times: task.times || '',
        completed: false,
        editing: false,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        [quadrant]: [...state[quadrant], newTask],
      };
    }

    case TASK_ACTIONS.UPDATE_TASK: {
      const { quadrant, taskId, updates } = action.payload;
      return {
        ...state,
        [quadrant]: state[quadrant].map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      };
    }

    case TASK_ACTIONS.DELETE_TASK: {
      const { quadrant, taskId } = action.payload;
      return {
        ...state,
        [quadrant]: state[quadrant].filter(task => task.id !== taskId),
      };
    }

    case TASK_ACTIONS.TOGGLE_COMPLETE: {
      const { quadrant, taskId } = action.payload;
      return {
        ...state,
        [quadrant]: state[quadrant]
          .map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
          .sort((a, b) => a.completed - b.completed),
      };
    }

    case TASK_ACTIONS.MOVE_TASK: {
      const { fromQuadrant, toQuadrant, fromIndex, toIndex } = action.payload;
      
      if (fromIndex < 0 || fromIndex >= state[fromQuadrant].length || 
          toIndex < 0 || toIndex > state[toQuadrant].length) {
        return state;
      }

      const newState = { ...state };

      if (fromQuadrant === toQuadrant) {
        const tasksCopy = [...newState[fromQuadrant]];
        const [removed] = tasksCopy.splice(fromIndex, 1);
        tasksCopy.splice(toIndex, 0, removed);
        newState[fromQuadrant] = tasksCopy;
      } else {
        const sourceTasks = [...newState[fromQuadrant]];
        const targetTasks = [...newState[toQuadrant]];
        const [removed] = sourceTasks.splice(fromIndex, 1);
        targetTasks.splice(toIndex, 0, removed);
        newState[fromQuadrant] = sourceTasks;
        newState[toQuadrant] = targetTasks;
      }

      return newState;
    }

    case TASK_ACTIONS.CLEAR_COMPLETED: {
      return Object.fromEntries(
        Object.entries(state).map(([key, tasks]) => [
          key,
          tasks.filter(task => !task.completed),
        ])
      );
    }

    case TASK_ACTIONS.RESET_ALL: {
      return initialState;
    }

    case TASK_ACTIONS.LOAD_TASKS: {
      return action.payload || initialState;
    }

    default:
      return state;
  }
};

// Context
const TaskContext = createContext();

// Provider
export const TaskProvider = ({ children }) => {
  const [tasks, dispatch] = useReducer(taskReducer, initialState);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        dispatch({ type: TASK_ACTIONS.LOAD_TASKS, payload: JSON.parse(savedTasks) });
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, [tasks]);

  // Action creators
  const addTask = (quadrant, taskData) => {
    dispatch({
      type: TASK_ACTIONS.ADD_TASK,
      payload: { quadrant, task: taskData },
    });
  };

  const updateTask = (quadrant, taskId, updates) => {
    dispatch({
      type: TASK_ACTIONS.UPDATE_TASK,
      payload: { quadrant, taskId, updates },
    });
  };

  const deleteTask = (quadrant, taskId) => {
    dispatch({
      type: TASK_ACTIONS.DELETE_TASK,
      payload: { quadrant, taskId },
    });
  };

  const toggleComplete = (quadrant, taskId) => {
    dispatch({
      type: TASK_ACTIONS.TOGGLE_COMPLETE,
      payload: { quadrant, taskId },
    });
  };

  const moveTask = (fromQuadrant, fromIndex, toQuadrant, toIndex) => {
    dispatch({
      type: TASK_ACTIONS.MOVE_TASK,
      payload: { fromQuadrant, toQuadrant, fromIndex, toIndex },
    });
  };

  const clearCompleted = () => {
    dispatch({ type: TASK_ACTIONS.CLEAR_COMPLETED });
  };

  const resetAll = () => {
    dispatch({ type: TASK_ACTIONS.RESET_ALL });
  };

  // Calculate stats
  const totalTasks = Object.values(tasks).reduce(
    (acc, quadrantTasks) => acc + quadrantTasks.length,
    0
  );
  
  const completedTasks = Object.values(tasks).reduce(
    (acc, quadrantTasks) => acc + quadrantTasks.filter(t => t.completed).length,
    0
  );

  const value = {
    tasks,
    totalTasks,
    completedTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    moveTask,
    clearCompleted,
    resetAll,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// Custom hook
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};