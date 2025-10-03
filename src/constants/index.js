// Eisenhower Matrix Categories
export const categories = {
  urgentImportant: { 
    title: "Do First - Urgent & Important", 
    color: "bg-red-50 border-red-200",
    description: "Crisis, emergencies, deadline-driven projects",
    priority: 1
  },
  notUrgentImportant: { 
    title: "Schedule - Important, Not Urgent", 
    color: "bg-blue-50 border-blue-200",
    description: "Strategic planning, personal development, prevention",
    priority: 2
  },
  urgentNotImportant: { 
    title: "Delegate - Urgent, Not Important", 
    color: "bg-yellow-50 border-yellow-200",
    description: "Interruptions, some calls/emails, some meetings",
    priority: 3
  },
  notUrgentNotImportant: { 
    title: "Eliminate - Neither Urgent nor Important", 
    color: "bg-green-50 border-green-200",
    description: "Time wasters, some social media, trivial activities",
    priority: 4
  },
};

// Time slots for scheduling
export const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const start = String(i).padStart(2, '0');
  const end = String((i + 1) % 24).padStart(2, '0');
  const periodStart = i < 12 ? 'AM' : 'PM';
  const periodEnd = (i + 1) < 12 ? 'AM' : 'PM';
  const displayHour = i % 12 === 0 ? 12 : i % 12;
  const nextDisplayHour = (i + 1) % 12 === 0 ? 12 : (i + 1) % 12;
  const label = `${displayHour}:00 ${periodStart} - ${nextDisplayHour}:00 ${periodEnd}`;
  
  return { 
    value: `${start}-${end}`, 
    label,
    hour: i,
    displayHour: displayHour,
    period: periodStart
  };
});

// App configuration
export const APP_CONFIG = {
  name: 'Echo',
  version: '1.0.0',
  description: 'A simple and efficient task manager using the Eisenhower Matrix',
  author: 'Your Name',
  repository: 'https://github.com/gupta-nu/echo',
  colors: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  },
  storage: {
    keys: {
      tasks: 'echo_tasks',
      notes: 'echo_notes',
      settings: 'echo_settings',
    },
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  TASKS: 'echo_tasks',
  NOTES: 'echo_notes',
  DARK_MODE: 'echo_dark_mode',
  USER_PREFERENCES: 'echo_preferences',
};

// Animation variants
export const ANIMATION_VARIANTS = {
  slideIn: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
};