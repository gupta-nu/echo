import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskProvider, useTasks } from '../context/TaskContext';

// Test component to test the hook
const TestComponent = () => {
  const {
    tasks,
    totalTasks,
    completedTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    clearCompleted,
    resetAll,
  } = useTasks();

  return (
    <div>
      <div data-testid="total-tasks">{totalTasks}</div>
      <div data-testid="completed-tasks">{completedTasks}</div>
      <button
        onClick={() => addTask('urgentImportant', { text: 'Test task' })}
        data-testid="add-task"
      >
        Add Task
      </button>
      <button
        onClick={() => clearCompleted()}
        data-testid="clear-completed"
      >
        Clear Completed
      </button>
      <button onClick={() => resetAll()} data-testid="reset-all">
        Reset All
      </button>
      <div data-testid="tasks">
        {Object.entries(tasks).map(([quadrant, quadrantTasks]) =>
          quadrantTasks.map((task) => (
            <div key={task.id} data-testid={`task-${task.id}`}>
              <span>{task.text}</span>
              <button
                onClick={() => toggleComplete(quadrant, task.id)}
                data-testid={`toggle-${task.id}`}
              >
                {task.completed ? 'Complete' : 'Incomplete'}
              </button>
              <button
                onClick={() => deleteTask(quadrant, task.id)}
                data-testid={`delete-${task.id}`}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const renderWithProvider = (component) => {
  return render(<TaskProvider>{component}</TaskProvider>);
};

describe('TaskContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should add a task', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId('total-tasks')).toHaveTextContent('0');

    await user.click(screen.getByTestId('add-task'));

    await waitFor(() => {
      expect(screen.getByTestId('total-tasks')).toHaveTextContent('1');
    });

    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('should toggle task completion', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestComponent />);

    // Add a task first
    await user.click(screen.getByTestId('add-task'));

    await waitFor(() => {
      expect(screen.getByTestId('total-tasks')).toHaveTextContent('1');
    });

    const toggleButton = screen.getByText('Incomplete');
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByTestId('completed-tasks')).toHaveTextContent('1');
    });

    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('should delete a task', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestComponent />);

    // Add a task first
    await user.click(screen.getByTestId('add-task'));

    await waitFor(() => {
      expect(screen.getByTestId('total-tasks')).toHaveTextContent('1');
    });

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('total-tasks')).toHaveTextContent('0');
    });

    expect(screen.queryByText('Test task')).not.toBeInTheDocument();
  });

  it('should clear completed tasks', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestComponent />);

    // Add and complete a task
    await user.click(screen.getByTestId('add-task'));
    await waitFor(() => {
      expect(screen.getByTestId('total-tasks')).toHaveTextContent('1');
    });

    const toggleButton = screen.getByText('Incomplete');
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByTestId('completed-tasks')).toHaveTextContent('1');
    });

    // Clear completed tasks
    await user.click(screen.getByTestId('clear-completed'));

    await waitFor(() => {
      expect(screen.getByTestId('total-tasks')).toHaveTextContent('0');
    });
  });

  it('should reset all tasks', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestComponent />);

    // Add multiple tasks
    await user.click(screen.getByTestId('add-task'));
    await user.click(screen.getByTestId('add-task'));

    await waitFor(() => {
      expect(screen.getByTestId('total-tasks')).toHaveTextContent('2');
    });

    // Reset all
    await user.click(screen.getByTestId('reset-all'));

    await waitFor(() => {
      expect(screen.getByTestId('total-tasks')).toHaveTextContent('0');
    });
  });

  it('should persist tasks to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestComponent />);

    await user.click(screen.getByTestId('add-task'));

    await waitFor(() => {
      const savedTasks = localStorage.getItem('tasks');
      expect(savedTasks).toBeTruthy();
      const parsedTasks = JSON.parse(savedTasks);
      expect(parsedTasks.urgentImportant).toHaveLength(1);
      expect(parsedTasks.urgentImportant[0].text).toBe('Test task');
    });
  });
});