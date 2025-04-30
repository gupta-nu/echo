import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  X,
  Expand,
  Minimize2,
  Clock,
  Check,
  Copy,
  RotateCcw
} from "lucide-react";

const NotepadModal = ({ showNotepad, setShowNotepad, notes, setNotes }) => {
  const modalRef = useRef();
  const textareaRef = useRef();
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [currentNote, setCurrentNote] = useState(notes);
  const [undoStack, setUndoStack] = useState([]);
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isExpanded && modalRef.current && !modalRef.current.contains(event.target)) {
        saveNotes();
        setShowNotepad(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowNotepad, isExpanded]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentNote !== notes) {
        saveNotes();
        showSavedMessage();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [currentNote, notes]);

  useEffect(() => {
    return () => {
      if (currentNote !== notes) {
        setNotes(currentNote);
      }
    };
  }, [currentNote, notes, setNotes]);

  const saveNotes = () => {
    setUndoStack((prev) => [...prev, notes]);
    setNotes(currentNote);
    showSavedMessage();
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
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const prevNote = undoStack[undoStack.length - 1];
      setUndoStack((prev) => prev.slice(0, -1));
      setCurrentNote(prevNote);
      setNotes(prevNote);
    }
  };

  const copyToClipboard = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    navigator.clipboard.writeText(currentNote).then(() => {
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
    const newText = currentNote.slice(0, start) + timestamp + currentNote.slice(start);
    setCurrentNote(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + timestamp.length, start + timestamp.length);
    }, 10);
  };

  const handleMouseDown = (e) => {
    if (!isExpanded) {
      setDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
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

  return (
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
        borderRadius: 12,
        overflow: "hidden",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}
      className="bg-white border border-gray-200 flex flex-col"
    >
      <div
        className="p-2 bg-gray-100 flex justify-between items-center cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <div className="flex items-center gap-2">
          {savedMessage && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Check size={12} /> {savedMessage}
            </span>
          )}
          {copied && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <Check size={12} /> Copied!
            </span>
          )}
          <button
            onClick={insertTimestamp}
            className="text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-200"
            title="Insert Timestamp"
          >
            <Clock size={14} />
          </button>
          <button
            onClick={copyToClipboard}
            className="text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-200"
            title="Copy to Clipboard"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleUndo}
            className="text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-200"
            title="Undo"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-200"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Expand size={14} />}
          </button>
          <button
            onClick={() => {
              saveNotes();
              setShowNotepad(false);
            }}
            className="text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-200"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-2 flex flex-col gap-2 h-full">
        <textarea
          ref={textareaRef}
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 w-full resize-none p-3 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Start typing your thoughts..."
        />
      </div>
    </motion.div>
  );
};

export default NotepadModal;
