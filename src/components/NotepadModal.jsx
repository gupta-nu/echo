import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  X,
  Expand,
  Minimize2,
  Clock,
  Check,
  Copy,
  RotateCcw,
  Trash,
  Plus,
  Search,
  Download,
  ExternalLink,
  ChevronLeft,
  Moon,
  Sun,
  AlertTriangle
} from "lucide-react";

const NotepadModal = ({ showNotepad, setShowNotepad, notes, setNotes }) => {
  const modalRef = useRef();
  const textareaRef = useRef();
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [undoStack, setUndoStack] = useState([]);
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Load saved position from localStorage on mount
  useEffect(() => {
    try {
      const savedPosition = localStorage.getItem("notepadPosition");
      if (savedPosition) {
        setPosition(JSON.parse(savedPosition));
      }
      
      const savedDarkMode = localStorage.getItem("notepadDarkMode");
      if (savedDarkMode) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      }
    } catch (error) {
      console.error("Error loading saved notepad state:", error);
    }
    
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save position to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("notepadPosition", JSON.stringify(position));
    } catch (error) {
      console.error("Error saving notepad position:", error);
    }
  }, [position]);

  // Save dark mode preference
  useEffect(() => {
    try {
      localStorage.setItem("notepadDarkMode", JSON.stringify(isDarkMode));
    } catch (error) {
      console.error("Error saving dark mode preference:", error);
    }
  }, [isDarkMode]);

  const saveNotes = () => {
    // Only push to undo stack if there are actual changes
    if (unsavedChanges) {
      setUndoStack((prev) => [...prev.slice(-9), notes[currentNoteIndex]]); // Keep max 10 undo states
      
      try {
        localStorage.setItem("savedNotes", JSON.stringify(notes));
      } catch (error) {
        console.error("Error saving notes:", error);
      }
      
      setUnsavedChanges(false);
      showSavedMessage();
    }
  };

  const showSavedMessage = () => {
    setSavedMessage("Saved!");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      saveNotes();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      handleUndo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      document.getElementById("search-input").focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      setSidebarVisible(prev => !prev);
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const prevNote = undoStack[undoStack.length - 1];
      setUndoStack((prev) => prev.slice(0, -1));
      setNotes((prev) => {
        const updatedNotes = [...prev];
        updatedNotes[currentNoteIndex] = prevNote;
        return updatedNotes;
      });
    }
  };

  const copyToClipboard = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    navigator.clipboard.writeText(notes[currentNoteIndex]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const insertTimestamp = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const now = new Date();
    const timestamp = `[${now.toLocaleTimeString()} ${now.toLocaleDateString()}] `;
    const newText = notes[currentNoteIndex].slice(0, start) + timestamp + notes[currentNoteIndex].slice(start);
    
    updateCurrentNote(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + timestamp.length, start + timestamp.length);
    }, 10);
  };

  const updateCurrentNote = (newContent) => {
    setUnsavedChanges(true);
    setNotes((prev) => {
      const updatedNotes = [...prev];
      updatedNotes[currentNoteIndex] = newContent;
      return updatedNotes;
    });
  };

  const handleMouseDown = (e) => {
    if (!isExpanded && e.target.closest(".drag-handle")) {
      setDragging(true);
      dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, windowDimensions.width - 384));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, windowDimensions.height - 416));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const handleNoteSelection = (index) => {
    // Ask to save changes if there are any
    if (unsavedChanges) {
      if (window.confirm("You have unsaved changes. Save before switching notes?")) {
        saveNotes();
      }
    }
    setCurrentNoteIndex(index);
  };

  const handleDeleteNote = () => {
    const updatedNotes = notes.filter((_, index) => index !== currentNoteIndex);
    
    if (updatedNotes.length === 0) {
      // Create a new blank note if we're deleting the last note
      setNotes(["New Note"]);
      setCurrentNoteIndex(0);
    } else {
      setNotes(updatedNotes);
      setCurrentNoteIndex(Math.min(currentNoteIndex, updatedNotes.length - 1));
    }
    
    try {
      localStorage.setItem("savedNotes", JSON.stringify(updatedNotes.length === 0 ? ["New Note"] : updatedNotes));
    } catch (error) {
      console.error("Error saving notes after deletion:", error);
    }
    
    setShowDeleteConfirmation(false);
  };

  const downloadNotes = () => {
    try {
      const notesString = JSON.stringify(notes, null, 2);
      const blob = new Blob([notesString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = "my_notes.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading notes:", error);
    }
  };

  const createNewNote = () => {
    // Ask to save changes if there are any
    if (unsavedChanges) {
      if (window.confirm("You have unsaved changes. Save before creating a new note?")) {
        saveNotes();
      }
    }
    
    const newNoteTitle = `Note ${notes.length + 1}`;
    setNotes([...notes, ""]);
    setCurrentNoteIndex(notes.length);
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter((note, index) => {
    if (!searchQuery) return true;
    return note.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatNoteTitle = (note, index) => {
    const title = note.trim().split("\n")[0] || `Note ${index + 1}`;
    return title.length > 20 ? title.substring(0, 20) + "..." : title || `Note ${index + 1}`;
  };

  const containerClasses = isDarkMode 
    ? "bg-gray-900 border border-gray-700 flex flex-col"
    : "bg-white border border-gray-200 flex flex-col";

  const headerClasses = isDarkMode
    ? "drag-handle p-3 bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex justify-between items-center cursor-move select-none"
    : "drag-handle p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex justify-between items-center cursor-move select-none";

  const sidebarClasses = isDarkMode
    ? "w-32 bg-gray-800 p-2 rounded-lg overflow-y-auto"
    : "w-32 bg-gray-100 p-2 rounded-lg overflow-y-auto";

  const noteItemClasses = (isActive) => {
    if (isDarkMode) {
      return `p-2 rounded-lg cursor-pointer mb-1 text-sm ${
        isActive ? "bg-blue-900 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
      }`;
    }
    return `p-2 rounded-lg cursor-pointer mb-1 text-sm ${
      isActive ? "bg-blue-200" : "bg-white hover:bg-gray-100"
    }`;
  };

  const textareaClasses = isDarkMode 
    ? "w-full h-full resize-none p-4 border border-gray-700 rounded-2xl bg-gray-800 text-gray-200 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
    : "w-full h-full resize-none p-4 border border-gray-200 rounded-2xl bg-white text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400";

  return (
    <AnimatePresence>
      {showNotepad && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            zIndex: 100,
            width: isExpanded ? "90vw" : "24rem",
            height: isExpanded ? "80vh" : "26rem",
            top: isExpanded ? "10vh" : position.y || "calc(50vh - 13rem)",
            left: isExpanded ? "5vw" : position.x || "calc(50vw - 12rem)",
            borderRadius: 16,
            overflow: "hidden",
            backdropFilter: "blur(24px)",
            boxShadow: isDarkMode 
              ? "0 12px 48px rgba(0,0,0,0.3)" 
              : "0 12px 48px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease",
          }}
          className={containerClasses}
        >
          <div
            className={headerClasses}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (unsavedChanges) {
                    if (window.confirm("You have unsaved changes. Save before closing?")) {
                      saveNotes();
                    }
                  }
                  setShowNotepad(false);
                }}
                className="text-white hover:text-gray-300"
                title="Close"
              >
                <X size={20} />
              </button>
              {!sidebarVisible && (
                <button
                  onClick={() => setSidebarVisible(true)}
                  className="text-white hover:text-gray-300"
                  title="Show Sidebar"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unsavedChanges && (
                <span className="text-xs text-yellow-200 flex items-center gap-1">
                  <AlertTriangle size={12} /> Unsaved
                </span>
              )}
              {savedMessage && (
                <span className="text-xs text-green-200 flex items-center gap-1">
                  <Check size={12} /> {savedMessage}
                </span>
              )}
              {copied && (
                <span className="text-xs text-blue-200 flex items-center gap-1">
                  <Check size={12} /> Copied!
                </span>
              )}
              <button
                onClick={insertTimestamp}
                className="text-white p-1 rounded-full hover:bg-gray-200 hover:text-black"
                title="Insert Timestamp"
              >
                <Clock size={14} />
              </button>
              <button
                onClick={copyToClipboard}
                className="text-white p-1 rounded-full hover:bg-gray-200 hover:text-black"
                title="Copy to Clipboard"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={handleUndo}
                className="text-white p-1 rounded-full hover:bg-gray-200 hover:text-black"
                title="Undo"
                disabled={undoStack.length === 0}
              >
                <RotateCcw size={14} opacity={undoStack.length === 0 ? 0.5 : 1} />
              </button>
              <button
                onClick={saveNotes}
                className={`text-white p-1 rounded-full hover:bg-gray-200 hover:text-black ${unsavedChanges ? "animate-pulse" : ""}`}
                title="Save"
              >
                <Save size={14} />
              </button>
              <button
                onClick={downloadNotes}
                className="text-white p-1 rounded-full hover:bg-gray-200 hover:text-black"
                title="Download Notes"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => setIsDarkMode(prev => !prev)}
                className="text-white p-1 rounded-full hover:bg-gray-200 hover:text-black"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-white p-1 rounded-full hover:bg-gray-200 hover:text-black"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Expand size={14} />}
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {sidebarVisible && (
              <div className={`p-2 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className={sidebarClasses}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={isDarkMode ? "font-semibold text-gray-200" : "font-semibold text-gray-700"}>My Notes</h3>
                    <button
                      onClick={() => setSidebarVisible(false)}
                      className={isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}
                      title="Hide Sidebar"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                  
                  <div className="mb-2">
                    <div className="relative">
                      <input
                        id="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className={isDarkMode 
                          ? "w-full py-1 px-2 pl-6 rounded bg-gray-700 text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                          : "w-full py-1 px-2 pl-6 rounded bg-white text-gray-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                        }
                      />
                      <Search size={12} className={isDarkMode ? "absolute left-2 top-1.5 text-gray-400" : "absolute left-2 top-1.5 text-gray-500"} />
                    </div>
                  </div>
                  
                  <div className="max-h-32 overflow-y-auto mb-2 flex flex-col">
                    {filteredNotes.length > 0 ? (
                      filteredNotes.map((note, index) => (
                        <div
                          key={index}
                          className={noteItemClasses(index === currentNoteIndex)}
                          onClick={() => handleNoteSelection(index)}
                        >
                          {formatNoteTitle(note, index)}
                        </div>
                      ))
                    ) : (
                      <div className={isDarkMode ? "text-sm text-gray-400" : "text-sm text-gray-500"}>No notes found</div>
                    )}
                  </div>
                  
                  <button
                    onClick={createNewNote}
                    className={isDarkMode 
                      ? "w-full mt-2 py-1 px-2 rounded-full bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center gap-1 text-sm"
                      : "w-full mt-2 py-1 px-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center gap-1 text-sm"
                    }
                  >
                    <Plus size={12} /> New Note
                  </button>
                  
                  {notes.length > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className={isDarkMode
                        ? "w-full mt-2 py-1 px-2 rounded-full bg-red-900 hover:bg-red-800 text-white flex items-center justify-center gap-1 text-sm"
                        : "w-full mt-2 py-1 px-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center gap-1 text-sm"
                      }
                    >
                      <Trash size={12} /> Delete Note
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className={`flex-1 p-4 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
              <textarea
                ref={textareaRef}
                value={notes[currentNoteIndex] || ""}
                onChange={(e) => {
                  setUnsavedChanges(true);
                  updateCurrentNote(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className={textareaClasses}
                placeholder="Start typing your thoughts..."
              />
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirmation && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10"
              >
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className={isDarkMode ? "bg-gray-800 p-6 rounded-lg shadow-lg" : "bg-white p-6 rounded-lg shadow-lg"}
                >
                  <p className={isDarkMode ? "text-lg font-semibold text-gray-200" : "text-lg font-semibold text-gray-700"}>
                    Are you sure you want to delete this note?
                  </p>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={handleDeleteNote}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirmation(false)}
                      className={isDarkMode ? "text-gray-400 hover:underline" : "text-gray-500 hover:underline"}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Keyboard shortcuts help tooltip */}
          <div className={`absolute bottom-0 right-0 p-1 cursor-pointer ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            <div className="relative group">
              <ExternalLink size={12} />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 rounded shadow-lg hidden group-hover:block z-20 text-xs" 
                   style={{backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)"}}>
                <p className={isDarkMode ? "font-semibold text-gray-200" : "font-semibold text-gray-700"}>Keyboard Shortcuts:</p>
                <ul className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  <li>Ctrl+S: Save note</li>
                  <li>Ctrl+Z: Undo changes</li>
                  <li>Ctrl+F: Search notes</li>
                  <li>Ctrl+B: Toggle sidebar</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotepadModal;