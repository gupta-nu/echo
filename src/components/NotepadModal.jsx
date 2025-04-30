import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Save, X, List, AlignLeft, Expand, Minimize2, Clock, Check, Copy, RotateCcw } from "lucide-react";

const NotepadModal = ({ showNotepad, setShowNotepad, notes, setNotes }) => {
  const modalRef = useRef();
  const textareaRef = useRef();
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [currentNote, setCurrentNote] = useState(notes);
  const [showFormatting, setShowFormatting] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close modal on outside click only if not expanded
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

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentNote !== notes) {
        saveNotes();
        showSavedMessage();
      }
    }, 10000); // Auto-save every 10 seconds
    
    return () => clearInterval(interval);
  }, [currentNote, notes]);

  // Initialize position in the center
  useEffect(() => {
    if (!isExpanded) {
      setPosition({
        x: (windowDimensions.width / 2) - 192, // 24rem / 2 = 192px
        y: (windowDimensions.height / 2) - 224, // 28rem / 2 = 224px
      });
    }
  }, [isExpanded, windowDimensions]);

  // Save notes on unmount
  useEffect(() => {
    return () => {
      if (currentNote !== notes) {
        setNotes(currentNote);
      }
    };
  }, [currentNote, notes, setNotes]);

  const saveNotes = () => {
    setUndoStack(prev => [...prev, notes]); // Save current state to undo stack
    setNotes(currentNote);
    showSavedMessage();
  };

  const showSavedMessage = () => {
    setSavedMessage("Saved!");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const handleKeyDown = (e) => {
    // Save on Ctrl+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveNotes();
    }
    
    // Undo on Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const prevNote = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setCurrentNote(prevNote);
      setNotes(prevNote);
    }
  };

  const copyToClipboard = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const textToCopy = start !== end 
      ? currentNote.substring(start, end) 
      : currentNote;
      
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const addFormattedText = (format) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentNote.substring(start, end);
    let newText = currentNote;
    let newCursorPos = end;

    setUndoStack(prev => [...prev, currentNote]); // Save current state to undo stack

    switch (format) {
      case 'bullet':
        // Add bullet point at the start of each line in selection
        if (selectedText) {
          const bulletText = selectedText
            .split('\n')
            .map(line => (line.trim() ? `• ${line}` : line))
            .join('\n');
          newText = currentNote.substring(0, start) + bulletText + currentNote.substring(end);
          newCursorPos = start + bulletText.length;
        } else {
          // If no selection, add a bullet point at cursor position
          const lineStart = currentNote.lastIndexOf('\n', start - 1) + 1;
          const lineEnd = currentNote.indexOf('\n', start);
          const currentLine = lineEnd === -1 
            ? currentNote.substring(lineStart) 
            : currentNote.substring(lineStart, lineEnd);
          
          // Only add bullet if line doesn't already start with one
          if (!currentLine.trimStart().startsWith('•')) {
            const indentation = currentLine.length - currentLine.trimStart().length;
            const bulletPoint = '• ';
            
            newText = currentNote.substring(0, lineStart) + 
                     currentLine.substring(0, indentation) + 
                     bulletPoint +
                     currentLine.substring(indentation) +
                     currentNote.substring(lineEnd === -1 ? currentNote.length : lineEnd);
                     
            newCursorPos = lineStart + indentation + bulletPoint.length + currentLine.substring(indentation).length;
          }
        }
        break;
        
      case 'numbered':
        // Add numbers to each line in selection
        if (selectedText) {
          const lines = selectedText.split('\n');
          const numberedText = lines.map((line, i) => 
            line.trim() ? `${i+1}. ${line}` : line
          ).join('\n');
          
          newText = currentNote.substring(0, start) + numberedText + currentNote.substring(end);
          newCursorPos = start + numberedText.length;
        } else {
          // If no selection, check for existing numbered list and continue it
          const lineStart = currentNote.lastIndexOf('\n', start - 1) + 1;
          const prevLineStart = currentNote.lastIndexOf('\n', lineStart - 2) + 1;
          
          if (prevLineStart >= 0 && lineStart > prevLineStart) {
            const prevLine = currentNote.substring(prevLineStart, lineStart - 1);
            const numberMatch = prevLine.match(/^\s*(\d+)\.\s/);
            
            if (numberMatch) {
              const nextNumber = parseInt(numberMatch[1]) + 1;
              const indentation = prevLine.length - prevLine.trimStart().length;
              const numberPrefix = `${nextNumber}. `;
              
              newText = currentNote.substring(0, start) + 
                       ' '.repeat(indentation) + 
                       numberPrefix +
                       currentNote.substring(start);
                       
              newCursorPos = start + indentation + numberPrefix.length;
            } else {
              // Start a new list at 1
              newText = currentNote.substring(0, start) + "1. " + currentNote.substring(start);
              newCursorPos = start + 3;
            }
          } else {
            // Start a new list at 1
            newText = currentNote.substring(0, start) + "1. " + currentNote.substring(start);
            newCursorPos = start + 3;
          }
        }
        break;
        
      case 'timestamp':
        // Insert current timestamp
        const now = new Date();
        const timestamp = `[${now.toLocaleTimeString()} ${now.toLocaleDateString()}] `;
        newText = currentNote.substring(0, start) + timestamp + currentNote.substring(start);
        newCursorPos = start + timestamp.length;
        break;
        
      case 'checkbox':
        // Add checkbox (unchecked)
        if (selectedText) {
          const checkboxText = selectedText
            .split('\n')
            .map(line => (line.trim() ? `[ ] ${line}` : line))
            .join('\n');
          newText = currentNote.substring(0, start) + checkboxText + currentNote.substring(end);
          newCursorPos = start + checkboxText.length;
        } else {
          newText = currentNote.substring(0, start) + "[ ] " + currentNote.substring(start);
          newCursorPos = start + 4;
        }
        break;
        
      case 'checked':
        // Add checkbox (checked)
        if (selectedText) {
          const checkboxText = selectedText
            .split('\n')
            .map(line => (line.trim() ? `[x] ${line}` : line))
            .join('\n');
          newText = currentNote.substring(0, start) + checkboxText + currentNote.substring(end);
          newCursorPos = start + checkboxText.length;
        } else {
          newText = currentNote.substring(0, start) + "[x] " + currentNote.substring(start);
          newCursorPos = start + 4;
        }
        break;
        
      default:
        break;
    }

    setCurrentNote(newText);
    
    // Restore focus to textarea after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const dragConstraints = isExpanded ? false : {
    left: -(windowDimensions.width - 400),
    right: windowDimensions.width - 100,
    top: -50,
    bottom: windowDimensions.height - 100,
  };

  return (
    <motion.div
      ref={modalRef}
      drag={!isExpanded}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      dragElastic={0}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1,
        y: 0,
        width: isExpanded ? "95vw" : "24rem",
        height: isExpanded ? "90vh" : "28rem",
        top: isExpanded ? "5vh" : undefined,
        left: isExpanded ? "2.5vw" : undefined,
        transition: { duration: 0.3 }
      }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      style={{ 
        position: "fixed",
        zIndex: 50,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden"
      }}
      className="bg-white border border-gray-200 flex flex-col"
    >
      <div 
        className={`p-2 bg-gray-100 flex justify-between items-center ${!isDragging ? "cursor-grab" : "cursor-grabbing"}`}
        onDoubleClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-black ml-2">Quick Notes</span>
        </div>
        <div className="flex items-center gap-2">
          {savedMessage && (
            <span className="text-xs text-green-600 mr-2 flex items-center gap-1">
              <Check size={12} />
              {savedMessage}
            </span>
          )}
          {copied && (
            <span className="text-xs text-blue-600 mr-2 flex items-center gap-1">
              <Check size={12} />
              Copied!
            </span>
          )}
          <button
            onClick={() => setShowFormatting(!showFormatting)}
            className="text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-200"
            title="Formatting options"
          >
            <AlignLeft size={14} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
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
      
      {showFormatting && (
        <div className="px-2 py-1 bg-gray-50 flex flex-wrap gap-2 border-b border-gray-200">
          <button
            onClick={() => addFormattedText('bullet')}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
            title="Add bullet points"
          >
            <List size={12} />
            <span>Bullets</span>
          </button>
          <button
            onClick={() => addFormattedText('numbered')}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
            title="Add numbered list"
          >
            <span className="font-semibold">1.</span>
            <span>Numbers</span>
          </button>
          <button
            onClick={() => addFormattedText('checkbox')}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
            title="Add checkbox"
          >
            <span className="font-mono">[ ]</span>
            <span>Checkbox</span>
          </button>
          <button
            onClick={() => addFormattedText('timestamp')}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
            title="Insert timestamp"
          >
            <Clock size={12} />
            <span>Time</span>
          </button>
          <button
            onClick={copyToClipboard}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
            title="Copy to clipboard"
          >
            <Copy size={12} />
            <span>Copy</span>
          </button>
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
              undoStack.length > 0 
                ? "bg-gray-200 hover:bg-gray-300" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={12} />
            <span>Undo</span>
          </button>
          <button
            onClick={saveNotes}
            className="text-xs px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded flex items-center gap-1 ml-auto"
            title="Save notes (Ctrl+S)"
          >
            <Save size={12} />
            <span>Save</span>
          </button>
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        className="flex-1 p-3 text-xs resize-none focus:outline-none bg-gray-50"
        value={currentNote}
        onChange={(e) => setCurrentNote(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Jot down your thoughts here..."
        style={{
          lineHeight: "1.5",
          fontFamily: "monospace"
        }}
        autoFocus
      />
      
      <div className="p-2 bg-gray-50 text-xs text-gray-400 border-t border-gray-200 flex justify-between items-center">
        <span>{currentNote.length} characters</span>
        <div className="flex gap-3">
          <span>Ctrl+S: Save</span>
          <span>Ctrl+Z: Undo</span>
        </div>
      </div>
    </motion.div>
  );
};

export default NotepadModal;