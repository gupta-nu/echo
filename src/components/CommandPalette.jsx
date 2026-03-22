import { Command } from "cmdk";
import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Search,
  Moon,
  Sun,
  Trash2,
  CheckSquare,
  RotateCcw,
  BookOpen,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  ArrowRight,
  Command as CommandIcon,
  Focus,
} from "lucide-react";

const QUADRANT_META = {
  urgentImportant: {
    label: "Do First — Urgent & Important",
    icon: AlertTriangle,
    color: "text-red-500",
    shortLabel: "Do First",
  },
  notUrgentImportant: {
    label: "Schedule — Important, Not Urgent",
    icon: Target,
    color: "text-blue-500",
    shortLabel: "Schedule",
  },
  urgentNotImportant: {
    label: "Delegate — Urgent, Not Important",
    icon: Zap,
    color: "text-amber-500",
    shortLabel: "Delegate",
  },
  notUrgentNotImportant: {
    label: "Eliminate — Not Urgent or Important",
    icon: Clock,
    color: "text-emerald-500",
    shortLabel: "Eliminate",
  },
};

const CommandPalette = ({
  open,
  setOpen,
  tasks,
  isDarkMode,
  onAddTask,
  onToggleDarkMode,
  onClearCompleted,
  onResetAll,
  onToggleNotepad,
  onJumpToQuadrant,
  onUndo,
  onToggleFocusMode,
  canUndo,
  focusMode,
}) => {
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState([]);
  const inputRef = useRef(null);

  const page = pages[pages.length - 1];

  // All tasks flattened for search
  const allTasks = useMemo(() => {
    return Object.entries(tasks).flatMap(([quadrant, items]) =>
      items.map((task) => ({
        ...task,
        quadrant,
        quadrantLabel: QUADRANT_META[quadrant]?.shortLabel || quadrant,
      }))
    );
  }, [tasks]);

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!search) return allTasks.slice(0, 8);
    const q = search.toLowerCase();
    return allTasks.filter(
      (t) =>
        t.text.toLowerCase().includes(q) ||
        t.quadrantLabel.toLowerCase().includes(q)
    );
  }, [allTasks, search]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setPages([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        if (pages.length > 0) {
          setPages((p) => p.slice(0, -1));
        } else {
          setOpen(false);
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, pages, setOpen]);

  const runAction = (fn) => {
    fn();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmdk-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="cmdk-wrapper"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              className={`cmdk-root ${isDarkMode ? "dark" : ""}`}
              shouldFilter={!page}
              loop
            >
              <div className="cmdk-input-wrapper">
                <Search size={16} className="cmdk-input-icon" />
                <Command.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={setSearch}
                  placeholder={
                    page === "add-task"
                      ? "Task name…"
                      : "Type a command or search…"
                  }
                  className="cmdk-input"
                />
                <kbd className="cmdk-badge">ESC</kbd>
              </div>

              <Command.List className="cmdk-list">
                <Command.Empty className="cmdk-empty">
                  No results found.
                </Command.Empty>

                {!page && (
                  <>
                    {/* Quick Actions */}
                    <Command.Group heading="Quick Actions" className="cmdk-group">
                      <Command.Item
                        className="cmdk-item"
                        onSelect={() => setPages([...pages, "add-task"])}
                      >
                        <Plus size={16} />
                        <span>Add New Task…</span>
                        <span className="cmdk-shortcut">⏎</span>
                      </Command.Item>

                      <Command.Item
                        className="cmdk-item"
                        onSelect={() =>
                          runAction(() => onToggleDarkMode())
                        }
                      >
                        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        <span>
                          {isDarkMode
                            ? "Switch to Light Mode"
                            : "Switch to Dark Mode"}
                        </span>
                      </Command.Item>

                      <Command.Item
                        className="cmdk-item"
                        onSelect={() => runAction(() => onToggleFocusMode())}
                      >
                        <Focus size={16} />
                        <span>
                          {focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                        </span>
                      </Command.Item>

                      <Command.Item
                        className="cmdk-item"
                        onSelect={() => runAction(() => onToggleNotepad())}
                      >
                        <BookOpen size={16} />
                        <span>Toggle Quick Notes</span>
                      </Command.Item>

                      {canUndo && (
                        <Command.Item
                          className="cmdk-item"
                          onSelect={() => runAction(() => onUndo())}
                        >
                          <RotateCcw size={16} />
                          <span>Undo Last Action</span>
                          <span className="cmdk-shortcut">⌘Z</span>
                        </Command.Item>
                      )}
                    </Command.Group>

                    {/* Jump to Quadrant */}
                    <Command.Group heading="Jump to Quadrant" className="cmdk-group">
                      {Object.entries(QUADRANT_META).map(
                        ([key, { label, icon: Icon, color }]) => (
                          <Command.Item
                            key={key}
                            className="cmdk-item"
                            onSelect={() =>
                              runAction(() => onJumpToQuadrant(key))
                            }
                          >
                            <Icon size={16} className={color} />
                            <span>{label}</span>
                            <ArrowRight size={14} className="cmdk-item-arrow" />
                          </Command.Item>
                        )
                      )}
                    </Command.Group>

                    {/* Tasks Search */}
                    {filteredTasks.length > 0 && (
                      <Command.Group heading="Tasks" className="cmdk-group">
                        {filteredTasks.map((task) => {
                          const meta = QUADRANT_META[task.quadrant];
                          return (
                            <Command.Item
                              key={task.id}
                              className="cmdk-item"
                              value={`${task.text} ${task.quadrantLabel}`}
                              onSelect={() =>
                                runAction(() => onJumpToQuadrant(task.quadrant))
                              }
                            >
                              {task.completed ? (
                                <CheckSquare
                                  size={16}
                                  className="text-emerald-500"
                                />
                              ) : (
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                                    meta
                                      ? meta.color
                                          .replace("text-", "border-")
                                      : "border-gray-300"
                                  }`}
                                />
                              )}
                              <span
                                className={
                                  task.completed
                                    ? "line-through opacity-50"
                                    : ""
                                }
                              >
                                {task.text}
                              </span>
                              <span className="cmdk-item-badge">
                                {task.quadrantLabel}
                              </span>
                            </Command.Item>
                          );
                        })}
                      </Command.Group>
                    )}

                    {/* Danger Zone */}
                    <Command.Group heading="Manage" className="cmdk-group">
                      <Command.Item
                        className="cmdk-item"
                        onSelect={() => runAction(() => onClearCompleted())}
                      >
                        <CheckSquare size={16} />
                        <span>Clear Completed Tasks</span>
                      </Command.Item>

                      <Command.Item
                        className="cmdk-item cmdk-item-danger"
                        onSelect={() => runAction(() => onResetAll())}
                      >
                        <Trash2 size={16} />
                        <span>Reset All Tasks</span>
                      </Command.Item>
                    </Command.Group>
                  </>
                )}

                {/* Add Task Sub-page */}
                {page === "add-task" && (
                  <Command.Group heading="Select Quadrant" className="cmdk-group">
                    {Object.entries(QUADRANT_META).map(
                      ([key, { label, icon: Icon, color }]) => (
                        <Command.Item
                          key={key}
                          className="cmdk-item"
                          onSelect={() => {
                            if (search.trim()) {
                              onAddTask(key, search.trim());
                              setOpen(false);
                            }
                          }}
                        >
                          <Icon size={16} className={color} />
                          <span>
                            Add to <strong>{label.split("—")[0].trim()}</strong>
                          </span>
                        </Command.Item>
                      )
                    )}
                  </Command.Group>
                )}
              </Command.List>

              <div className="cmdk-footer">
                <div className="cmdk-footer-hint">
                  <kbd>↑↓</kbd> Navigate
                </div>
                <div className="cmdk-footer-hint">
                  <kbd>⏎</kbd> Select
                </div>
                <div className="cmdk-footer-hint">
                  <kbd>esc</kbd> Close
                </div>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
