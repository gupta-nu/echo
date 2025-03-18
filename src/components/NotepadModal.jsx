import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";

const NotepadModal = ({ showNotepad, setShowNotepad }) => {
  const [dimensions, setDimensions] = useState({ 
    width: Math.min(600, window.innerWidth - 40),
    height: Math.min(600, window.innerHeight - 40)
  });
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [viewMode, setViewMode] = useState("edit");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const resizeRef = useRef(null);
  const modalRef = useRef(null);
  const dragConstraintsRef = useRef(null);

  // Load notes
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    setNotes(savedNotes);
    if (savedNotes.length > 0) setSelectedNote(savedNotes[0].id);
  }, []);

  // Save notes
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Close modal handler
  const handleClose = (e) => {
    e.stopPropagation();
    setShowNotepad(false);
  };

  // Create new note
  const createNewNote = () => {
    const newNote = {
      id: uuidv4(),
      title: "New Note",
      content: "",
      createdAt: new Date().toISOString()
    };
    setNotes([...notes, newNote]);
    setSelectedNote(newNote.id);
  };

  // Update note content
  const updateNote = (id, content) => {
    setNotes(notes.map(note => 
      note.id === id ? { 
        ...note, 
        content, 
        title: content.split("\n")[0]?.slice(0, 50) || "New Note" 
      } : note
    ));
  };

  // Delete note
  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    if (selectedNote === id) setSelectedNote(updatedNotes[0]?.id || null);
  };

  // Resize handlers
  const startResizing = (e) => {
    e.preventDefault();
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
  };

  const resize = (e) => {
    const newWidth = e.clientX - modalRef.current.getBoundingClientRect().left;
    const newHeight = e.clientY - modalRef.current.getBoundingClientRect().top;
    setDimensions({
      width: Math.max(300, newWidth),
      height: Math.max(200, newHeight)
    });
  };

  const stopResizing = () => {
    window.removeEventListener("mousemove", resize);
    window.removeEventListener("mouseup", stopResizing);
  };

  // Markdown preview component
  const MarkdownPreview = ({ content }) => {
    useEffect(() => {
      Prism.highlightAll();
    }, [content]);

    return (
      <div className="p-4 prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-3" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-2" {...props} />,
            p: ({ node, ...props }) => <p className="my-2" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-6" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-6" {...props} />,
            li: ({ node, ...props }) => <li className="my-1" {...props} />,
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={dracula}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-md p-4 my-2"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-100 px-1.5 py-0.5 rounded" {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const currentNote = notes.find(note => note.id === selectedNote);

  return (
    <motion.div
      ref={modalRef}
      drag
      dragElastic={0.05}
      dragMomentum={false}
      dragConstraints={dragConstraintsRef}
      style={{
        position: "fixed",
        width: dimensions.width,
        height: dimensions.height,
        x: position.x,
        y: position.y,
        touchAction: "none"
      }}
      initial={{ rotateX: 90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      exit={{ rotateX: -90, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50"
    >
      {/* Header */}
      <motion.div 
        className="p-2 bg-gray-100 rounded-t-lg flex justify-between items-center cursor-move"
        drag
        onDrag={(e, info) => {
          setPosition({
            x: info.point.x - dimensions.width/2,
            y: info.point.y - 40
          });
        }}
        dragConstraints={dragConstraintsRef}
        dragElastic={0}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-semibold text-black">
            {currentNote?.title || "Quick Notes"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === "edit" ? "preview" : "edit")}
              className="text-black hover:text-blue-600 text-sm px-2 py-1 rounded"
            >
              {viewMode === "edit" ? "Preview" : "Edit"}
            </button>
            <button
              onClick={handleClose}
              className="text-black hover:text-red-600 text-lg font-bold leading-none"
            >
              &times;
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-24 bg-gray-50 border-r border-gray-200 p-2 flex flex-col">
          <button
            onClick={createNewNote}
            className="mb-2 p-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            New
          </button>
          <div className="overflow-y-auto">
            {notes.map(note => (
              <div
                key={note.id}
                className={`p-2 text-sm mb-1 cursor-pointer rounded ${
                  selectedNote === note.id ? "bg-blue-200" : "hover:bg-gray-200"
                }`}
                onClick={() => setSelectedNote(note.id)}
              >
                <div className="truncate">{note.title}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor/Preview */}
        <div className="flex-1 overflow-auto">
          {viewMode === "edit" ? (
            <textarea
              className="w-full h-full p-4 text-base resize-none focus:outline-none bg-white"
              value={currentNote?.content || ""}
              onChange={(e) => selectedNote && updateNote(selectedNote, e.target.value)}
              placeholder="Start writing in Markdown..."
              autoFocus
            />
          ) : currentNote ? (
            <MarkdownPreview content={currentNote.content} />
          ) : (
            <div className="p-4 text-gray-500">Select a note to preview</div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        ref={resizeRef}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-gray-200 rounded-tl"
        onMouseDown={startResizing}
      />
    </motion.div>
  );
};

export default NotepadModal;