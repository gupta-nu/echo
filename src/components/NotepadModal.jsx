import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Save, X, List, AlignLeft, Expand, Minimize2, Clock } from "lucide-react";

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
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentNote, notes]);

  // Save notes on unmount
  useEffect(() => {
    return () => {
      if (currentNote !== notes) {
        setNotes(currentNote);
      }
    };
  }, [currentNote, notes, setNotes]);

  const saveNotes = () => {
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
  };

  const addFormattedText = (format) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentNote.substring(start, end);
    let newText = currentNote;

    switch (format) {
      case 'bullet':
        // Add bullet point at the start of each line in selection
        const bulletText = selectedText
          .split('\n')
          .map(line => (line.trim() ? `• ${line}` : line))
          .join('\n');
        newText = currentNote.substring(0, start) + bulletText + currentNote.substring(end);
        break;
      case 'numbered':
        // Add numbers to each line in selection
        const lines = selectedText.split('\n').filter(line => line.trim());
        const numberedText = lines.map((line, i) => `${i+1}. ${line}`).join('\n');
        newText = currentNote.substring(0, start) + numberedText + currentNote.substring(end);
        break;
      case 'timestamp':
        // Insert current timestamp
        const now = new Date();
        const timestamp = `[${now.toLocaleTimeString()} ${now.toLocaleDateString()}] `;
        newText = currentNote.substring(0, start) + timestamp + currentNote.substring(start);
        break;
      default:
        break;
    }

    setCurrentNote(newText);
    
    // Restore focus to textarea after state update
    setTimeout(() => {
      textarea.focus();
      // Calculate new cursor position
      const newPosition = format === 'timestamp' 
        ? start + `[${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}] `.length
        : end;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 10);
  };

  return (
    <motion.div
      ref={modalRef}
      drag={!isExpanded}
      dragConstraints={{
        left: 0,
        right: windowDimensions.width - (isExpanded ? windowDimensions.width : 400),
        top: 0,
        bottom: windowDimensions.height - (isExpanded ? windowDimensions.height : 600),
      }}
      initial={{ rotateX: 90, opacity: 0 }}
      animate={{ 
        rotateX: 0, 
        opacity: 1,
        width: isExpanded ? "95vw" : "24rem",
        height: isExpanded ? "90vh" : "28rem",
        top: isExpanded ? "5vh" : undefined,
        left: isExpanded ? "2.5vw" : undefined,
        transition: { duration: 0.3 }
      }}
      exit={{ rotateX: -90, opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ 
        transformPerspective: 1000,
        position: "fixed",
        zIndex: 50
      }}
      className="bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col cursor-move"
    >
      <div className="p-2 bg-gray-100 rounded-t-lg flex justify-between items-center cursor-grab">
        <span className="text-xs font-semibold text-black">Quick Notes</span>
        <div className="flex items-center gap-2">
          {savedMessage && (
            <span className="text-xs text-green-600 mr-2">{savedMessage}</span>
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
        <div className="px-2 py-1 bg-gray-50 flex gap-2 border-b border-gray-200">
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
            onClick={() => addFormattedText('timestamp')}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
            title="Insert timestamp"
          >
            <Clock size={12} />
            <span>Time</span>
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
        className="flex-1 p-3 text-xs resize-none focus:outline-none bg-gray-50 rounded-b-lg"
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
        <span>Ctrl+S to save</span>
      </div>
    </motion.div>
  );
};

export default NotepadModal;