import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const NotepadModal = ({ showNotepad, setShowNotepad, notes, setNotes }) => {
  const modalRef = useRef();
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowNotepad(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowNotepad]);

  return (
    <motion.div
      ref={modalRef}
      drag
      dragConstraints={{
        left: 0,
        right: windowDimensions.width - 400, // 400 is the width of the modal (adjust if needed)
        top: 0,
        bottom: windowDimensions.height - 600, // 600 is the height of the modal (adjust if needed)
      }}
      initial={{ rotateX: 90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      exit={{ rotateX: -90, opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ transformPerspective: 1000 }}
      className="fixed w-96 h-[28rem] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50 cursor-move"
    >
      <div className="p-2 bg-gray-100 rounded-t-lg flex justify-between items-center cursor-grab">
        <span className="text-xs font-semibold text-black">Quick Notes</span>
        <button
          onClick={() => setShowNotepad(false)}
          className="text-black hover:text-black text-xs"
        >
          ❌
        </button>
      </div>
      <textarea
        className="flex-1 p-2 text-xs resize-none focus:outline-none bg-gray-50 rounded-b-lg"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot down your thoughts here..."
        autoFocus
      />
    </motion.div>
  );
};

export default NotepadModal;
